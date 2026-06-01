import { useState, useRef } from 'react'
import {
  Save, Download, ChevronDown, Plus, Trash2, Undo2, Redo2,
  MousePointer2, Hand, Type, PenLine, Highlighter, Shapes, Image, PenTool,
  Minus, ZoomIn, FileText, Grid3X3, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Upload, X
} from 'lucide-react'
import { sampleCV } from '../../data/mockData'

const tools = [
  { icon: MousePointer2, label: 'Select', id: 'select' },
  { icon: Hand, label: 'Pan', id: 'pan' },
  { icon: Type, label: 'Text', id: 'text' },
  { icon: PenLine, label: 'Draw', id: 'draw' },
  { icon: Highlighter, label: 'Highlight', id: 'highlight' },
  { icon: Shapes, label: 'Shapes', id: 'shapes' },
  { icon: Image, label: 'Image', id: 'image' },
  { icon: PenTool, label: 'Signature', id: 'signature' },
]

const fontOptions = ['Inter', 'Roboto', 'Lora', 'Space Mono']

const colorSwatches = [
  { color: '#008080', label: 'Primary' },
  { color: '#181C1C', label: 'Dark' },
  { color: '#4E6073', label: 'Secondary' },
  { color: '#ba1a1a', label: 'Error' },
]

