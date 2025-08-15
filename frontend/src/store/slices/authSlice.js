import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, historyAPI } from '../../services/api'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authAPI.login(credentials)
      // Store token in localStorage
      localStorage.setItem('token', data.access_token)
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authAPI.register(userData)
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.getProfile()
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get profile')
    }
  }
)

export const loadUserHistory = createAsyncThunk(
  'auth/loadUserHistory',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const [newsHistory, generatedHistory] = await Promise.all([
        historyAPI.getNewsHistory(),
        historyAPI.getGeneratedHistory()
      ])
      
      // Dispatch to respective slices
      dispatch({ type: 'news/loadHistory', payload: newsHistory })
      dispatch({ type: 'bookmarks/loadHistory', payload: { newsHistory, generatedHistory } })
      
      return { newsHistory, generatedHistory }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load history')
    }
  }
)

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      // Clear all localStorage data
      localStorage.clear()
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.access_token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.token = null
      })
    
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Don't auto-login after register
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Get Profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // If profile fetch fails, logout
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
      })
  }
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer 