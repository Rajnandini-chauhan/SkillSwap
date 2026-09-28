import { request } from './api'

export const dashboardApi = {
  /**
   * Fetches the primary dashboard data, including user statistics
   * and their current course progress.
   */
  getSummary: async () => {
    const data = await request('/dashboard/summary')
    return data
  },
}
