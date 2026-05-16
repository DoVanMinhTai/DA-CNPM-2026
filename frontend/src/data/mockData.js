// ===== Navigation =====
export const publicNavLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
]

// ===== Home Page =====
export const heroData = {
  title: 'Optimize your CV with AI',
  subtitle: 'Precision-engineered career empowerment. Transform your professional narrative into a compelling, data-driven profile that commands attention.',
  cta: 'Create free CV now',
}

export const features = [
  {
    icon: 'Edit3',
    title: 'Online Editor',
    description: 'A fluid, distraction-free environment tailored for crafting your professional story with ease.',
  },
  {
    icon: 'BarChart3',
    title: 'CV Scoring Tool',
    description: 'Instantly benchmark your CV against industry standards with our proprietary AI algorithm.',
  },
  {
    icon: 'Sparkles',
    title: 'Keyword Suggestions',
    description: 'Dynamically inject high-impact terminology tailored to your target job descriptions.',
  },
  {
    icon: 'CheckCircle',
    title: 'Auto-Correction',
    description: 'Ensure absolute structural and grammatical precision before you submit.',
  },
]

export const editorPreview = {
  title: 'Intelligent Editing in Action',
  subtitle: 'Experience real-time optimization as you build your profile.',
  experience: {
    role: 'Senior Product Manager',
    company: 'TechFlow Solutions',
    period: '2020 - Present',
    bullets: [
      'Led cross-functional teams to deliver enterprise software solutions.',
      'Managed product roadmap and strategy.',
      'Collaborated with design and engineering departments.',
    ],
    aiTip: 'Use action verbs and quantify impact: "Spearheaded product roadmap, resulting in 25% revenue growth."',
  },
  skills: ['Product Strategy', 'Agile/Scrum', 'Data Analysis', 'Team Leadership', 'UX Research'],
}

// ===== Dashboard =====
export const dashboardUser = {
  name: 'Alex Thompson',
  email: 'alex@techflow.com',
  avatar: null,
  plan: 'Pro',
}

export const dashboardStats = [
  { label: 'Total CVs', value: '3', icon: 'FileText', change: '+1 this month' },
  { label: 'AI Analyses', value: '12', icon: 'Brain', change: '+4 this week' },
  { label: 'Avg. Score', value: '87%', icon: 'TrendingUp', change: '+5% improvement' },
  { label: 'Credits', value: '45', icon: 'Coins', change: '15 used this month' },
]

export const recentDocuments = [
  {
    id: '1',
    title: 'Software Engineer 2024',
    updatedAt: '2 days ago',
    score: 92,
    status: 'optimized',
  },
  {
    id: '2',
    title: 'Product Manager - Tech',
    updatedAt: 'Last week',
    score: 78,
    status: 'needs-review',
  },
  {
    id: '3',
    title: 'Legacy Tech CV',
    updatedAt: '2 months ago',
    score: 54,
    status: 'outdated',
  },
]

// ===== CV Editor =====
export const cvSections = [
  'Personal Information',
  'Professional Summary',
  'Work Experience',
  'Education',
  'Skills',
  'Projects',
  'Certifications',
]

export const sampleCV = {
  personalInfo: {
    fullName: 'Alex Thompson',
    email: 'alex@techflow.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexthompson',
  },
  summary: 'Results-driven Senior Product Manager with 5+ years of experience in enterprise SaaS. Expert in translating complex technical requirements into actionable product roadmaps that drive measurable business growth.',
  experience: [
    {
      role: 'Senior Product Manager',
      company: 'TechFlow Solutions',
      period: 'Jan 2020 - Present',
      bullets: [
        'Led cross-functional teams of 12+ to deliver enterprise software solutions, resulting in $2.4M ARR growth.',
        'Managed product roadmap and strategy across 3 product lines.',
        'Collaborated with design and engineering departments to ship 15+ features.',
      ],
    },
    {
      role: 'Product Manager',
      company: 'DataVision Inc.',
      period: 'Mar 2017 - Dec 2019',
      bullets: [
        'Launched 2 new product features generating $800K in new revenue.',
        'Conducted user research with 200+ customers to inform product decisions.',
      ],
    },
  ],
  education: [
    {
      degree: 'M.S. Computer Science',
      school: 'Stanford University',
      year: '2017',
    },
    {
      degree: 'B.S. Business Administration',
      school: 'UC Berkeley',
      year: '2015',
    },
  ],
  skills: ['Product Strategy', 'Agile/Scrum', 'Data Analysis', 'SQL', 'Python', 'UX Research', 'A/B Testing', 'Stakeholder Management'],
}

