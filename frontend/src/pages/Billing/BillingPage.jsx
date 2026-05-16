import { CreditCard, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { billingData } from '../../data/mockData'

export default function BillingPage() {
  const creditPercent = (billingData.credits.used / billingData.credits.total) * 100

  return (
    <div className="p-6 md:p-8 max-w-[1000px] animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-dark">Billing & Credits</h1>
        <p className="text-on-surface-variant mt-1">Manage your subscription and payment information.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-lg border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-secondary-dark">Current Plan</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                {billingData.currentPlan}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-secondary-dark">{billingData.amount}</span>
              <span className="text-sm text-outline">/month</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Next billing date: {billingData.nextBilling}</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors">
                Upgrade Plan
              </button>
              <button className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold text-secondary-dark mb-4">Payment Method</h2>
            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-700 to-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{billingData.paymentMethod.type}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-dark">•••• •••• •••• {billingData.paymentMethod.last4}</p>
                  <p className="text-xs text-outline">Expires {billingData.paymentMethod.expiry}</p>
                </div>
              </div>
              <button className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                Update
              </button>
            </div>
          </div>

          {/* Invoice History */}
          <div className="bg-white rounded-lg border border-outline-variant/30 p-6">
            <h2 className="text-lg font-bold text-secondary-dark mb-4">Invoice History</h2>
            <div className="overflow-hidden rounded-lg border border-outline-variant/20">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-4 py-3">Invoice</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-4 py-3">Date</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-outline px-4 py-3">Status</th>
                    <th className="text-right text-xs font-bold uppercase tracking-wider text-outline px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {billingData.invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-secondary-dark">{inv.id}</td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">{inv.date}</td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">{inv.amount}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle size={12} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 text-outline hover:text-primary rounded transition-colors">
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column — Credits */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-outline-variant/30 p-5">
            <h3 className="text-sm font-bold text-secondary-dark mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              AI Credits
            </h3>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-secondary-dark">{billingData.credits.total - billingData.credits.used}</span>
              <span className="text-sm text-outline ml-1">remaining</span>
            </div>
            <div className="h-3 bg-surface-container rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${creditPercent}%` }} />
            </div>
            <p className="text-xs text-outline text-center">{billingData.credits.used} of {billingData.credits.total} credits used this month</p>
            <button className="w-full mt-4 py-2.5 bg-accent text-secondary-dark text-sm font-semibold rounded hover:bg-amber-400 transition-colors">
              Buy More Credits
            </button>
          </div>

          <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-secondary-dark mb-1">Credit Reset</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Your credits will reset on {billingData.nextBilling}. Unused credits do not roll over.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
