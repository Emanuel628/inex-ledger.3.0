import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  clearSessionCookie,
  createSession,
  createOneTimeCode,
  getSessionContext,
  getCurrentTokenHash,
  hashValue,
  hashPassword,
  normalizeEmail,
  publicUser,
  requireAuth,
  sessionCookieName,
  setSessionCookie,
  validatePassword,
  verifyPassword,
} from './auth.js'
import { readStore, updateStore } from './store.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '..', 'dist')

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/auth/me', async (req, res) => {
  const context = await getSessionContext(req)
  if (!context) {
    res.json({ user: null })
    return
  }

  res.json({ user: publicUser(context.user, context.business) })
})

app.post('/api/auth/register', async (req, res) => {
  const firstName = String(req.body?.firstName || '').trim()
  const lastName = String(req.body?.lastName || '').trim()
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password || '')
  const acceptedTerms = Boolean(req.body?.acceptedTerms)

  if (!firstName || !lastName || !email || !email.includes('@')) {
    res.status(400).json({ error: 'Enter a name and valid email.' })
    return
  }

  if (!acceptedTerms) {
    res.status(400).json({ error: 'Accept the Terms and Privacy Policy to continue.' })
    return
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    res.status(400).json({ error: passwordError })
    return
  }

  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()

  const result = await updateStore((store) => {
    if (store.users.some((user) => user.email === email)) {
      return { error: 'An account with this email already exists.' }
    }

    const user = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email,
      passwordHash,
      emailVerified: false,
      tier: 'free',
      currentBusinessId: null,
      createdAt: now,
      updatedAt: now,
    }
    store.users.push(user)
    return { user }
  })

  if (result.error) {
    res.status(409).json({ error: result.error })
    return
  }

  const token = await createSession(result.user.id, req)
  setSessionCookie(res, token)
  res.status(201).json({ user: publicUser(result.user) })
})

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password || '')

  const result = await updateStore(async (store) => {
    const user = store.users.find((item) => item.email === email)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: 'Invalid email or password.' }
    }

    user.updatedAt = new Date().toISOString()
    const business = user.currentBusinessId
      ? store.businesses.find((item) => item.id === user.currentBusinessId) || null
      : null

    return { user, business }
  })

  if (result.error) {
    res.status(401).json({ error: result.error })
    return
  }

  const token = await createSession(result.user.id, req)
  setSessionCookie(res, token)
  res.json({ user: publicUser(result.user, result.business) })
})

app.post('/api/auth/logout', async (req, res) => {
  const token = req.cookies?.[sessionCookieName]
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    await updateStore((store) => {
      store.sessions = store.sessions.filter((session) => session.tokenHash !== tokenHash)
    })
  }

  clearSessionCookie(res)
  res.json({ ok: true })
})

app.post('/api/auth/forgot-password', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const code = createOneTimeCode()
  const codeHash = hashValue(code)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 20).toISOString()
  let codeForDev = null

  await updateStore((store) => {
    const user = store.users.find((item) => item.email === email)
    if (!user) {
      return
    }

    store.passwordResetTokens = store.passwordResetTokens.filter((token) => token.userId !== user.id)
    store.passwordResetTokens.push({
      id: crypto.randomUUID(),
      userId: user.id,
      codeHash,
      expiresAt,
      createdAt: new Date().toISOString(),
    })
    codeForDev = code
  })

  res.json({
    ok: true,
    message: 'If the account exists, a reset code was created.',
    resetCode: process.env.NODE_ENV === 'production' ? undefined : codeForDev,
  })
})

app.post('/api/auth/reset-password', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const code = String(req.body?.code || '').trim()
  const password = String(req.body?.password || '')
  const passwordError = validatePassword(password)

  if (passwordError) {
    res.status(400).json({ error: passwordError })
    return
  }

  const passwordHash = await hashPassword(password)
  const result = await updateStore((store) => {
    const user = store.users.find((item) => item.email === email)
    const resetToken = user
      ? store.passwordResetTokens.find((token) => token.userId === user.id && token.codeHash === hashValue(code))
      : null

    if (!user || !resetToken || new Date(resetToken.expiresAt).getTime() <= Date.now()) {
      return { error: 'Invalid or expired reset code.' }
    }

    user.passwordHash = passwordHash
    user.updatedAt = new Date().toISOString()
    store.passwordResetTokens = store.passwordResetTokens.filter((token) => token.id !== resetToken.id)
    store.sessions = store.sessions.filter((session) => session.userId !== user.id)
    return { ok: true }
  })

  if (result.error) {
    res.status(400).json({ error: result.error })
    return
  }

  res.json({ ok: true })
})

