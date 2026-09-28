import { request } from './api'

export const reflectionsApi = {
  // Creates this week's reflection. Backend enforces one per user per week.
  create: async ({ learned, difficult, nextWeekGoal, mood }) => {
    const { data } = await request('/reflections', {
      method: 'POST',
      body: { learned, difficult, nextWeekGoal, mood },
    })
    return data.reflection
  },

  getMy: async () => {
    const { data } = await request('/reflections/my')
    return data.reflections
  },

  getById: async (id) => {
    const { data } = await request(`/reflections/${id}`)
    return data.reflection
  },

  update: async (id, updates) => {
    const { data } = await request(`/reflections/${id}`, {
      method: 'PATCH',
      body: updates,
    })
    return data.reflection
  },

  remove: (id) =>
    request(`/reflections/${id}`, { method: 'DELETE' }),
}