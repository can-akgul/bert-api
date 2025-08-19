import axios from 'axios'

// Helper function for user-friendly error messages
const getErrorMessage = (status) => {
  switch (status) {
    case 400:
      return 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.'
    case 401:
      return 'Kullanıcı adı veya şifre hatalı.'
    case 403:
      return 'Bu işlem için yetkiniz yok.'
    case 404:
      return 'İstenen kaynak bulunamadı.'
    case 500:
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
    default:
      return `HTTP Hatası: ${status}`
  }
}

// Create axios instance
const api = axios.create({
  baseURL: '/', // Since we're using relative URLs in the original code
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    
    // Add auth token to requests
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status)
    return response
  },
  (error) => {
    // Handle different error types
    console.error('❌ Response Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          console.error('Unauthorized access')
          // Handle unauthorized access (redirect to login, clear tokens, etc.)
          break
        case 403:
          console.error('Forbidden access')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Internal server error')
          break
        default:
          console.error(`HTTP Error: ${status}`)
      }
      
      // Return a more user-friendly error message
      return Promise.reject({
        message: data?.detail || data?.message || getErrorMessage(status),
        status,
        data
      })
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received')
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network'
      })
    } else {
      // Other error
      console.error('Request setup error:', error.message)
      return Promise.reject({
        message: error.message,
        type: 'setup'
      })
    }
  }
)

// Auth API methods
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// History API methods
export const historyAPI = {
  getNewsHistory: async (limit = 50) => {
    const response = await api.get(`/history/news?limit=${limit}`)
    return response.data
  },
  
  getGeneratedHistory: async (limit = 50) => {
    const response = await api.get(`/history/generated?limit=${limit}`)
    return response.data
  }
}

// News API methods
export const newsAPI = {
  predict: async (newsText) => {
    const response = await api.post('/predict', { news: newsText })
    return response.data
  },
  
  generate: async (options) => {
    const response = await api.post('/generate', options, {
      responseType: 'text'
    })
    return response.data
  }
}

export default api 