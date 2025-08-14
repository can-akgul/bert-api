import { configureStore } from '@reduxjs/toolkit'
import newsSlice from './slices/newsSlice'
import uiSlice from './slices/uiSlice'
import bookmarkSlice from './slices/bookmarkSlice'

export const store = configureStore({
  reducer: {
    news: newsSlice,
    ui: uiSlice,
    bookmarks: bookmarkSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}) 