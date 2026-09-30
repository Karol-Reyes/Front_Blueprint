import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const data = await blueprintsService.getAll()
  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await blueprintsService.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    return await blueprintsService.getByAuthorAndName(author, name)
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  return await blueprintsService.create(payload)
})

export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async ({ author, name, points }) => {
    await blueprintsService.update(author, name, points)
    return { author, name, points }
  },
)

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }) => {
    await blueprintsService.delete(author, name)
    return { author, name }
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    appendPoint(state, action) {
      const { author, name, point } = action.payload
      if (state.current?.author === author && state.current?.name === name) {
        state.current.points.push(point)
      }
      const cached = state.byAuthor[author]?.find((blueprint) => blueprint.name === name)
      if (cached) cached.points.push(point)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        s.current = bp
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
        if (!s.authors.includes(bp.author)) s.authors.push(bp.author)
      })
      .addCase(updateBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        const cached = s.byAuthor[bp.author]?.find((item) => item.name === bp.name)
        if (cached) cached.points = bp.points
        if (s.current?.author === bp.author && s.current?.name === bp.name) {
          s.current.points = bp.points
        }
      })
      .addCase(deleteBlueprint.fulfilled, (s, a) => {
        const { author, name } = a.payload
        if (s.byAuthor[author]) {
          s.byAuthor[author] = s.byAuthor[author].filter((item) => item.name !== name)
          if (!s.byAuthor[author].length) {
            delete s.byAuthor[author]
            s.authors = s.authors.filter((item) => item !== author)
          }
        }
        if (s.current?.author === author && s.current?.name === name) s.current = null
      })
  },
})

export const { appendPoint } = slice.actions
export default slice.reducer
