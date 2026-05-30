import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { authApi } from '../../api/authApi'
import { toast } from 'sonner'

export default function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // States
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const errors = {}

    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên'
    } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      errors.fullName = 'Họ tên phải từ 2 đến 100 ký tự'
    }

    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Định dạng email không hợp lệ'
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu'
    } else {
      if (password.length < 8) {
        errors.password = 'Mật khẩu tối thiểu phải có 8 ký tự'
      } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa'
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ thường'
      } else if (!/[0-9]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ số'
      } else if (!/[@$!%*?&#()\-_+=^]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#()-_+=^)'
      }
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    if (!agreeTerms) {
      errors.terms = 'Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.register({ fullName, email, password })
      toast.success('Đăng ký tài khoản thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.')
      navigate('/login', { replace: true })
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data

      if (status === 409) {
        setError('Địa chỉ email này đã được sử dụng')
      } else if (status === 400 && data?.fieldErrors) {
        setFieldErrors(data.fieldErrors) // Server-side validation errors
      } else {
        setError(data?.message || 'Đăng ký thất bại. Vui lòng thử lại sau.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark to-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 right-16 w-48 h-48 border-2 border-white/30 rounded-full" />
          <div className="absolute bottom-20 left-20 w-36 h-36 border-2 border-white/20 rounded-full" />
        </div>

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold text-white">CareerAI</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Precision-Engineered Career Growth.
          </h2>
          <p className="text-primary-light/80 leading-relaxed">
            Join thousands of professionals optimizing their CVs and interview preparation with advanced artificial intelligence.
          </p>
        </div>

        <div className="relative z-10 text-xs text-primary-light/60">
          © 2026 CareerAI
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md animate-fade-in text-slate-200">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-white">CareerAI</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Đăng ký tài khoản</h1>
          <p className="text-slate-400 mb-8">Bắt đầu hành trình sự nghiệp thành công của bạn.</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 mb-6">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-350 mb-1.5">Họ và tên</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${fieldErrors.fullName ? 'border-rose-500/55' : 'border-slate-800'} rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-350 mb-1.5">Địa chỉ Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${fieldErrors.email ? 'border-rose-500/55' : 'border-slate-800'} rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-350 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu bảo mật (tối thiểu 8 ký tự)"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-900 border ${fieldErrors.password ? 'border-rose-500/55' : 'border-slate-800'} rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-350 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu để xác minh"
                  disabled={isSubmitting}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${fieldErrors.confirmPassword ? 'border-rose-500/55' : 'border-slate-800'} rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms of Service */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 mt-0.5 shrink-0 bg-slate-900 border border-slate-850 rounded text-indigo-500 focus:ring-indigo-500/50"
                />
                <span className="text-sm text-slate-400">
                  Tôi đồng ý với <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors underline">Điều khoản dịch vụ</a> và <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors underline">Chính sách bảo mật</a>
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{fieldErrors.terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang tạo tài khoản...
                </>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-600">Hoặc đăng ký bằng</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>

            {/* OAuth2 Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { window.location.href = '/oauth2/authorization/google' }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-all duration-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/oauth2/authorization/facebook' }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-all duration-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
