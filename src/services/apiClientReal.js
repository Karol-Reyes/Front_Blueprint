import api from './apiClient.js'

const apiClientReal = {
  async getAll() {
    const { data } = await api.get('/api/blueprints')
    return data
  },

  async getByAuthor(author) {
    const { data } = await api.get(`/api/blueprints/${encodeURIComponent(author)}`)
    return data
  },

  async getByAuthorAndName(author, name) {
    const { data } = await api.get(
      `/api/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return data
  },

  async create(payload) {
    const { data } = await api.post('/api/blueprints', payload)
    return data
  },
}
export default apiClientReal