import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { readStore, updateStore } from './store.js'

export const sessionCookieName = 'inex_session'

const sessionMaxAgeMs = 1000 * 60 * 60 * 24 * 30

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function publicUser(user, business = null) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    emailVerified: user.emailVerified,
    tier: user.tier || 'free',
    currentBusinessId: user.currentBusinessId || null,
    business,
  }
}

export function setSessionCookie(res, token) {
  res.cookie(sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionMaxAgeMs,
    path: '/',
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(sessionCookieName, { path: '/' })
}

export async function createSession(userId, req) {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs).toISOString()

  await updateStore((store) => {
    store.sessions.push({
      id: crypto.randomUUID(),
      userId,
      tokenHash,
      createdAt: now,
      lastSeenAt: now,
      expiresAt,
      userAgent: req.get('user-agent') || 'Unknown device',
      ip: req.ip,
    })
  })

  return token
}

export async function getSessionContext(req) {
  const token = req.cookies?.[sessionCookieName]
  if (!token) {
    return null
  }

  const tokenHash = hashToken(token)
  const store = await readStore()
  const session = store.sessions.find((item) => item.tokenHash === tokenHash)
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    return null
  }

  const user = store.users.find((item) => item.id === session.userId)
  if (!user) {
    return null
  }

  const business = user.currentBusinessId
    ? store.businesses.find((item) => item.id === user.currentBusinessId) || null
    : null

  return { user, session, business }
}

export async function requireAuth(req, res, next) {
  const context = await getSessionContext(req)
  if (!context) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  req.auth = context
  next()
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

export function validatePassword(password) {
  if (String(password || '').length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return ''
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
