import { useState, useEffect } from 'react'
import { useAppDispatch, useAuthState } from '../hooks/redux'
import { registerUser, clearError } from '../store/slices/authSlice'

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAuthState()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [validationError, setValidationError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear validation error when user types
    if (validationError) setValidationError('')
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setValidationError('Tüm alanlar zorunludur')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Şifreler eşleşmiyor')
      return false
    }
    
    if (formData.password.length < 6) {
      setValidationError('Şifre en az 6 karakter olmalıdır')
      return false
    }

    if (!formData.email.includes('@')) {
      setValidationError('Geçerli bir email adresi giriniz')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    }

    const result = await dispatch(registerUser(userData))
    if (result.type === 'auth/registerUser/fulfilled') {
      onRegisterSuccess()
    }
  }

  useEffect(() => {
    return () => {
      dispatch(clearError())
      setValidationError('')
    }
  }, [dispatch])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
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
          
          <div className="form-group email">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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
          
          <div className="form-group password">
            <label htmlFor="confirmPassword">Şifre Tekrar:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {(error || validationError) && (
            <div className="error-message">
              {validationError || error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Zaten hesabınız var mı? 
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register 