// ===== AI Analysis =====
export const analysisResults = {
  overallScore: 87,
  categories: [
    { name: 'Content Quality', score: 92, maxScore: 100 },
    { name: 'ATS Compatibility', score: 85, maxScore: 100 },
    { name: 'Keyword Density', score: 78, maxScore: 100 },
    { name: 'Format & Structure', score: 91, maxScore: 100 },
    { name: 'Impact Metrics', score: 82, maxScore: 100 },
  ],
  suggestions: [
    { type: 'improvement', text: 'Add quantifiable metrics to 3 more bullet points for stronger impact.' },
    { type: 'keyword', text: 'Include "stakeholder management" and "cross-functional collaboration" keywords.' },
    { type: 'format', text: 'Consider adding a "Projects" section to showcase hands-on technical work.' },
    { type: 'improvement', text: 'Strengthen your professional summary with measurable achievements.' },
  ],
  matchedKeywords: ['Product Management', 'Agile', 'Cross-functional', 'Revenue Growth', 'SaaS', 'Data Analysis'],
  missingKeywords: ['Stakeholder Management', 'OKRs', 'Go-to-Market', 'Customer Success', 'KPIs'],
}

// ===== Pricing =====
export const pricingPlans = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    description: 'Perfect for getting started with AI-powered CV building.',
    features: [
      '1 CV document',
      'Basic AI suggestions',
      'Standard templates',
      'PDF export',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '19',
    period: '/month',
    description: 'For professionals serious about career advancement.',
    features: [
      'Unlimited CV documents',
      'Advanced AI analysis',
      'Premium templates',
      'PDF & DOCX export',
      'Keyword optimization',
      'ATS compatibility check',
      '50 AI credits/month',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '49',
    period: '/month',
    description: 'Complete career suite for power users.',
    features: [
      'Everything in Professional',
      'Unlimited AI credits',
      'Priority support',
      'Custom branding',
      'Team collaboration',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export const faqData = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'What are AI credits?',
    answer: 'AI credits are used for advanced AI features like CV analysis, keyword suggestions, and auto-correction. Each analysis or suggestion uses credits.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption and never share your personal data with third parties.',
  },
  {
    question: 'Can I switch plans?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
]

// ===== Billing =====
export const billingData = {
  currentPlan: 'Professional',
  nextBilling: 'June 15, 2024',
  amount: '$19.00',
  credits: { used: 35, total: 50 },
  paymentMethod: {
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
  },
  invoices: [
    { id: 'INV-001', date: 'May 15, 2024', amount: '$19.00', status: 'Paid' },
    { id: 'INV-002', date: 'Apr 15, 2024', amount: '$19.00', status: 'Paid' },
    { id: 'INV-003', date: 'Mar 15, 2024', amount: '$19.00', status: 'Paid' },
  ],
}

// ===== Settings =====
export const settingsData = {
  personalInfo: {
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex@techflow.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Senior Product Manager passionate about building impactful software products.',
  },
  notifications: {
    emailUpdates: true,
    aiSuggestions: true,
    weeklyDigest: false,
    marketingEmails: false,
  },
}

// ===== Sidebar Navigation =====
export const sidebarLinks = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'FileText', label: 'My CVs', path: '/dashboard', section: 'cvs' },
  { icon: 'CreditCard', label: 'Billing', path: '/billing' },
  { icon: 'Settings', label: 'Settings', path: '/settings' },
]
