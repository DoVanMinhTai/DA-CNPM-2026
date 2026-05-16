import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react'

export default function ChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const passwordStrength = (pass) => {
    if (!pass) return { level: 0, label: '' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong']
    const colors = ['', 'bg-error', 'bg-amber-500', 'bg-green-500', 'bg-green-600']
    return { level: score, label: labels[score], color: colors[score] }
  }

  const strength = passwordStrength(form.newPass)

  const requirements = [
    { met: form.newPass.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(form.newPass), text: 'One uppercase letter' },
    { met: /[0-9]/.test(form.newPass), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(form.newPass), text: 'One special character' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle password change
  }

  return (
    <div className="p-6 md:p-8 max-w-[700px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/settings" className="p-2 hover:bg-surface-container rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-dark">Change Password</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Update your account password for security.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-surface-container">
        <Link to="/settings" className="px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          Personal Info
        </Link>
        <button className="px-4 py-2.5 text-sm font-medium text-primary border-b-2 border-primary">
          Password
        </button>
        <button className="px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          Notifications
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-outline-variant/30 p-6">
          <h2 className="text-lg font-bold text-secondary-dark mb-5 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Password Security
          </h2>

          <div className="space-y-4">
            {/* Current password */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-secondary-dark mb-1.5">Current Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input id="current-password" type={showCurrent ? 'text' : 'password'} value={form.current} onChange={updateField('current')} placeholder="Enter current password" className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-secondary-dark mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input id="new-password" type={showNew ? 'text' : 'password'} value={form.newPass} onChange={updateField('newPass')} placeholder="Enter new password" className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength indicator */}
              {form.newPass && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= strength.level ? strength.color : 'bg-surface-container'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.level <= 1 ? 'text-error' : strength.level <= 2 ? 'text-amber-600' : 'text-green-600'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-secondary-dark mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input id="confirm-password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={updateField('confirm')} placeholder="Confirm new password" className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirm && form.newPass !== form.confirm && (
                <p className="text-xs text-error mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg border border-outline-variant/30 p-5">
          <h3 className="text-sm font-bold text-secondary-dark mb-3">Password Requirements</h3>
          <div className="grid grid-cols-2 gap-2">
            {requirements.map((req) => (
              <div key={req.text} className="flex items-center gap-2 text-sm">
                <CheckCircle size={14} className={req.met ? 'text-green-500' : 'text-outline-variant'} />
                <span className={req.met ? 'text-green-700' : 'text-on-surface-variant'}>{req.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Link to="/settings" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            ← Back to Settings
          </Link>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors">
            <Shield size={14} />
            Update Password
          </button>
        </div>
      </form>
    </div>
  )
}
