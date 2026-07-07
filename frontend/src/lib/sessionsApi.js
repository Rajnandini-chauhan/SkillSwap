import { request } from './api'

export const sessionsApi = {
  start: async (courseId) => {
    const { data } = await request('/sessions/start', {
      method: 'POST',
      body: { courseId },
    })
    return data.session
  },

  end: async (sessionId, { durationMinutes, pomodorosCompleted, completed }) => {
    const { data } = await request(`/sessions/${sessionId}/end`, {
      method: 'PATCH',
      body: { durationMinutes, pomodorosCompleted, completed },
    })
    return data
  },

  getStats: async () => {
    const { data } = await request('/sessions/stats')
    return data.stats
  },

  getMy: async () => {
    const { data } = await request('/sessions/my')
    return data.sessions
  },
}
