import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { authApi } from '../../api/authApi'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // States
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [verificationSent, setVerificationSent] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Check if verified query parameter exists
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email của bạn đã được xác minh thành công! Vui lòng đăng nhập.');
    }
    if (searchParams.get('session_expired') === 'true') {
      toast.warning('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setVerificationSent(false)

    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setIsSubmitting(true)

    try {
      await login({ email, password })
      toast.success('Đăng nhập thành công!')
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message

      if (status === 401) {
        setError('Email hoặc mật khẩu không chính xác')
      } else if (status === 403) {
        setError('Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư.')
      } else {
        setError(message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendEmail = async () => {
    try {
      setIsSubmitting(true)
      await authApi.resendVerification(email)
      setVerificationSent(true)
      toast.success('Email xác thực mới đã được gửi đi!')
    } catch (err) {
      toast.error('Không thể gửi lại email xác thực. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-dark to-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white/30 rounded-full" />
          <div className="absolute bottom-32 right-16 w-56 h-56 border-2 border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white/25 rounded-full" />
        </div>

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold text-white">CareerAI</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Precision-engineered career empowerment.
          </h2>
          <p className="text-primary-light/80 leading-relaxed">
            Harness the power of artificial intelligence to optimize your CV, track applications, and navigate your professional journey with confidence.
          </p>
        </div>

        <div className="relative z-10 text-xs text-primary-light/60">
          © 2026 CareerAI
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-lowest">
        <div className="w-full max-w-md animate-fade-in text-on-surface">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-primary">CareerAI</span>
          </Link>

          <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng nhập</h1>
          <p className="text-on-surface-variant mb-8">Nhập thông tin tài khoản của bạn để tiếp tục.</p>
          {error && (
            <div className="flex flex-col gap-3 bg-error-container border border-error/20 text-error rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>

              {error.includes('xác thực') && !verificationSent && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isSubmitting}
                  className="w-fit text-xs font-semibold text-primary hover:text-primary-dark underline cursor-pointer text-left pl-7"
                >
                  Gửi lại email xác nhận tài khoản
                </button>
              )}

              {verificationSent && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 pl-7">
                  <CheckCircle size={14} />
                  <span>Email xác minh mới đã được gửi!</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-on-surface-variant mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-on-surface-variant">Mật khẩu</label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  disabled={isSubmitting}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 bg-surface border border-outline-variant rounded text-primary focus:ring-primary/50" />
                <span className="text-sm text-on-surface-variant">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg shadow-primary/20 hover:shadow-primary-dark/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-outline-variant"></div>
              <span className="px-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Hoặc tiếp tục bằng</span>
              <div className="flex-1 border-t border-outline-variant"></div>
            </div>

            {/* OAuth2 Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { window.location.href = 'http://localhost:8080/oauth2/authorization/google' }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-lowest hover:bg-surface-container-low border border-outline hover:border-outline-variant rounded-xl text-sm font-semibold text-on-surface transition-all duration-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = 'http://localhost:8080/oauth2/authorization/facebook' }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-lowest hover:bg-surface-container-low border border-outline hover:border-outline-variant rounded-xl text-sm font-semibold text-on-surface transition-all duration-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                </svg>
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-10 text-center">
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-all duration-200">Trung tâm hỗ trợ CareerAI</a>
          </div>
        </div>
      </div>
    </div>
  )
}

