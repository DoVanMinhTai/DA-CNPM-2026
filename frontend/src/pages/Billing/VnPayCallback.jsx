import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function VnPayCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // VNPay redirect trả về query params: status, message
  const status = searchParams.get('status')   // "success" | "failed"
  const message = searchParams.get('message') // Mô tả kết quả

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-lg p-8 text-center animate-fade-in">
        {/* Icon */}
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
          isSuccess ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isSuccess ? (
            <CheckCircle size={40} className="text-green-600" />
          ) : (
            <XCircle size={40} className="text-red-600" />
          )}
        </div>

        {/* Heading */}
        <h1 className={`text-2xl font-bold mb-2 ${
          isSuccess ? 'text-green-700' : 'text-red-700'
        }`}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>

        {/* Message */}
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          {message
            ? decodeURIComponent(message)
            : isSuccess
              ? 'Your payment has been processed successfully. Your plan and credits have been updated.'
              : 'Something went wrong with your payment. Please try again or contact support.'}
        </p>

        {/* Back to Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Secondary link to billing */}
        {isSuccess && (
          <button
            onClick={() => navigate('/billing')}
            className="block mx-auto mt-3 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            View Billing Details →
          </button>
        )}
      </div>
    </div>
  )
}
