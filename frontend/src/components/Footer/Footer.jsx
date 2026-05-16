import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface py-12 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold text-white">CareerAI</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Precision-engineered career empowerment. Build, optimize, and perfect your professional profile.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/cv/editor" className="text-sm text-gray-300 hover:text-white transition-colors">CV Editor</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-gray-500 text-center">
            © 2024 CareerAI. Precision-engineered career empowerment. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
