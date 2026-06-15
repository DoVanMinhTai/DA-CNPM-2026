import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Edit3, Sparkles, Share2, Printer } from 'lucide-react'
import { sampleCV, analysisResults } from '../../data/mockData'

function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = '#ba1a1a'
  if (score >= 80) color = '#16a34a'
  else if (score >= 60) color = '#d97706'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ebefee" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  )
}

export default function CVDetailPage() {
  const { id } = useParams()

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-surface-container rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-on-surface-variant" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-on-surface">Software Engineer 2024</h1>
            <p className="text-sm text-outline">Last updated 2 days ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
            <Share2 size={14} />
            Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
            <Printer size={14} />
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
            <Download size={14} />
            Export
          </button>
          <Link to={`/cv/editor/${id}`} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors">
            <Edit3 size={14} />
            Edit CV
          </Link>
          <Link to={`/interviews/cv/${id}`} className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded hover:bg-primary/20 transition-colors">
            Generate Interview Questions
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CV Preview */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-8 md:p-10">
            <div className="text-center mb-8 pb-6 border-b border-surface-container">
              <h2 className="text-2xl font-bold text-on-surface">{sampleCV.personalInfo.fullName}</h2>
              <p className="text-sm text-on-surface-variant mt-2">
                {sampleCV.personalInfo.email} · {sampleCV.personalInfo.phone} · {sampleCV.personalInfo.location}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">Professional Summary</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{sampleCV.summary}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">Work Experience</h3>
              {sampleCV.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-bold text-on-surface">{exp.role}</h4>
                    <span className="text-xs text-outline">{exp.period}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-2">{exp.company}</p>
                  <ul className="space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-on-surface-variant flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">Education</h3>
              {sampleCV.education.map((edu, i) => (
                <div key={i} className="flex items-baseline justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{edu.degree}</p>
                    <p className="text-xs text-on-surface-variant">{edu.school}</p>
                  </div>
                  <span className="text-xs text-outline">{edu.year}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {sampleCV.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-surface-container text-xs text-on-surface rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis sidebar */}
        <div className="space-y-5">
          {/* Overall score */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              AI Analysis
            </h3>
            <div className="flex items-center justify-center mb-4">
              <ScoreRing score={analysisResults.overallScore} size={100} strokeWidth={8} />
            </div>
            <p className="text-center text-sm text-on-surface-variant">Overall CV Score</p>
          </div>

          {/* Category scores */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5">
            <h3 className="text-sm font-bold text-on-surface mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {analysisResults.categories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{cat.name}</span>
                    <span className="font-bold text-on-surface">{cat.score}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${cat.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <Link to="/ai-analysis" className="block w-full text-center px-4 py-2.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors">
            View Full Analysis →
          </Link>
        </div>
      </div>
    </div>
  )
}
