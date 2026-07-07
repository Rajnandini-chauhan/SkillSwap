import { request } from './api'

export const usersApi = {
  setup: ({ bio, skillsTeach, skillsLearn }) =>
    request('/users/setup', {
      method: 'PATCH',
      body: { bio, skillsTeach, skillsLearn },
    }),

  getById: async (userId) => {
    const { data } = await request(`/users/${userId}`)
    return data.user
  },
}
