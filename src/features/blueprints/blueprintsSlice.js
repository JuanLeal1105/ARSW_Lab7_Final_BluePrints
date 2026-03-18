import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'
import api from '../../services/apiClient.js'

export const fetchAllBlueprints = createAsyncThunk('blueprints/fetchAll', async () => {
  const res = await api.get('/v1/blueprints')
  return res.data.data
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const res = await api.get(`/v1/blueprints/${author}`)
  return res.data.data
})

export const fetchBlueprint = createAsyncThunk('blueprints/fetchBlueprint', async ({ author, name }) => {
  const res = await api.get(`/v1/blueprints/${author}/${name}`)
  return res.data.data
})


export const addPointOptimistic = createAsyncThunk(
  'blueprints/addPoint',
  async ({ author, name, point }, { rejectWithValue }) => {
    try {
      await api.put(`/v1/blueprints/${author}/${name}/points`, point)
      return point
    } catch (err) {
      return rejectWithValue(point)
    }
  }
)

export const deleteBlueprintOptimistic = createAsyncThunk(
  'blueprints/delete',
  async ({ author, name }, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/blueprints/${author}/${name}`)
      return { author, name }
    } catch (err) {
      return rejectWithValue({ author, name })
    }
  }
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    allItems: [], 
    searchResults: [], 
    current: null,
    listStatus: 'idle',
    listError: null,
    detailStatus: 'idle',
    detailError: null,
  },
  reducers: {
    showAllInTable: (state) => {
      state.searchResults = state.allItems;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBlueprints.pending, (state) => { state.listStatus = 'loading'; state.listError = null })
      .addCase(fetchAllBlueprints.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.allItems = action.payload
      })
      .addCase(fetchAllBlueprints.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message
      })

      .addCase(fetchByAuthor.pending, (state) => { state.listStatus = 'loading'; state.listError = null })
      .addCase(fetchByAuthor.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.searchResults = action.payload
      })
      .addCase(fetchByAuthor.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message
      })

      .addCase(fetchBlueprint.pending, (state) => { state.detailStatus = 'loading'; state.detailError = null })
      .addCase(fetchBlueprint.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchBlueprint.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.error.message
      })

      .addCase(addPointOptimistic.pending, (state, action) => {
        const { point } = action.meta.arg
        if (state.current) state.current.points.push(point)
      })
      .addCase(addPointOptimistic.rejected, (state) => {
        if (state.current) state.current.points.pop()
      })

      .addCase(deleteBlueprintOptimistic.pending, (state, action) => {
        const { author, name } = action.meta.arg
        state.searchResults = state.searchResults.filter(bp => !(bp.name === name && bp.author === author))
        state.allItems = state.allItems.filter(bp => !(bp.name === name && bp.author === author))
      })
      .addCase(deleteBlueprintOptimistic.rejected, (state) => {
      })
  },
})

export const { showAllInTable } = slice.actions

const selectAllItems = (state) => state.blueprints.allItems;
export const selectTop5Blueprints = createSelector(
  [selectAllItems],
  (items) => [...items].sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0)).slice(0, 5)
)

export default slice.reducer