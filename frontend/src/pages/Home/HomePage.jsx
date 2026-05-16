import { Link } from 'react-router-dom'
import { ArrowRight, Edit3, BarChart3, Sparkles, CheckCircle, Lightbulb } from 'lucide-react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { heroData, features, editorPreview } from '../../data/mockData'

const iconMap = { Edit3, BarChart3, Sparkles, CheckCircle }

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto w-full">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-secondary-dark leading-tight tracking-tight mb-6">
            {heroData.title}
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-2xl mx-auto">
            {heroData.subtitle}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded shadow-lg hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {heroData.cta}
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Floating decorative elements */}
        <div className="relative mt-16 max-w-4xl mx-auto">
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary-light/20 rounded-full blur-2xl animate-float" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-float delay-300" />

          {/* Hero visual — mock dashboard card */}
          <div className="bg-white rounded-xl shadow-xl border border-surface-container p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-error" />
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-outline font-medium">CareerAI Editor</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-4 bg-surface-container rounded w-3/4" />
                <div className="h-3 bg-surface-container rounded w-full" />
                <div className="h-3 bg-surface-container rounded w-5/6" />
                <div className="h-3 bg-surface-container rounded w-2/3" />
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#ebefee" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#008080" strokeWidth="8" strokeDasharray="264" strokeDashoffset="40" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">87%</span>
                    <span className="text-xs text-outline">Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark mb-4">
              Precision Tools for Modern Professionals
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              Elevate your application with an intelligent suite designed to highlight your true potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = iconMap[feature.icon]
              return (
                <div
                  key={feature.title}
                  className="group p-6 bg-surface rounded-lg border border-outline-variant/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-dark mb-2">{feature.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Editor Preview Section */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark mb-4">
              {editorPreview.title}
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              {editorPreview.subtitle}
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-6">
            {/* Experience preview */}
            <div className="md:col-span-3 bg-white rounded-lg border border-outline-variant/30 p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-outline mb-4">Professional Experience</h3>
              <div className="mb-4">
                <h4 className="text-lg font-bold text-secondary-dark">{editorPreview.experience.role}</h4>
                <p className="text-sm text-on-surface-variant">{editorPreview.experience.company} | {editorPreview.experience.period}</p>
              </div>
              <ul className="space-y-2.5 mb-4">
                {editorPreview.experience.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              {/* AI Tip */}
              <div className="flex items-start gap-3 p-3.5 bg-accent/10 rounded-lg border border-accent/20">
                <Lightbulb size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-secondary-dark leading-relaxed">{editorPreview.experience.aiTip}</p>
              </div>
            </div>

            {/* Skills preview */}
            <div className="md:col-span-2 bg-white rounded-lg border border-outline-variant/30 p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-outline mb-4">Core Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {editorPreview.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-surface-container text-sm text-secondary-dark rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your career?
          </h2>
          <p className="text-lg text-primary-light mb-8">
            Join thousands of professionals who've already optimized their CVs with AI.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary font-semibold rounded shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