app.post('/api/auth/change-email/request', requireAuth, async (req, res) => {
  const newEmail = normalizeEmail(req.body?.newEmail)
  const password = String(req.body?.password || '')
  const code = createOneTimeCode()
  const codeHash = hashValue(code)
  let codeForDev = null

  if (!newEmail || !newEmail.includes('@')) {
    res.status(400).json({ error: 'Enter a valid new email.' })
    return
  }

  const result = await updateStore(async (store) => {
    if (store.users.some((user) => user.email === newEmail)) {
      return { error: 'That email is already in use.' }
    }

    const user = store.users.find((item) => item.id === req.auth.user.id)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: 'Password confirmation failed.' }
    }

    store.emailChangeTokens = store.emailChangeTokens.filter((token) => token.userId !== user.id)
    store.emailChangeTokens.push({
      id: crypto.randomUUID(),
      userId: user.id,
      newEmail,
      codeHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
      createdAt: new Date().toISOString(),
    })
    codeForDev = code
    return { ok: true }
  })

  if (result.error) {
    res.status(400).json({ error: result.error })
    return
  }

  res.json({
    ok: true,
    message: 'Verification code created.',
    verificationCode: process.env.NODE_ENV === 'production' ? undefined : codeForDev,
  })
})

app.post('/api/auth/change-email/confirm', requireAuth, async (req, res) => {
  const code = String(req.body?.code || '').trim()
  const result = await updateStore((store) => {
    const user = store.users.find((item) => item.id === req.auth.user.id)
    const changeToken = user
      ? store.emailChangeTokens.find((token) => token.userId === user.id && token.codeHash === hashValue(code))
      : null

    if (!user || !changeToken || new Date(changeToken.expiresAt).getTime() <= Date.now()) {
      return { error: 'Invalid or expired verification code.' }
    }

    user.email = changeToken.newEmail
    user.emailVerified = true
    user.updatedAt = new Date().toISOString()
    store.emailChangeTokens = store.emailChangeTokens.filter((token) => token.id !== changeToken.id)
    const business = user.currentBusinessId
      ? store.businesses.find((item) => item.id === user.currentBusinessId) || null
      : null
    return { user, business }
  })

  if (result.error) {
    res.status(400).json({ error: result.error })
    return
  }

  res.json({ user: publicUser(result.user, result.business) })
})

app.post('/api/auth/verify-email', requireAuth, async (req, res) => {
  const result = await updateStore((store) => {
    const user = store.users.find((item) => item.id === req.auth.user.id)
    if (!user) {
      return { error: 'User not found.' }
    }

    user.emailVerified = true
    user.updatedAt = new Date().toISOString()
    const business = user.currentBusinessId
      ? store.businesses.find((item) => item.id === user.currentBusinessId) || null
      : null

    return { user, business }
  })

  if (result.error) {
    res.status(404).json({ error: result.error })
    return
  }

  res.json({ user: publicUser(result.user, result.business) })
})

app.post('/api/businesses', requireAuth, async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const type = String(req.body?.type || 'llc')
  const currency = String(req.body?.currency || 'usd').toUpperCase()

  if (!name) {
    res.status(400).json({ error: 'Business name is required.' })
    return
  }

  const result = await updateStore((store) => {
    const user = store.users.find((item) => item.id === req.auth.user.id)
    if (!user) {
      return { error: 'User not found.' }
    }

    const business = {
      id: crypto.randomUUID(),
      ownerUserId: user.id,
      name,
      type,
      currency,
      tier: 'free',
      createdAt: new Date().toISOString(),
    }

    store.businesses.push(business)
    user.currentBusinessId = business.id
    user.tier = user.tier || 'free'
    user.updatedAt = new Date().toISOString()
    return { user, business }
  })

  if (result.error) {
    res.status(404).json({ error: result.error })
    return
  }

  res.status(201).json({ user: publicUser(result.user, result.business) })
})

app.get('/api/auth/sessions', requireAuth, async (req, res) => {
  const currentTokenHash = getCurrentTokenHash(req)
  const store = await readStore()
  res.json({
    sessions: store.sessions
      .filter((session) => session.userId === req.auth.user.id && new Date(session.expiresAt).getTime() > Date.now())
      .map((session) => ({
        id: session.id,
        userAgent: session.userAgent,
        ip: session.ip,
        createdAt: session.createdAt,
        lastSeenAt: session.lastSeenAt,
        expiresAt: session.expiresAt,
        current: session.tokenHash === currentTokenHash,
      })),
  })
})

app.delete('/api/auth/sessions/:sessionId', requireAuth, async (req, res) => {
  const currentTokenHash = getCurrentTokenHash(req)
  const sessionId = req.params.sessionId
  const result = await updateStore((store) => {
    const session = store.sessions.find((item) => item.id === sessionId && item.userId === req.auth.user.id)
    if (!session) {
      return { error: 'Session not found.' }
    }

    if (session.tokenHash === currentTokenHash) {
      return { error: 'Use sign out to end the current session.' }
    }

    store.sessions = store.sessions.filter((item) => item.id !== sessionId)
    return { ok: true }
  })

  if (result.error) {
    res.status(400).json({ error: result.error })
    return
  }

  res.json({ ok: true })
})

app.delete('/api/auth/sessions', requireAuth, async (req, res) => {
  const currentTokenHash = getCurrentTokenHash(req)
  await updateStore((store) => {
    store.sessions = store.sessions.filter((session) => (
      session.userId !== req.auth.user.id || session.tokenHash === currentTokenHash
    ))
  })

  res.json({ ok: true })
})

app.use(express.static(distDir))
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

if (process.argv[1] === __filename) {
  app.listen(port, () => {
    console.log(`InEx Ledger API listening on http://localhost:${port}`)
  })
}

export default app
