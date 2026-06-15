import { useState, useEffect } from 'react'
import { CreditCard, Download, AlertCircle, CheckCircle, Loader2, RefreshCw, XCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { paymentApi } from '../../api/paymentApi'

export default function BillingPage() {
  const [billing, setBilling] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null) // 'upgrade' | 'credits' | 'cancel' | 'reactivate'

  // Trạng thái đóng/mở Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)

  // ---------- Load billing info ----------
  const fetchBilling = async () => {
    try {
      setLoading(true)
      const data = await paymentApi.getBillingInfo()
      setBilling(data)
    } catch (err) {
      toast.error('Failed to load billing information.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBilling()
  }, [])

  // ---------- Handlers ----------
  const handleUpgradePlan = async (planType) => {
    try {
      setActionLoading('upgrade')
      setIsPlanModalOpen(false) // Đóng modal cước gói sau khi chọn
      toast.info(`Redirecting to VNPay for ${planType} plan...`)

      const { paymentUrl } = await paymentApi.createPaymentUrl(planType)
      window.location.href = paymentUrl
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment. Please try again.')
      console.error(err)
      setActionLoading(null)
    }
  }

  const handleBuyCredits = async (creditPackage) => {
    try {
      setActionLoading('credits')
      setIsCreditModalOpen(false) // Đóng modal credit sau khi chọn
      toast.info('Redirecting to VNPay for credits purchase...')

      const { paymentUrl } = await paymentApi.createPaymentUrl(creditPackage)
      window.location.href = paymentUrl
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment. Please try again.')
      console.error(err)
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? Access continues until end of billing period.')) {
      return
    }
    try {
      setActionLoading('cancel')
      const { message } = await paymentApi.cancelSubscription()
      toast.success(message || 'Subscription cancelled successfully.')
      await fetchBilling()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription.')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivate = async () => {
    try {
      setActionLoading('reactivate')
      const { message } = await paymentApi.reactivateSubscription()
      toast.success(message || 'Subscription reactivated successfully!')
      await fetchBilling()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate subscription.')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // ---------- Loading skeleton & Error views ----------
  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1000px] animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface">Billing & Credits</h1>
          <p className="text-on-surface-variant mt-1">Manage your subscription and payment information.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="ml-3 text-on-surface-variant">Loading billing info...</span>
        </div>
      </div>
    )
  }

  if (!billing) {
    return (
      <div className="p-6 md:p-8 max-w-[1000px] animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface">Billing & Credits</h1>
        </div>
        <div className="text-center py-20">
          <XCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-on-surface-variant mb-4">Could not load billing information.</p>
          <button
            onClick={fetchBilling}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    )
  }

  const credits = billing.credits || { used: 0, total: 0 }
  const remaining = credits.total - credits.used
  const creditPercent = credits.total > 0 ? (credits.used / credits.total) * 100 : 0

  return (
    <div className="p-6 md:p-8 max-w-[1000px] animate-fade-in relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Billing & Credits</h1>
        <p className="text-on-surface-variant mt-1">Manage your subscription and payment information.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin gói & Hóa đơn */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan Card */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">Current Plan</h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${billing.isCancelled ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'
                }`}>
                {billing.isCancelled ? `${billing.currentPlan} (Cancelled)` : billing.currentPlan}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-on-surface">{billing.amount}</span>
              <span className="text-sm text-outline">/month</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              {billing.isCancelled 
                ? `Access until: ${billing.nextBilling || 'N/A'}`
                : `Next billing date: ${billing.nextBilling || 'N/A'}`
              }
            </p>

            <div className="flex gap-2">
              {/* Nút Upgrade mở Plan Modal */}
              {!billing.isCancelled && billing.currentPlan !== 'ENTERPRISE' && (
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  disabled={!!actionLoading}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {actionLoading === 'upgrade' && <Loader2 size={14} className="animate-spin" />}
                  Upgrade Plan
                </button>
              )}

              {/* Nút Cancel / Reactivate */}
              {!billing.isCancelled && (billing.currentPlan === 'PROFESSIONAL' || billing.currentPlan === 'ENTERPRISE') && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={!!actionLoading}
                  className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {actionLoading === 'cancel' && <Loader2 size={14} className="animate-spin" />}
                  Cancel Subscription
                </button>
              )}

              {billing.isReactivatable && billing.isCancelled && (
                <button
                  onClick={handleReactivate}
                  disabled={!!actionLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {actionLoading === 'reactivate' && <Loader2 size={14} className="animate-spin" />}
                  Reactivate Subscription
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Gate Card */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
            <h2 className="text-lg font-bold text-on-surface mb-4">Payment Method</h2>
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-700 to-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VNPay</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">VNPay Payment Gateway</p>
                  <p className="text-xs text-outline">Redirect-based sandbox environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Số dư Credits */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              AI Credits
            </h3>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-on-surface">{remaining}</span>
              <span className="text-sm text-outline ml-1">remaining</span>
            </div>
            <div className="h-3 bg-surface-container rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${creditPercent}%` }} />
            </div>
            <p className="text-xs text-outline text-center">{credits.used} of {credits.total} credits used this month</p>

            {/* Nút mở Credit Modal */}
            <button
              onClick={() => setIsCreditModalOpen(true)}
              disabled={!!actionLoading}
              className="w-full mt-4 py-2.5 bg-accent text-on-surface text-sm font-semibold rounded hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {actionLoading === 'credits' && <Loader2 size={14} className="animate-spin" />}
              Buy More Credits
            </button>
          </div>

          <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-on-surface mb-1">Credit Reset</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Your credits will reset on {billing.nextBilling}. Unused credits do not roll over.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 1. MODAL CHỌN GÓI NÂNG CẤP (UPGRADE PLAN) ==================== */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-outline-variant animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Select Premium Plan</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-outline hover:text-on-surface text-lg font-semibold">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Gói Professional - Chỉ hiển thị nếu không phải current plan */}
              {billing.currentPlan !== 'PROFESSIONAL' && (
                <div className={`border rounded-xl p-5 flex flex-col justify-between ${billing.currentPlan === 'PROFESSIONAL' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                  <div>
                    <h4 className="font-bold text-lg text-primary">PROFESSIONAL</h4>
                    <p className="text-2xl font-black mt-2 text-on-surface">500,000 VND <span className="text-xs text-outline font-normal">/month</span></p>
                    <ul className="text-xs text-on-surface-variant space-y-2 mt-4">
                      <li className="flex items-center gap-2">✓ <strong>500</strong> AI Credits / tháng</li>
                      <li className="flex items-center gap-2">✓ Phân tích & Chấm điểm CV ATS</li>
                      <li className="flex items-center gap-2">✓ Xuất file Word (.docx) & PDF</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan('PROFESSIONAL')}
                    className="w-full mt-6 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors"
                  >
                    Choose Professional
                  </button>
                </div>
              )}

              {/* Gói Enterprise - Luôn hiển thị nếu không phải current plan */}
              {billing.currentPlan !== 'ENTERPRISE' && (
                <div className="border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:border-accent transition-all">
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg text-amber-600">ENTERPRISE</h4>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Best Value</span>
                    </div>
                    <p className="text-2xl font-black mt-2 text-on-surface">2,000,000 VND <span className="text-xs text-outline font-normal">/month</span></p>
                    <ul className="text-xs text-on-surface-variant space-y-2 mt-4">
                      <li className="flex items-center gap-2">✓ <strong>3,000</strong> AI Credits / tháng</li>
                      <li className="flex items-center gap-2">✓ Ưu tiên băng thông bóc tách AI</li>
                      <li className="flex items-center gap-2">✓ Hỗ trợ Custom Branding & API</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleUpgradePlan('ENTERPRISE')}
                    className="w-full mt-6 py-2 bg-accent text-on-surface text-sm font-bold rounded hover:bg-amber-400 transition-colors"
                  >
                    Choose Enterprise
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. MODAL MUA LẺ CREDIT (TOP-UP) ==================== */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-outline-variant animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} /> Buy Additional Credits
              </h3>
              <button onClick={() => setIsCreditModalOpen(false)} className="text-outline hover:text-on-surface text-lg font-semibold">✕</button>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Credits mua thêm sẽ được cộng dồn trực tiếp vào ví tiền hiện tại và không bị reset cuối tháng.</p>

            <div className="space-y-3">
              {/* Gói +50 Credits */}
              <div onClick={() => handleBuyCredits('CREDIT_50')} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container-low cursor-pointer transition-all group">
                <div>
                  <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">+50 AI Credits</p>
                  <p className="text-xs text-outline">Phù hợp nhu cầu sửa đổi CV ngắn hạn</p>
                </div>
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded text-on-surface">50,000đ</span>
              </div>

              {/* Gói +100 Credits */}
              <div onClick={() => handleBuyCredits('CREDIT_100')} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container-low cursor-pointer transition-all group">
                <div>
                  <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">+100 AI Credits</p>
                  <p className="text-xs text-outline">Gói phổ biến cho mùa rải hồ sơ ứng tuyển</p>
                </div>
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded text-on-surface">100,000đ</span>
              </div>

              {/* Gói +500 Credits */}
              <div onClick={() => handleBuyCredits('CREDIT_500')} className="flex items-center justify-between p-4 border border-primary/40 bg-primary/5 rounded-lg hover:bg-primary/10 cursor-pointer transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl">Save 10%</div>
                <div>
                  <p className="font-bold text-sm text-primary">+500 AI Credits</p>
                  <p className="text-xs text-outline">Dành cho Headhunter & Freelance Recruiter</p>
                </div>
                <span className="text-sm font-bold bg-primary text-white px-3 py-1 rounded-md">450,000đ</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}