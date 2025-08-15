import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { newsAPI } from '../../services/api'

// Async thunks
export const predictNews = createAsyncThunk(
  'news/predict',
  async (newsText, { rejectWithValue }) => {
    try {
      const response = await newsAPI.predict(newsText)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Error occurred while predicting')
    }
  }
)

export const generateNews = createAsyncThunk(
  'news/generate',
  async (options, { rejectWithValue }) => {
    try {
      const response = await newsAPI.generate(options)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Error occurred while generating')
    }
  }
)

const initialState = {
  // Predict state
  newsText: '',
  bertResult: '',
  geminiResult: '',
  predictResult: '',
  predictLoading: false,
  predictError: null,
  
  // Generate state
  generateText: '',
  generatedNews: '',
  generateLoading: false,
  generateError: null,
  
  // Filters for generation
  filters: {
    content: '',
    style: '',
    length: ''
  },
  
  // Options for dropdowns
  contentOptions: [
    { value: '', label: 'Select Content' },
    { value: 'politics', label: 'Politics' },
    { value: 'technology', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'environment', label: 'Environment' }
  ],
  
  styleOptions: [
    { value: '', label: 'Select Style' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'sensational', label: 'Sensational' },
    { value: 'clickbait', label: 'Clickbait' },
    { value: 'misleading', label: 'Misleading' },
    { value: 'investigative', label: 'Investigative' },
    { value: 'satirical', label: 'Satirical' },
    { value: 'humorous', label: 'Humorous' }
  ],
  
  lengthOptions: [
    { value: '', label: 'Select Length' },
    { value: 'short', label: 'Short(50 words)' },
    { value: 'medium', label: 'Medium(100 words)' },
    { value: 'long', label: 'Long(200 words)' }
  ]
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsText: (state, action) => {
      state.newsText = action.payload
    },
    setGenerateText: (state, action) => {
      state.generateText = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearPredictResults: (state) => {
      state.bertResult = ''
      state.geminiResult = ''
      state.predictResult = ''
      state.predictError = null
    },
    clearGenerateResults: (state) => {
      state.generatedNews = ''
      state.generateError = null
    },
    setPredictResultsFromGenerated: (state) => {
      state.newsText = state.generatedNews
      state.bertResult = ''
      state.geminiResult = ''
      state.predictResult = ''
      state.predictError = null
    },
    clearAllNewsData: (state) => {
      // Reset to initial state
      state.newsText = ''
      state.bertResult = ''
      state.geminiResult = ''
      state.predictResult = ''
      state.predictLoading = false
      state.predictError = null
      state.generateText = ''
      state.generatedNews = ''
      state.generateLoading = false
      state.generateError = null
      state.filters = {
        content: '',
        style: '',
        length: ''
      }
    }
  },
  extraReducers: (builder) => {
    // Load user history
    builder.addCase('news/loadHistory', (state, action) => {
      // History'den son predict sonucunu yükle
      if (action.payload && action.payload.length > 0) {
        const lastNews = action.payload[0]
        state.newsText = lastNews.news_text || ''
        state.bertResult = lastNews.custom_prediction || ''
        state.geminiResult = lastNews.gemini_prediction || ''
      }
    })
    
    // Predict news cases
    builder
      .addCase(predictNews.pending, (state) => {
        state.predictLoading = true
        state.predictError = null
        state.bertResult = ''
        state.geminiResult = ''
        state.predictResult = ''
      })
      .addCase(predictNews.fulfilled, (state, action) => {
        state.predictLoading = false
        state.bertResult = action.payload.custom_model
        state.geminiResult = action.payload.gemini_model
        state.predictResult = 'completed'
      })
      .addCase(predictNews.rejected, (state, action) => {
        state.predictLoading = false
        state.predictError = action.payload
        state.predictResult = action.payload
      })
      
      // Generate news cases
      .addCase(generateNews.pending, (state) => {
        state.generateLoading = true
        state.generateError = null
      })
      .addCase(generateNews.fulfilled, (state, action) => {
        state.generateLoading = false
        state.generatedNews = action.payload
      })
      .addCase(generateNews.rejected, (state, action) => {
        state.generateLoading = false
        state.generateError = action.payload
        state.generatedNews = action.payload
      })
  }
})

export const {
  setNewsText,
  setGenerateText,
  setFilters,
  clearPredictResults,
  clearGenerateResults,
  setPredictResultsFromGenerated,
  clearAllNewsData
} = newsSlice.actions

export default newsSlice.reducer 