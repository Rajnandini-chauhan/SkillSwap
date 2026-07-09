import { request } from './api'

export const quizApi = {
  start: async ({ courseId, notes }) => {
    const { data } = await request('/quiz/start', {
      method: 'POST',
      body: { courseId, notes },
    })
    return data
  },

  getSession: async (sessionId) => {
    if (!sessionId) throw new Error('Quiz session ID is required')
    const { data } = await request(`/quiz/${sessionId}`)
    return data
  },

  submitAnswer: async ({ sessionId, answer }) => {
    if (!sessionId) throw new Error('Quiz session ID is required')
    if (typeof answer !== 'string' || !answer.trim()) {
      throw new Error('Please write an answer first')
    }
    const { data } = await request(`/quiz/${sessionId}/answer`, {
      method: 'POST',
      body: { answer: answer.trim() },
    })
    return data
  },

  generateFollowUp: async (sessionId) => {
    if (!sessionId) throw new Error('Quiz session ID is required')
    const { data } = await request(`/quiz/${sessionId}/follow-up`, { method: 'POST' })
    return data
  },
}