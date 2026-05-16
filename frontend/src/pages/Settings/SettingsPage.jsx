import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Camera, Save, Bell, Key } from 'lucide-react'
import { settingsData } from '../../data/mockData'

export default function SettingsPage() {
  const [form, setForm] = useState(settingsData.personalInfo)
  const [notifications, setNotifications] = useState(settingsData.notifications)

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const toggleNotification = (key) => setNotifications({ ...notifications, [key]: !notifications[key] })

  return (
    <div className="p-6 md:p-8 max-w-[900px] animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-dark">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your personal information and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-surface-container">
        <button className="px-4 py-2.5 text-sm font-medium text-primary border-b-2 border-primary">
          Personal Info
        </button>
        <Link to="/settings/password" className="px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          Password
        </Link>
        <button className="px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          Notifications
        </button>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-light/30 flex items-center justify-center">
              <User size={32} className="text-primary-dark" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="text-base font-semibold text-secondary-dark">{form.firstName} {form.lastName}</p>
            <p className="text-sm text-outline">{form.email}</p>
          </div>
        </div>

        {/* Personal Info Form */}
        <div className="bg-white rounded-lg border border-outline-variant/30 p-6">
          <h2 className="text-lg font-bold text-secondary-dark mb-5 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1.5">First Name</label>
              <input type="text" value={form.firstName} onChange={updateField('firstName')} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1.5">Last Name</label>
              <input type="text" value={form.lastName} onChange={updateField('lastName')} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={updateField('email')} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={updateField('phone')} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={updateField('location')} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-dark mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={updateField('bio')} rows={3} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors">
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-outline-variant/30 p-6">
          <h2 className="text-lg font-bold text-secondary-dark mb-5 flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            {[
              { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive updates about your CV analyses and improvements.' },
              { key: 'aiSuggestions', label: 'AI Suggestions', desc: 'Get notified when new AI suggestions are available.' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your activity.' },
              { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional offers and feature announcements.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-secondary-dark">{item.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${notifications[item.key] ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security link */}
        <Link
          to="/settings/password"
          className="flex items-center justify-between p-5 bg-white rounded-lg border border-outline-variant/30 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-dark group-hover:text-primary transition-colors">Change Password</p>
              <p className="text-xs text-on-surface-variant">Update your account password</p>
            </div>
          </div>
          <span className="text-outline group-hover:text-primary transition-colors">→</span>
        </Link>
      </div>
    </div>
  )
}
