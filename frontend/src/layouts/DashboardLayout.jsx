import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, Brain, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { toast } from 'sonner'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My CVs', path: '/dashboard' },
  { icon: Brain, label: 'AI Analysis', path: '/ai-analysis' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Đăng xuất thành công!')
      navigate('/login', { replace: true })
    } catch (e) {
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-slate-900 border-r border-slate-800/80 flex flex-col transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white whitespace-nowrap">CareerAI</span>
            )}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-slate-850 rounded-full flex items-center justify-center shadow-md hover:bg-slate-800 transition-colors z-10 text-slate-400 hover:text-white cursor-pointer"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-650/15 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'} group-hover:text-indigo-400 transition-colors`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/50">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} py-2`}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-9 h-9 rounded-full border border-slate-700/55 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold text-sm uppercase">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
