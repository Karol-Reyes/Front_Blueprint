// datos de la DB real
const MOCK_DATA = [
  { author: 'john', name: 'house', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }] },
  { author: 'john', name: 'garage', points: [{ x: 5, y: 5 }, { x: 15, y: 5 }, { x: 15, y: 15 }] },
  { author: 'jane', name: 'garden', points: [{ x: 2, y: 2 }, { x: 3, y: 4 }, { x: 6, y: 7 }] },
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const apiMock = {
  async getAll() {
    await delay()
    return MOCK_DATA
  },

  async getByAuthor(author) {
    await delay()
    return MOCK_DATA.filter((bp) => bp.author === author)
  },

  async getByAuthorAndName(author, name) {
    await delay()
    const found = MOCK_DATA.find((bp) => bp.author === author && bp.name === name)
    if (!found) throw new Error(`Blueprint not found: ${author}/${name}`)
    return found
  },

  async create(payload) {
    await delay()
    const exists = MOCK_DATA.some((bp) => bp.author === payload.author && bp.name === payload.name)
    if (exists) throw new Error(`Blueprint already exists: ${payload.author}:${payload.name}`)
    const created = { ...payload }
    MOCK_DATA.push(created)
    return created
  },
}
export default apiMock