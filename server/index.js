import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  clearSessionCookie,
  createSession,
  getSessionContext,
  hashPassword,
  normalizeEmail,
  publicUser,
  requireAuth,
  sessionCookieName,
  setSessionCookie,
  validatePassword,
  verifyPassword,
} from './auth.js'
import { updateStore } from './store.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
  const context = await getSessionContext(req)
  res.json({
    sessions: context
      ? [{
        id: context.session.id,
        userAgent: context.session.userAgent,
        ip: context.session.ip,
        lastSeenAt: context.session.lastSeenAt,
        current: true,
      }]
      : [],
  })
})

app.use(express.static(distDir))
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`InEx Ledger API listening on http://localhost:${port}`)
})
