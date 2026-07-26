export type AuthBusiness = {
  id: string
  name: string
  type: string
  currency: string
  tier: string
}

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
  tier: 'free' | 'pro' | 'business'
  currentBusinessId: string | null
  business: AuthBusiness | null
}

type AuthResponse = {
  user: AuthUser | null
  error?: string
}

export async function getCurrentUser() {
  return authRequest<AuthResponse>('/api/auth/me')
}

export async function loginUser(email: string, password: string) {
  return authRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerUser(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  acceptedTerms: boolean
}) {
  return authRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function logoutUser() {
  return authRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}

export async function verifyEmail() {
  return authRequest<AuthResponse>('/api/auth/verify-email', { method: 'POST' })
}

export async function createBusiness(input: { name: string; type: string; currency: string }) {
  return authRequest<AuthResponse>('/api/businesses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

async function authRequest<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    ...init,
  })
  const data = await response.json() as T & { error?: string }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.')
  }

  return data
}
