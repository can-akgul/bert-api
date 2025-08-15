import { useState, useEffect } from 'react'
import { useAppDispatch, useAuthState } from '../hooks/redux'
import { loginUser, clearError } from '../store/slices/authSlice'

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAuthState()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) return

    const result = await dispatch(loginUser(formData))
    if (result.type === 'auth/loginUser/fulfilled') {
      onLoginSuccess()
    }
  }

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Hesabınız yok mu? 
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 