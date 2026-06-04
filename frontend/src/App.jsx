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
import { ProtectedRoute } from './auth/ProtectedRoute'
import OAuth2CallbackPage from './pages/OAuth2Callback/OAuth2CallbackPage'
import CVUploadPage from './pages/CVUpload/CVUploadPage'
import VnPayCallback from './pages/Billing/VnPayCallback'

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
      <Route path="/payment/result" element={<VnPayCallback />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cv/editor" element={<CVEditorPage />} />
          <Route path="/cv/editor/:id" element={<CVEditorPage />} />
          <Route path="/cv/upload" element={<CVUploadPage />} />
          <Route path="/cv/:id" element={<CVDetailPage />} />
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/password" element={<ChangePasswordPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
