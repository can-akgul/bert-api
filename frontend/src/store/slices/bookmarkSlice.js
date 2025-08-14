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
    }
  }
})

export const {
  addBookmark,
  removeBookmark,
  togglePredictionBookmark,
  setBookmarkState,
  clearBookmarkState
} = bookmarkSlice.actions

export default bookmarkSlice.reducer 