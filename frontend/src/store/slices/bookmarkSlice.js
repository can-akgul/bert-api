import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  bookmarks: [],
  isBookmarked: false,
  currentBookmarkId: null
}

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      const bookmark = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        ...action.payload
      }
      state.bookmarks = [bookmark, ...state.bookmarks]
    },
    removeBookmark: (state, action) => {
      state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== action.payload)
      
      // If the removed bookmark was the current one, reset the bookmark state
      if (state.currentBookmarkId === action.payload) {
        state.isBookmarked = false
        state.currentBookmarkId = null
      }
    },
    togglePredictionBookmark: (state, action) => {
      const { newsText, bertResult, geminiResult } = action.payload
      
      if (state.isBookmarked && state.currentBookmarkId) {
        // Remove bookmark
        state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== state.currentBookmarkId)
        state.isBookmarked = false
        state.currentBookmarkId = null
      } else {
        // Add bookmark
        const bookmarkId = Date.now()
        const bookmark = {
          id: bookmarkId,
          text: newsText,
          type: 'prediction',
          bertResult,
          geminiResult,
          timestamp: new Date().toLocaleString()
        }
        state.bookmarks = [bookmark, ...state.bookmarks]
        state.isBookmarked = true
        state.currentBookmarkId = bookmarkId
      }
    },
    setBookmarkState: (state, action) => {
      const { isBookmarked, currentBookmarkId } = action.payload
      state.isBookmarked = isBookmarked
      state.currentBookmarkId = currentBookmarkId
    },
    clearBookmarkState: (state) => {
      state.isBookmarked = false
      state.currentBookmarkId = null
    },
    clearAllBookmarks: (state) => {
      // Reset to initial state
      state.bookmarks = []
      state.isBookmarked = false
      state.currentBookmarkId = null
    }
  },
  extraReducers: (builder) => {
    // Load user history as bookmarks
    builder.addCase('bookmarks/loadHistory', (state, action) => {
      const { newsHistory, generatedHistory } = action.payload
      const bookmarks = []
      
      // Convert news history to bookmarks
      newsHistory.forEach(item => {
        bookmarks.push({
          id: `news-${item.id}`,
          type: 'prediction',
          text: item.news_text,
          bertResult: item.custom_prediction,
          geminiResult: item.gemini_prediction,
          timestamp: new Date(item.created_at).toLocaleString()
        })
      })
      
      // Convert generated history to bookmarks
      generatedHistory.forEach(item => {
        bookmarks.push({
          id: `generated-${item.id}`,
          type: 'generated',
          text: item.generated_text,
          context: item.context,
          style: item.style,
          timestamp: new Date(item.created_at).toLocaleString()
        })
      })
      
      // Sort by timestamp (newest first)
      state.bookmarks = bookmarks.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    })
  }
})

export const {
  addBookmark,
  removeBookmark,
  togglePredictionBookmark,
  setBookmarkState,
  clearBookmarkState,
  clearAllBookmarks
} = bookmarkSlice.actions

export default bookmarkSlice.reducer 