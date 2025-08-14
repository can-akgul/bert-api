import { showToast, hideToast, clearToastTimeout, setToastTimeout } from '../store/slices/uiSlice'

export const showToastMessage = (message, duration = 2000) => (dispatch, getState) => {
  const { toastTimeout } = getState().ui
  
  // Clear existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout)
    dispatch(clearToastTimeout())
  }
  
  // Show toast
  dispatch(showToast(message))
  
  // Set new timeout
  const timeout = setTimeout(() => {
    dispatch(hideToast())
    dispatch(clearToastTimeout())
  }, duration)
  
  dispatch(setToastTimeout(timeout))
} 