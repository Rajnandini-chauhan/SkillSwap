const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Access token is kept in memory only.
// The refresh token remains inside the backend-created httpOnly cookie.
let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// Performs one JSON request to the backend.
async function rawRequest(
  path,
  {
    method = 'GET',
    body,
    skipAuth = false,
  } = {}
) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    // Some successful responses may not contain a body.
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed (${response.status})`
    )

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}

// Automatically tries to refresh the access token once after a 401.
async function request(path, options = {}) {
  try {
    return await rawRequest(path, options)
  } catch (error) {
    const shouldRefresh =
      error.status === 401 &&
      !options.skipAuth &&
      path !== '/auth/refresh'

    if (!shouldRefresh) {
      throw error
    }

    try {
      const { data } = await rawRequest('/auth/refresh', {
        method: 'POST',
        skipAuth: true,
      })

      setAccessToken(data.accessToken)

      return await rawRequest(path, options)

    } catch (refreshError) {

      setAccessToken(null)

      // Redirect user to login
      window.location.replace('/login')

      return;
    }
  }
}

// Authentication API
export const authApi = {
  register: ({ name, email, password }) =>
    request('/auth/register', {
      method: 'POST',
      body: {
        name,
        email,
        password,
      },
      skipAuth: true,
    }),

  login: async ({ email, password }) => {
    const { data } = await request('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
      skipAuth: true,
    })

    setAccessToken(data.accessToken)

    return data.user
  },

  logout: async () => {
    try {
      await request('/auth/logout', {
        method: 'POST',
      })
    } finally {
      setAccessToken(null)
    }
  },

  getMe: async () => {
    const { data } = await request('/auth/me')
    return data.user
  },

  // Restores the logged-in session after a browser refresh.
  restoreSession: async () => {
    try {
      const { data } = await rawRequest('/auth/refresh', {
        method: 'POST',
        skipAuth: true,
      })

      setAccessToken(data.accessToken)

      const { data: meData } = await rawRequest('/auth/me')

      return meData.user
    } catch {
      setAccessToken(null)
      return null
    }
  },

  verifyEmail: (token) =>
    request(`/auth/verify-email/${token}`, {
      skipAuth: true,
    }),

  resendVerification: (email) =>
    request('/auth/resend-verification', {
      method: 'POST',
      body: {
        email,
      },
      skipAuth: true,
    }),
}

// Notes API
export const notesApi = {
  // Uploads a PDF and returns extracted text.
  // FormData must not use the JSON request helper because the browser
  // automatically creates the multipart boundary.
  extractPdf: async (file) => {
    const formData = new FormData()
    formData.append('pdf', file)

    const headers = {}

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(
      `${API_URL}/notes/extract-pdf`,
      {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      }
    )

    let data = null

    try {
      data = await response.json()
    } catch {
      // Response may contain an empty body.
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          `Request failed (${response.status})`
      )

      error.status = response.status
      error.data = data

      throw error
    }

    return data.data
  },
}

// Quiz API
export const quizApi = {
  // Creates a new quiz session and generates five basic questions.
  // The backend returns only the first active question.
  start: async ({ courseId, notes }) => {
    const { data } = await request('/quiz/start', {
      method: 'POST',
      body: {
        courseId,
        notes,
      },
    })

    return data
  },

  // Restores an existing quiz session after refreshing the browser.
  getSession: async (sessionId) => {
    if (!sessionId) {
      throw new Error('Quiz session ID is required')
    }

    const { data } = await request(
      `/quiz/${sessionId}`
    )

    return data
  },

  // Sends an answer for the current basic or follow-up question.
  // The backend checks the answer with Gemini and decides whether
  // the user can continue or must retry.
  submitAnswer: async ({
    sessionId,
    answer,
  }) => {
    if (!sessionId) {
      throw new Error('Quiz session ID is required')
    }

    if (
      typeof answer !== 'string' ||
      !answer.trim()
    ) {
      throw new Error('Please write an answer first')
    }

    const { data } = await request(
      `/quiz/${sessionId}/answer`,
      {
        method: 'POST',
        body: {
          answer: answer.trim(),
        },
      }
    )

    return data
  },

  // Generates the first or next follow-up question.
  // The backend permits this only after all five basic answers
  // have been marked correct.
  generateFollowUp: async (sessionId) => {
    if (!sessionId) {
      throw new Error('Quiz session ID is required')
    }

    const { data } = await request(
      `/quiz/${sessionId}/follow-up`,
      {
        method: 'POST',
      }
    )

    return data
  },
}

export function getGreeting() {
  const hour = new Date().getHours()

  return hour < 12
    ? 'morning'
    : hour < 18
      ? 'afternoon'
      : 'evening'
}