import { useState, useEffect } from 'react'
import { useAppDispatch, useAuthState } from '../hooks/redux'
import { loginUser, clearError } from '../store/slices/authSlice'

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAuthState()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group username">
            <label htmlFor="username">Kullanıcı Adı:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group password">
            <label htmlFor="password">Şifre:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="forgot-password">
              Forgot Password?
            </button>
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
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Don't have a account? 
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToRegister}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 