import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, Tag, CheckCircle, XCircle, Edit3, Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cvApi } from '../../api/cvApi'
import { analysisResults } from '../../data/mockData'

const suggestionIcons = {
  improvement: TrendingUp,
  keyword: Tag,
  format: AlertTriangle,
}

const suggestionColors = {
  improvement: 'bg-blue-50 text-blue-600 border-blue-100',
  keyword: 'bg-purple-50 text-purple-600 border-purple-100',
  format: 'bg-amber-50 text-amber-600 border-amber-100',
}

export default function AIAnalysisPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { cvData, cvId, originalFileUrl, cvName } = location.state || {}
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cvId) {
      const fetchAnalysis = async () => {
        setLoading(true)
        try {
          const data = await cvApi.getCvAnalysis(cvId)
          setAnalysis(data)
        } catch (error) {
          console.error('Failed to fetch CV analysis:', error)
          toast.error(error.response?.data?.message || 'Không thể tải kết quả phân tích bằng AI!')
          // Fallback to mock data on error
          setAnalysis(analysisResults)
        } finally {
          setLoading(false)
        }
      }
      fetchAnalysis()
    } else {
      setAnalysis(analysisResults)
    }
  }, [cvId])

  const handleGoToEditor = () => {
    if (cvId) {
      navigate(`/cv/editor/${cvId}`, {
        state: { cvData, cvId, originalFileUrl, cvName }
      })
    } else {
      navigate('/cv/editor')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
            <Loader2 size={36} className="text-primary animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
            <Sparkles size={14} className="text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-secondary-dark mb-2 animate-pulse">
          AI Gemini đang phân tích CV của bạn...
        </h3>
        <p className="text-sm text-outline max-w-sm">
          Hệ thống đang quét các tiêu chí ATS, mức độ từ khóa và chất lượng nội dung. Việc này có thể mất vài giây.
        </p>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="p-6 md:p-8 max-w-[1100px] animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Sparkles size={24} className="text-primary" />
            AI Analysis
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            {cvName ? `Detailed analysis of your ${cvName} CV.` : 'Detailed analysis of your Software Engineer 2024 CV.'}
          </p>
        </div>
        <button
          onClick={handleGoToEditor}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:scale-[1.02]"
        >
          <Edit3 size={16} />
          Đi tới Trình chỉnh sửa CV
        </button>
      </div>

      {/* Overall score hero */}
      <div className="bg-gradient-to-r from-primary-dark to-primary rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-light/70 font-medium uppercase tracking-wider">Overall Score</p>
            <p className="text-5xl font-bold mt-2">{analysis.overallScore}%</p>
            <p className="text-sm text-primary-light/80 mt-2">Your CV is performing above average. A few optimizations could push it to 95%+.</p>
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (analysis.overallScore / 100) * 264} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{analysis.overallScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category breakdown */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
            <h2 className="text-lg font-bold text-on-surface mb-5">Score Breakdown</h2>
            <div className="space-y-4">
              {(analysis.categories || []).map((cat) => {
                let barColor = 'bg-error'
                if (cat.score >= 80) barColor = 'bg-green-500'
                else if (cat.score >= 60) barColor = 'bg-amber-500'

                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface">{cat.name}</span>
                      <span className="font-bold text-on-surface">{cat.score}/{cat.maxScore}</span>
                    </div>
                    <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${cat.score}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
            <h2 className="text-lg font-bold text-on-surface mb-5">Improvement Suggestions</h2>
            <div className="space-y-3">
              {(analysis.suggestions || []).map((sug, i) => {
                const Icon = suggestionIcons[sug.type] || TrendingUp
                const colorClass = suggestionColors[sug.type] || 'bg-blue-50 text-blue-600 border-blue-100'
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${colorClass}`}>
                    <Icon size={18} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{sug.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Matched keywords */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Matched Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {(analysis.matchedKeywords || []).map((kw) => (
                <span key={kw} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Missing keywords */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-error" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {(analysis.missingKeywords || []).map((kw) => (
                <span key={kw} className="px-3 py-1 bg-error-container/40 text-error text-xs font-medium rounded-full border border-error/20">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Quick action */}
          <button 
            onClick={handleGoToEditor}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Edit3 size={16} />
            Mở Trình chỉnh sửa CV
          </button>
        </div>
      </div>
    </div>
  )
}
