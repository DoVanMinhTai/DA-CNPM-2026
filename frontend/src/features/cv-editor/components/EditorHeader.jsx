import {
  FileText,
  Download,
  Minus,
  ZoomIn,
  Undo2,
  Redo2,
  Save,
  ChevronDown,
  Image,
} from "lucide-react";

export default function EditorHeader({
  cvName,
  originalFileUrl,
  zoom,
  onZoomIn,
  onZoomOut,
  onSave,
  onSaveVersion,
  onExportPdf,
  saving,
  savingVersion,
  saveStatus,
}) {
  return (
    <header className="bg-surface shadow-sm px-6 lg:px-10 py-3 flex items-center justify-between z-30 border-b border-outline-variant shrink-0">
      {/* Left: File info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-primary leading-none">
            {cvName || "Senior_Product_Designer_CV.pdf"}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
              {saveStatus}
            </p>
            {originalFileUrl && (
              <>
                <span className="text-on-surface-variant/50 text-[10px]">
                  •
                </span>
                <a
                  href={originalFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-bold"
                >
                  <Download size={10} /> View Original CV
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Zoom controls */}
      <div className="hidden md:flex items-center bg-surface-container rounded-full px-3 py-1 gap-3 text-primary">
        <button
          onClick={onZoomOut}
          className="hover:text-primary transition-colors flex items-center p-0.5"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <span className="font-bold text-xs min-w-[36px] text-center select-none">
          {zoom}%
        </span>
        <button
          onClick={onZoomIn}
          className="hover:text-primary transition-colors flex items-center p-0.5"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex gap-1 text-on-surface-variant">
          <button
            className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 border border-outline/40 rounded-xl font-bold text-xs hover:bg-surface-container-high transition-all text-outline disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onSaveVersion}
            disabled={savingVersion}
            className="flex items-center gap-2 px-3 py-2 border border-outline/40 rounded-xl font-bold text-xs hover:bg-surface-container-high transition-all text-outline disabled:opacity-50"
            title="Save the edited PDF file as a new version (creates a new CV)"
          >
            <Save size={14} />
            {savingVersion ? "Saving Version..." : "Save as Version"}
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all shadow-sm">
              Export
              <ChevronDown size={14} />
            </button>
            {/* Export Dropdown */}
            <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-44 bg-surface-container-lowest border border-outline-variant/40 shadow-xl rounded-xl overflow-hidden py-1.5 z-50">
              <button
                onClick={onExportPdf}
                className="w-full px-4 py-2 hover:bg-surface-container flex items-center gap-2.5 text-xs text-left transition-colors"
              >
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
  );
}
