const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export async function rawRequest(path, { method = 'GET', body, skipAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (!skipAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try { data = await response.json() } catch { /* empty body */ }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`)
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}

export async function request(path, options = {}) {
  try {
    return await rawRequest(path, options)
  } catch (error) {
    const shouldRefresh = error.status === 401 && !options.skipAuth && path !== '/auth/refresh'
    if (!shouldRefresh) throw error

    try {
      const { data } = await rawRequest('/auth/refresh', { method: 'POST', skipAuth: true })
      setAccessToken(data.accessToken)
      return await rawRequest(path, options)
    } catch {
      setAccessToken(null)
      window.location.replace('/login')
      return
    }
  }
}

// For multipart/form-data uploads (kept separate — FormData must not be JSON-encoded)
export async function requestFormData(path, formData) {
  const headers = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  })

  let data = null
  try { data = await response.json() } catch { /* empty body */ }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`)
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}