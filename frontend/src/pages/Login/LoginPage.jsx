import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark to-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white/30 rounded-full" />
          <div className="absolute bottom-32 right-16 w-56 h-56 border-2 border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white/25 rounded-full" />
        </div>

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
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
          © 2024 CareerAI
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-secondary-dark">CareerAI</span>
          </Link>

          <h1 className="text-3xl font-bold text-secondary-dark mb-2">Welcome back</h1>
          <p className="text-on-surface-variant mb-8">Enter your credentials to access your workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-secondary-dark mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/50 rounded text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-secondary-dark mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/50 rounded text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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
                <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative flex items-center my-2">
              <div className="flex-1 border-t border-outline-variant/50"></div>
              <span className="px-4 text-sm text-outline">Or continue with</span>
              <div className="flex-1 border-t border-outline-variant/50"></div>
            </div>

            {/* OAuth2 Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { window.location.href = '/oauth2/authorization/google' }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-outline-variant/50 rounded text-sm font-medium text-on-surface hover:bg-surface-variant/50 hover:border-outline-variant transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
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
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-outline-variant/50 rounded text-sm font-medium text-on-surface hover:bg-surface-variant/50 hover:border-outline-variant transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Create one
            </Link>
          </p>

          <div className="mt-8 text-center">
            <a href="#" className="text-xs text-outline hover:text-on-surface-variant transition-colors">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  )
}
