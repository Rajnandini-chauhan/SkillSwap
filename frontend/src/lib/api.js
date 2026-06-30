const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Access token is kept in memory only (never localStorage) — the refresh
// token lives in an httpOnly cookie set by the backend, so a page refresh
// re-derives a new access token via /auth/refresh instead of reading storage.
let accessToken = null
export function setAccessToken(token) { accessToken = token }
export function getAccessToken() { return accessToken }

// Internal: performs a single request to the backend.
async function rawRequest(path, { method = 'GET', body, skipAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (!skipAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // sends/receives the httpOnly refreshToken cookie
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try { data = await res.json() } catch { /* empty body, e.g. 204 */ }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

// Wraps rawRequest with one automatic retry-after-refresh on a 401, so
// callers never have to think about token expiry themselves.
async function request(path, options = {}) {
  try {
    return await rawRequest(path, options)
  } catch (error) {
    if (error.status === 401 && !options.skipAuth && path !== '/auth/refresh') {
      try {
        const { data } = await rawRequest('/auth/refresh', { method: 'POST', skipAuth: true })
        setAccessToken(data.accessToken)
        return await rawRequest(path, options)
      } catch {
        setAccessToken(null)
        throw error
      }
    }
    throw error
  }
}

export const authApi = {
  register: ({ name, email, password }) =>
    request('/auth/register', { method: 'POST', body: { name, email, password }, skipAuth: true }),

  login: async ({ email, password }) => {
    const { data } = await request('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true })
    setAccessToken(data.accessToken)
    return data.user
  },

  logout: async () => {
    try { await request('/auth/logout', { method: 'POST' }) } finally { setAccessToken(null) }
  },

  getMe: async () => {
    const { data } = await request('/auth/me')
    return data.user
  },

  // Tries to silently restore a session on app load using the refreshToken
  // cookie. Returns the user, or null if there's no valid session.
  restoreSession: async () => {
    try {
      const { data } = await rawRequest('/auth/refresh', { method: 'POST', skipAuth: true })
      setAccessToken(data.accessToken)
      const { data: meData } = await rawRequest('/auth/me')
      return meData.user
    } catch {
      setAccessToken(null)
      return null
    }
  },

  verifyEmail: (token) => request(`/auth/verify-email/${token}`, { skipAuth: true }),

  resendVerification: (email) =>
    request('/auth/resend-verification', { method: 'POST', body: { email }, skipAuth: true }),
}

export async function callGemini(prompt, maxTokens = 1000) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Gemini API error ${response.status}: ${err?.error?.message || 'unknown'}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