export default function CVEditorPage() {
  const [activeTool, setActiveTool] = useState('select')
  const [zoom, setZoom] = useState(100)
  const [selectedElement, setSelectedElement] = useState('summary')
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [fontSize, setFontSize] = useState(16)
  const [isBold, setIsBold] = useState(true)
  const [isItalic, setIsItalic] = useState(false)
  const [textAlign, setTextAlign] = useState('left')
  const [activeColor, setActiveColor] = useState('#008080')
  const [opacity, setOpacity] = useState(85)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [activePage, setActivePage] = useState(1)
  const fileInputRef = useRef(null)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 30))

  return (
    <div className="flex flex-col h-full bg-surface-container-highest overflow-hidden">
      {/* ========== HEADER TOOLBAR ========== */}
      <header className="bg-surface shadow-sm px-6 lg:px-10 py-3 flex items-center justify-between z-30 border-b border-outline-variant flex-shrink-0">
        {/* Left: File info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-primary leading-none">
              Senior_Product_Designer_CV.pdf
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 mt-0.5">
              Saved 2 minutes ago
            </p>
          </div>
        </div>

        {/* Center: Zoom controls */}
        <div className="hidden md:flex items-center bg-surface-container rounded-full px-3 py-1 gap-3">
          <button
            onClick={handleZoomOut}
            className="hover:text-primary transition-colors flex items-center p-0.5"
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>
          <span className="font-bold text-xs min-w-[36px] text-center select-none">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="hover:text-primary transition-colors flex items-center p-0.5"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex gap-1 text-on-surface-variant">
            <button className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="Undo">
              <Undo2 size={18} />
            </button>
            <button className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors" title="Redo">
              <Redo2 size={18} />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-outline/40 rounded-xl font-bold text-xs hover:bg-surface-container-high transition-all">
              <Save size={14} />
              Save
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all shadow-sm">
                Export
                <ChevronDown size={14} />
              </button>
              {/* Export Dropdown */}
              <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-44 bg-surface-container-lowest border border-outline-variant/40 shadow-xl rounded-xl overflow-hidden py-1.5 z-50">
                <button className="w-full px-4 py-2 hover:bg-surface-container flex items-center gap-2.5 text-xs text-left transition-colors">
                  <FileText size={14} className="text-primary" /> PDF
                </button>
                <button className="w-full px-4 py-2 hover:bg-surface-container flex items-center gap-2.5 text-xs text-left transition-colors">
                  <Image size={14} className="text-primary" /> Image
                </button>
                <button className="w-full px-4 py-2 hover:bg-surface-container flex items-center gap-2.5 text-xs text-left transition-colors">
                  <Download size={14} className="text-primary" /> Word
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN BODY ========== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="flex border-r border-outline-variant/40 bg-surface z-20 flex-shrink-0">
          {/* Column 1: Vertical Toolbar */}
          <div className="w-14 flex flex-col items-center py-5 gap-4 border-r border-outline-variant">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id)
                  if (tool.id === 'image') setShowUploadModal(true)
                }}
                className={`p-2 rounded-xl transition-all ${
                  activeTool === tool.id
                    ? 'text-white bg-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
                title={tool.label}
              >
                <tool.icon size={18} />
              </button>
            ))}
          </div>

          {/* Column 2: Page Thumbnails */}
          <div className="w-48 flex flex-col p-3 bg-surface-container-low">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs text-primary">Total Pages: 2</h3>
              <Grid3X3 size={16} className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
            </div>
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              {/* Page 1 Thumbnail */}
              <div
                className={`relative group cursor-pointer ${activePage === 1 ? '' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                onClick={() => setActivePage(1)}
              >
                <div className={`aspect-[1/1.414] bg-surface-container-lowest rounded shadow-sm overflow-hidden p-1.5 border-2 ${activePage === 1 ? 'border-primary' : 'border-outline-variant/40'} transition-colors`}>
                  <div className="w-full h-full bg-surface-container rounded-sm flex flex-col items-center justify-center p-2 gap-1">
                    <div className="w-full h-2 bg-primary/20 rounded" />
                    <div className="w-3/4 h-1.5 bg-outline-variant/30 rounded" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded mt-1" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded" />
                    <div className="w-2/3 h-1 bg-outline-variant/20 rounded" />
                    <div className="w-full h-1.5 bg-primary/10 rounded mt-2" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded" />
                  </div>
                </div>
                <span className={`absolute -left-1.5 top-0 text-[9px] px-1 rounded font-bold ${activePage === 1 ? 'bg-primary text-white' : 'bg-outline text-white'}`}>
                  1
                </span>
                <button className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-error text-white p-0.5 rounded transition-opacity" title="Delete page">
                  <Trash2 size={10} />
                </button>
              </div>

              {/* Page 2 Thumbnail */}
              <div
                className={`relative group cursor-pointer ${activePage === 2 ? '' : 'opacity-60 hover:opacity-100'} transition-opacity`}
                onClick={() => setActivePage(2)}
              >
                <div className={`aspect-[1/1.414] bg-surface-container-lowest rounded shadow-sm overflow-hidden p-1.5 border-2 ${activePage === 2 ? 'border-primary' : 'border-outline-variant/40'} transition-colors`}>
                  <div className="w-full h-full bg-surface-container rounded-sm flex flex-col items-center justify-center p-2 gap-1">
                    <div className="w-full h-1.5 bg-primary/15 rounded" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded" />
                    <div className="w-3/4 h-1 bg-outline-variant/20 rounded" />
                    <div className="w-full h-1.5 bg-primary/10 rounded mt-2" />
                    <div className="w-full h-1 bg-outline-variant/20 rounded" />
                    <div className="w-2/3 h-1 bg-outline-variant/20 rounded" />
                  </div>
                </div>
                <span className={`absolute -left-1.5 top-0 text-[9px] px-1 rounded font-bold ${activePage === 2 ? 'bg-primary text-white' : 'bg-outline text-white'}`}>
                  2
                </span>
                <button className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-error text-white p-0.5 rounded transition-opacity" title="Delete page">
                  <Trash2 size={10} />
                </button>
              </div>

              {/* Add Page */}
              <button className="w-full aspect-[1/1.414] border-2 border-dashed border-outline-variant rounded flex flex-col items-center justify-center gap-1 text-outline hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                <Plus size={18} />
                <span className="text-[9px] font-bold">Add Page</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ===== MAIN CANVAS ===== */}
        <main className="flex-1 overflow-auto p-6 lg:p-10 flex justify-center items-start relative bg-surface-container-highest">
          <div
            className="bg-surface-container-lowest shadow-lg relative flex flex-col gap-6 select-none transition-transform duration-200"
            style={{
              width: `${794 * (zoom / 100)}px`,
              aspectRatio: '1 / 1.414',
              padding: `${48 * (zoom / 100)}px`,
            }}
          >
            {/* CV Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2
                  className="text-primary font-bold"
                  style={{ fontSize: `${Math.max(24, 32 * (zoom / 100))}px`, lineHeight: 1.2 }}
                >
                  {sampleCV.personalInfo.fullName}
                </h2>
                <p
                  className="text-secondary font-semibold"
                  style={{ fontSize: `${Math.max(12, 16 * (zoom / 100))}px` }}
                >
                  Senior Product Designer
                </p>
              </div>
              <div
                className="bg-primary rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0"
                style={{
                  width: `${80 * (zoom / 100)}px`,
                  height: `${80 * (zoom / 100)}px`,
                  fontSize: `${Math.max(16, 28 * (zoom / 100))}px`,
                }}
              >
                AT
              </div>
            </div>

            {/* Selected Element (Summary) - with dashed selection border */}
            <div
              className={`relative p-2 cursor-move group transition-all ${
                selectedElement === 'summary'
                  ? 'border-2 border-dashed border-primary'
                  : 'border-2 border-transparent hover:border-outline-variant/40 hover:border-dashed'
              }`}
              onClick={() => setSelectedElement('summary')}
            >
              <p
                className="text-on-surface-variant leading-relaxed"
                style={{ fontSize: `${Math.max(10, 14 * (zoom / 100))}px` }}
              >
                {sampleCV.summary}
              </p>
              {/* Selection handles */}
              {selectedElement === 'summary' && (
                <>
                  <span className="absolute -top-1 -left-1 w-2 h-2 bg-primary border border-white" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary border border-white" />
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-white" />
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary border border-white" />
                </>
              )}
            </div>

            {/* Experience Section */}
            <div
              className={`space-y-3 p-2 cursor-pointer transition-all ${
                selectedElement === 'experience'
                  ? 'border-2 border-dashed border-primary'
                  : 'border-2 border-transparent hover:border-outline-variant/40 hover:border-dashed'
              }`}
              onClick={() => setSelectedElement('experience')}
            >
              <h3
                className="border-b-2 border-primary-dim text-primary font-bold uppercase tracking-widest pb-1"
                style={{ fontSize: `${Math.max(9, 12 * (zoom / 100))}px` }}
              >
                Experience
              </h3>
              {sampleCV.experience.map((exp, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold" style={{ fontSize: `${Math.max(10, 14 * (zoom / 100))}px` }}>
                      {exp.role} @ {exp.company}
                    </span>
                    <span className="text-on-surface-variant/60" style={{ fontSize: `${Math.max(9, 12 * (zoom / 100))}px` }}>
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {exp.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="text-on-surface-variant flex items-start gap-1.5"
                        style={{ fontSize: `${Math.max(9, 12 * (zoom / 100))}px` }}
                      >
                        <span className="w-1 h-1 rounded-full bg-outline mt-1.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {selectedElement === 'experience' && (
                <>
                  <span className="absolute -top-1 -left-1 w-2 h-2 bg-primary border border-white" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary border border-white" />
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-white" />
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary border border-white" />
                </>
              )}
            </div>

            {/* Education Section */}
            <div
              className={`space-y-2 p-2 cursor-pointer transition-all ${
                selectedElement === 'education'
                  ? 'border-2 border-dashed border-primary'
                  : 'border-2 border-transparent hover:border-outline-variant/40 hover:border-dashed'
              }`}
              onClick={() => setSelectedElement('education')}
            >
              <h3
                className="border-b-2 border-primary-dim text-primary font-bold uppercase tracking-widest pb-1"
                style={{ fontSize: `${Math.max(9, 12 * (zoom / 100))}px` }}
              >
                Education
              </h3>
              {sampleCV.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold" style={{ fontSize: `${Math.max(10, 13 * (zoom / 100))}px` }}>
                      {edu.degree}
                    </span>
                    <span className="text-on-surface-variant" style={{ fontSize: `${Math.max(9, 12 * (zoom / 100))}px` }}>
                      {' '}— {edu.school}
                    </span>
                  </div>
                  <span className="text-on-surface-variant/60" style={{ fontSize: `${Math.max(9, 11 * (zoom / 100))}px` }}>
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div
              className={`p-2 cursor-pointer transition-all ${
                selectedElement === 'skills'
                  ? 'border-2 border-dashed border-primary'
                  : 'border-2 border-transparent hover:border-outline-variant/40 hover:border-dashed'
              }`}
              onClick={() => setSelectedElement('skills')}
            >
              <h3
                className="border-b-2 border-primary-dim text-primary font-bold uppercase tracking-widest pb-1 mb-2"
                style={{ fontSize: `${Math.max(9, 12 * (zoom / 100))}px` }}
              >
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sampleCV.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant rounded text-center"
                    style={{ fontSize: `${Math.max(8, 11 * (zoom / 100))}px` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ===== RIGHT SIDEBAR (Properties Panel) ===== */}
        <aside className="hidden lg:flex w-72 xl:w-80 border-l border-outline-variant/40 bg-surface flex-col z-20 flex-shrink-0">
          <div className="p-5 border-b border-outline-variant flex-1 overflow-y-auto">
            <h3 className="font-bold text-sm text-primary mb-5">Text Properties</h3>
            <div className="space-y-5">
              {/* Font Family */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 block">
                  Font Family
                </label>
                <div className="relative">
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full bg-surface-container rounded-xl border-none text-xs font-medium py-2.5 px-3 appearance-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {fontOptions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none text-outline" />
                </div>
              </div>

              {/* Font Size + B/I */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 block">
                    Size
                  </label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full bg-surface-container rounded-xl border-none text-xs font-medium py-2.5 px-3 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-end gap-1">
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                      isBold ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                      isItalic ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <Italic size={14} />
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="flex gap-1">
                {[
                  { value: 'left', Icon: AlignLeft },
                  { value: 'center', Icon: AlignCenter },
                  { value: 'right', Icon: AlignRight },
                ].map(({ value, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTextAlign(value)}
                    className={`p-2 transition-all ${
                      textAlign === value
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>

              {/* Text Color */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Text Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch.color}
                      onClick={() => setActiveColor(swatch.color)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        activeColor === swatch.color
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                      title={swatch.label}
                    />
                  ))}
                  {/* No color */}
                  <button className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
                    <span className="w-px h-7 bg-error rotate-45" />
                  </button>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
                  Opacity
                  <span>{opacity}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-primary bg-surface-container h-1 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Delete Element */}
          <div className="p-5 border-t border-outline-variant">
            <button className="w-full py-3 border-2 border-error text-error rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-error hover:text-white transition-all text-sm">
              <Trash2 size={16} />
              Delete Element
            </button>
          </div>
        </aside>
      </div>

      {/* ========== IMAGE UPLOAD MODAL ========== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          />
          {/* Modal */}
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-base font-bold">Upload Portfolio Image</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="hover:bg-surface-container-high p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-7">
              <div
                className="border-2 border-dashed border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">Drag and drop your image here</p>
                  <p className="text-xs text-on-surface-variant/60 mt-0.5">
                    Supports JPG, PNG (Max 5MB)
                  </p>
                </div>
                <button className="px-5 py-1.5 bg-secondary-container text-on-surface rounded-full font-bold text-xs hover:opacity-90 transition-opacity">
                  Browse Files
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
              </div>
            </div>
            <div className="p-5 bg-surface-container flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2 font-bold text-xs hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:bg-primary-dark transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
