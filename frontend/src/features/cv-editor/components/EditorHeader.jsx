import { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  X,
} from "lucide-react";
import SaveDialogModal from "./SaveDialogModal";

export default function EditorHeader({
  cvName,
  onCvNameChange,
  originalFileUrl,
  zoom,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onSaveWithFormat,
  onExportPdf,
  onExportWord,
  onExportImage,
  savingVersion,
  saveStatus,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExtractAllText,
  isCreateMode,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [zoomInput, setZoomInput] = useState(zoom ? zoom.toString() : "100");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setZoomInput(zoom ? zoom.toString() : "100");
  }, [zoom]);

  const handleZoomSubmit = () => {
    let val = parseInt(zoomInput, 10);
    if (isNaN(val)) {
      setZoomInput(zoom.toString());
      return;
    }
    if (val < 10) val = 10;
    if (val > 200) val = 200;
    setZoomInput(val.toString());
    if (onSetZoom) onSetZoom(val);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative bg-surface shadow-sm px-6 lg:px-10 py-3 flex items-center justify-between z-50 border-b border-outline-variant shrink-0">
      {/* Left: File info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText size={18} className="text-primary" />
        </div>
        <div>
          <input
            type="text"
            value={cvName || ""}
            onChange={(e) => onCvNameChange && onCvNameChange(e.target.value)}
            className="text-sm font-bold text-primary leading-none bg-transparent border border-transparent hover:border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white rounded px-1.5 py-0.5 -ml-1.5 transition-all outline-none w-48 sm:w-64"
            placeholder="Untitled CV"
          />
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {originalFileUrl && !isCreateMode && (
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
        <div className="flex items-center">
          <input
            type="text"
            value={zoomInput}
            onChange={(e) => setZoomInput(e.target.value)}
            onBlur={handleZoomSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleZoomSubmit()}
            className="w-8 text-center font-bold text-xs bg-transparent border-none p-0 outline-none focus:ring-0 text-primary"
          />
          <span className="font-bold text-xs -ml-0.5">%</span>
        </div>
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
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-colors ${canUndo ? "hover:bg-surface-container-high text-primary" : "opacity-30 cursor-not-allowed"}`}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-colors ${canRedo ? "hover:bg-surface-container-high text-primary" : "opacity-30 cursor-not-allowed"}`}
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium">
            {savingVersion ? (
              <>
                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Saving...
              </>
            ) : saveStatus.includes("Failed") ? (
              <>
                <X size={12} className="text-red-500" />
                {saveStatus}
              </>
            ) : (
              <>
                <CheckCircle size={12} className="text-green-500" />
                {saveStatus}
              </>
            )}
          </div>

          <div className="w-px h-5 bg-outline-variant/30 mx-1"></div>

          <button
            onClick={onExtractAllText}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 bg-tertiary text-white hover:bg-tertiary/90 hover:shadow"
            title="Trích xuất toàn bộ chữ để sửa đổi"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Bóc Chữ (Beta)</span>
          </button>

          {/* Save Version Dialog Button */}
          <button
            onClick={() => setIsSaveModalOpen(true)}
            disabled={savingVersion}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${
              savingVersion 
                ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                : "bg-primary text-on-primary hover:bg-primary/90 hover:shadow"
            }`}
          >
            <Save size={16} />
            <span className="hidden sm:inline">{isCreateMode ? "Tạo CV Mới" : "Lưu Bản Mới"}</span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all shadow-sm"
            >
              Export
              <ChevronDown size={14} className={`transition-transform duration-200 ${isExportOpen ? "rotate-180" : ""}`} />
            </button>
            {/* Export Dropdown */}
            {isExportOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white text-primary border border-outline-variant/40 shadow-xl rounded-xl overflow-hidden py-1.5 z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    if (onExportPdf) onExportPdf();
                  }}
                  className="w-full px-4 py-2 hover:bg-surface-container flex items-center gap-2.5 text-xs text-left transition-colors"
                >
                  <FileText size={14} className="text-primary" /> PDF
                </button>
                <button
                  onClick={() => {
                    setIsExportOpen(false);
                    if (onExportWord) onExportWord();
                  }}
                  className="w-full px-4 py-2 hover:bg-surface-container flex items-center gap-2.5 text-xs text-left transition-colors"
                >
                  <Download size={14} className="text-primary" /> Word
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Save Dialog */}
      <SaveDialogModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={async (format) => {
          await onSaveWithFormat(format);
          setIsSaveModalOpen(false);
        }}
        saving={savingVersion}
        isCreateMode={isCreateMode}
      />
    </header>
  );
}
