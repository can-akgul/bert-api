import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeTab: 'generate',
  showBookmarks: false,
  toast: '',
  toastTimeout: null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setShowBookmarks: (state, action) => {
      state.showBookmarks = action.payload
    },
    toggleBookmarks: (state) => {
      state.showBookmarks = !state.showBookmarks
    },
    showToast: (state, action) => {
      state.toast = action.payload
    },
    hideToast: (state) => {
      state.toast = ''
    },
    setToastTimeout: (state, action) => {
      state.toastTimeout = action.payload
    },
    clearToastTimeout: (state) => {
      if (state.toastTimeout) {
        clearTimeout(state.toastTimeout)
        state.toastTimeout = null
      }
    },
    resetUI: (state) => {
      // Reset to initial state
      state.activeTab = 'generate'
      state.showBookmarks = false
      state.toast = ''
      if (state.toastTimeout) {
        clearTimeout(state.toastTimeout)
        state.toastTimeout = null
      }
    }
  }
})

export const {
  setActiveTab,
  setShowBookmarks,
  toggleBookmarks,
  showToast,
  hideToast,
  setToastTimeout,
  clearToastTimeout,
  resetUI
} = uiSlice.actions

export default uiSlice.reducer 