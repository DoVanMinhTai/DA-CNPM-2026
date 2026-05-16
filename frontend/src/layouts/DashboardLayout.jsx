import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, Brain, User } from 'lucide-react'
import { useState } from 'react'
import { dashboardUser } from '../data/mockData'

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

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-white border-r border-outline-variant/30 flex flex-col transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-surface-container">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-secondary-dark whitespace-nowrap">CareerAI</span>
            )}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-outline-variant/40 rounded-full flex items-center justify-center shadow-sm hover:bg-surface-container transition-colors z-10"
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-outline'} group-hover:text-primary transition-colors`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-container p-3">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} py-2`}>
            <div className="w-9 h-9 rounded-full bg-primary-light/30 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-primary-dark" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{dashboardUser.name}</p>
                <p className="text-xs text-outline truncate">{dashboardUser.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/login')}
            className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-lg text-sm font-medium text-outline hover:text-error hover:bg-error-container/30 transition-all`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
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
