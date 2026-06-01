import { Link, useLocation } from 'react-router-dom'
import { publicNavLinks } from '../../data/mockData'
import { useAuth } from '../../auth/useAuth'

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { isAuthenticated, user } = useAuth()

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome ? 'bg-surface-container-lowest/80 backdrop-blur-md' : 'bg-surface-container-lowest shadow-sm border-b border-slate-100'
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
            CareerAI
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {publicNavLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons / User Profile */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-indigo-650 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl transition-all"
              >
                Dashboard
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600/10 text-indigo-600 border border-indigo-200/50 flex items-center justify-center font-bold text-sm uppercase">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-on-surface hover:text-primary transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Tạo CV miễn phí ngay
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
