import { request, requestFormData } from './api'

export const notesApi = {
  // Uploads a PDF and returns extracted text.
  extractPdf: async (file) => {
    const formData = new FormData()
    formData.append('pdf', file)
    const data = await requestFormData('/notes/extract-pdf', formData)
    return data.data
  },

  // Saves the user's notes for a session (backend: POST /api/notes/save)
  save: async ({ courseId, content, source = 'typed' }) => {
    const { data } = await request('/notes/save', {
      method: 'POST',
      body: { courseId, content, source },
    })
    return data.note
  },
}