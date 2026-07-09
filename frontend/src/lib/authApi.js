import { request, rawRequest, setAccessToken } from './api'

export const authApi = {
  register: ({ name, email, password }) =>
    request('/auth/register', { method: 'POST', body: { name, email, password }, skipAuth: true }),

  login: async ({ email, password }) => {
    const { data } = await request('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true })
    setAccessToken(data.accessToken)
    return data.user
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' })
    } finally {
      setAccessToken(null)
    }
  },

  getMe: async () => {
    const { data } = await request('/auth/me')
    return data.user
  },

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