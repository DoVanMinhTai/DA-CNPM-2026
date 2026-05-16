import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import CVEditorPage from './pages/CVEditor/CVEditorPage'
import CVDetailPage from './pages/CVDetail/CVDetailPage'
import AIAnalysisPage from './pages/AIAnalysis/AIAnalysisPage'
import PricingPage from './pages/Pricing/PricingPage'
import BillingPage from './pages/Billing/BillingPage'
import SettingsPage from './pages/Settings/SettingsPage'
import ChangePasswordPage from './pages/ChangePassword/ChangePasswordPage'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Dashboard pages with sidebar layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cv/editor" element={<CVEditorPage />} />
        <Route path="/cv/editor/:id" element={<CVEditorPage />} />
        <Route path="/cv/:id" element={<CVDetailPage />} />
        <Route path="/ai-analysis" element={<AIAnalysisPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/password" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  )
}

export default App
