import { useDispatch, useSelector } from 'react-redux'

// Custom hook for dispatch
export const useAppDispatch = () => useDispatch()

// Custom hook for selector
export const useAppSelector = (selector) => useSelector(selector)

// Specific selectors for easier use
export const useNewsState = () => useAppSelector((state) => state.news)
export const useUIState = () => useAppSelector((state) => state.ui)
export const useBookmarkState = () => useAppSelector((state) => state.bookmarks)
export const useAuthState = () => useAppSelector((state) => state.auth) 