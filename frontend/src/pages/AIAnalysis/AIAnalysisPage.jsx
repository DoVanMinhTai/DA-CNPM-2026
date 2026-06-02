import { Sparkles, TrendingUp, AlertTriangle, Tag, CheckCircle, XCircle } from 'lucide-react'
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
  return (
    <div className="p-6 md:p-8 max-w-[1100px] animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <Sparkles size={24} className="text-primary" />
          AI Analysis
        </h1>
        <p className="text-on-surface-variant mt-1">Detailed analysis of your Software Engineer 2024 CV.</p>
      </div>

      {/* Overall score hero */}
      <div className="bg-gradient-to-r from-primary-dark to-primary rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-light/70 font-medium uppercase tracking-wider">Overall Score</p>
            <p className="text-5xl font-bold mt-2">{analysisResults.overallScore}%</p>
            <p className="text-sm text-primary-light/80 mt-2">Your CV is performing above average. A few optimizations could push it to 95%+.</p>
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (analysisResults.overallScore / 100) * 264} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{analysisResults.overallScore}</span>
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
              {analysisResults.categories.map((cat) => {
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
              {analysisResults.suggestions.map((sug, i) => {
                const Icon = suggestionIcons[sug.type]
                const colorClass = suggestionColors[sug.type]
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
              {analysisResults.matchedKeywords.map((kw) => (
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
              {analysisResults.missingKeywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-error-container/40 text-error text-xs font-medium rounded-full border border-error/20">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Quick action */}
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
            <Sparkles size={16} />
            Auto-Fix All Issues
          </button>
        </div>
      </div>
    </div>
  )
}
