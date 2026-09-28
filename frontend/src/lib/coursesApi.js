import { request } from './api'

export const coursesApi = {
  /**
   * Searches for courses via the backend YouTube integration.
   * @param {string} query - The search term entered by the user.
   * @returns {Promise<Array>} - A list of video courses.
   */
  search: async (query) => {
    const data = await request(`/courses/search?q=${encodeURIComponent(query)}`)
    return data.data
  },

  getById: async (id) => {
    const data = await request(`/courses/${encodeURIComponent(id)}`)
    return data.data
  },

  /**
   * Enrolls a user in a course by importing it to the database if it doesn't exist.
   * @param {Object} courseData - The course details from YouTube.
   * @returns {Promise<Object>} - The saved course object from the DB.
   */
  enroll: async (courseData) => {
    // REMOVE JSON.stringify here!
    // The request() helper in api.js already handles the stringification.
    const data = await request(`/courses/enroll`, {
      method: 'POST',
      body: courseData,
    })
    return data.data
  },
}
