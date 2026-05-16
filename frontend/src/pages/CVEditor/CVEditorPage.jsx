import { useState } from 'react'
import { Save, Download, Eye, Sparkles, ChevronDown, Plus, Trash2, GripVertical } from 'lucide-react'
import { cvSections, sampleCV } from '../../data/mockData'

export default function CVEditorPage() {
  const [activeSection, setActiveSection] = useState('Personal Information')

  return (
    <div className="flex h-full">
      {/* Editor panel */}
      <div className="flex-1 flex flex-col border-r border-outline-variant/30">
        {/* Toolbar */}
        <div className="h-14 border-b border-surface-container flex items-center justify-between px-5 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-secondary-dark">CV Editor</h2>
            <span className="text-xs text-outline px-2 py-0.5 bg-surface-container rounded">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
              <Sparkles size={14} className="text-accent" />
              AI Suggest
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
              <Eye size={14} />
              Preview
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container rounded transition-colors">
              <Download size={14} />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors">
              <Save size={14} />
              Save
            </button>
          </div>
        </div>

        {/* Section list + editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sections sidebar */}
          <div className="w-56 border-r border-surface-container bg-surface-container-low py-4 overflow-y-auto">
            <p className="px-4 mb-3 text-xs font-bold uppercase tracking-wider text-outline">Sections</p>
            {cvSections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                  activeSection === section
                    ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <GripVertical size={14} className="text-outline-variant" />
                {section}
              </button>
            ))}
            <button className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-primary hover:bg-primary/5 transition-colors mt-2">
              <Plus size={14} />
              Add Section
            </button>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeSection === 'Personal Information' && (
              <div className="max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-secondary-dark mb-6">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-dark mb-1.5">Full Name</label>
                    <input type="text" defaultValue={sampleCV.personalInfo.fullName} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-dark mb-1.5">Email</label>
                    <input type="email" defaultValue={sampleCV.personalInfo.email} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-dark mb-1.5">Phone</label>
                    <input type="tel" defaultValue={sampleCV.personalInfo.phone} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-dark mb-1.5">Location</label>
                    <input type="text" defaultValue={sampleCV.personalInfo.location} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-secondary-dark mb-1.5">LinkedIn</label>
                    <input type="url" defaultValue={sampleCV.personalInfo.linkedin} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'Professional Summary' && (
              <div className="max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-secondary-dark mb-6">Professional Summary</h3>
                <textarea defaultValue={sampleCV.summary} rows={6} className="w-full px-3 py-2.5 bg-surface border border-outline-variant/50 rounded text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none" />
                <div className="mt-3 flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <Sparkles size={14} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-secondary-dark">AI Tip: Start with years of experience and key achievement. Example: "Results-driven PM with 5+ years driving $2M+ in revenue growth."</p>
                </div>
              </div>
            )}

            {activeSection === 'Work Experience' && (
              <div className="max-w-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-secondary-dark">Work Experience</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded transition-colors">
                    <Plus size={14} />
                    Add Experience
                  </button>
                </div>
                {sampleCV.experience.map((exp, i) => (
                  <div key={i} className="mb-6 p-4 bg-surface rounded-lg border border-outline-variant/30 group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-base font-semibold text-secondary-dark">{exp.role}</h4>
                        <p className="text-sm text-on-surface-variant">{exp.company} | {exp.period}</p>
                      </div>
                      <button className="p-1.5 text-outline hover:text-error rounded opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <input type="text" defaultValue={bullet} className="flex-1 bg-transparent border-none outline-none text-sm focus:text-on-surface" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'Skills' && (
              <div className="max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-secondary-dark mb-6">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sampleCV.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-sm text-secondary-dark rounded-full">
                      {skill}
                      <button className="hover:text-error transition-colors"><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a skill..." className="flex-1 px-3 py-2 bg-surface border border-outline-variant/50 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  <button className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dark transition-colors">Add</button>
                </div>
              </div>
            )}

            {!['Personal Information', 'Professional Summary', 'Work Experience', 'Skills'].includes(activeSection) && (
              <div className="max-w-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-secondary-dark mb-6">{activeSection}</h3>
                <div className="text-center py-12 text-outline">
                  <p className="text-sm">Start adding your {activeSection.toLowerCase()} details.</p>
                  <button className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded transition-colors">
                    <Plus size={14} />
                    Add Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview panel */}
      <div className="hidden xl:block w-[420px] bg-surface-container-low overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-outline-variant/30 shadow-sm p-8 min-h-[600px]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-secondary-dark">{sampleCV.personalInfo.fullName}</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {sampleCV.personalInfo.email} · {sampleCV.personalInfo.phone}
            </p>
            <p className="text-sm text-on-surface-variant">{sampleCV.personalInfo.location}</p>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b border-primary/20 pb-1">Professional Summary</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{sampleCV.summary}</p>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b border-primary/20 pb-1">Experience</h4>
            {sampleCV.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <p className="text-xs font-semibold text-secondary-dark">{exp.role}</p>
                <p className="text-[11px] text-outline">{exp.company} | {exp.period}</p>
                <ul className="mt-1 space-y-0.5">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="text-[11px] text-on-surface-variant flex items-start gap-1">
                      <span className="w-1 h-1 rounded-full bg-outline mt-1.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b border-primary/20 pb-1">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {sampleCV.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-surface-container text-[10px] text-secondary-dark rounded">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
