import { useState } from 'react'
import { Check, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { pricingPlans, faqData } from '../../data/mockData'

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container-low transition-colors">
        <span className="text-sm font-medium text-on-surface">{question}</span>
        {open ? <ChevronUp size={18} className="text-outline" /> : <ChevronDown size={18} className="text-outline" />}
      </button>
      {open && (
        <div className="px-5 pb-5 animate-fade-in">
          <p className="text-sm text-on-surface-variant leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-32 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
            Choose the plan that fits your career goals. Upgrade anytime.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-on-surface' : 'text-outline'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-12 h-6 rounded-full transition-colors relative ${annual ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`w-5 h-5 bg-surface-container-lowest rounded-full absolute top-0.5 transition-transform shadow-sm ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-on-surface' : 'text-outline'}`}>Annual</span>
            {annual && <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">Save 20%</span>}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {pricingPlans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative bg-surface-container-lowest rounded-xl border p-6 md:p-8 transition-all duration-300 hover:shadow-lg animate-fade-in ${
                plan.popular
                  ? 'border-primary shadow-md scale-105 z-10'
                  : 'border-outline-variant hover:border-primary/30'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Star size={12} />
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-on-surface">
                  ${annual && plan.price !== '0' ? Math.round(Number(plan.price) * 0.8) : plan.price}
                </span>
                <span className="text-sm text-outline ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.price === '0' ? '/register' : '#'}
                className={`block w-full text-center py-3 text-sm font-semibold rounded transition-all duration-200 ${
                  plan.popular
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-on-surface text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqData.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
