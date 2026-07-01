import { useState, useEffect, useRef } from "react";
import { Grid3X3, Plus, Trash2, ChevronUp, ChevronDown, FileText, Square, Circle, Minus } from "lucide-react";
import { tools } from "../utils/editorConstants";

function Thumbnail({ pdfDocRef, pageNum }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const renderThumb = async () => {
      if (!pdfDocRef?.current || !canvasRef.current) return;
      try {
        const page = await pdfDocRef.current.getPage(pageNum);
        // We only need a small thumbnail, so scale=0.3 is enough
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error(`Error rendering thumbnail for page ${pageNum}`, err);
      }
    };
    renderThumb();
  }, [pdfDocRef, pageNum]);

  return <canvas ref={canvasRef} className="w-full h-full object-cover rounded-sm" />;
}

export default function LeftSidebar({
  activeTool,
  onToolChange,
  activePage,
  onPageChange,
  numPages,
  onAddShape,
  onAddText,
  onShowUploadModal,
  onAddPage,
  onDeletePage,
  onMovePage,
  pdfDocRef,
}) {
  const [showShapeMenu, setShowShapeMenu] = useState(false);

  return (
    <aside className="relative flex border-r border-outline-variant/40 bg-surface z-40 flex-shrink-0 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      {/* Column 1: Vertical Toolbar */}
      <div className="w-12 flex flex-col items-center py-5 gap-4 border-r border-outline-variant relative">
        {tools.map((tool) => (
          <div key={tool.id} className="relative">
            <button
              onClick={() => {
                if (tool.id === "shapes") {
                  setShowShapeMenu(!showShapeMenu);
                } else {
                  setShowShapeMenu(false);
                  if (tool.id === "text") {
                    onAddText();
                    onToolChange("select");
                  } else if (tool.id === "image") {
                    onShowUploadModal(true);
                  } else {
                    onToolChange(tool.id);
                  }
                }
              }}
              className={`p-2 rounded-xl transition-all block ${
                activeTool === tool.id
                  ? "text-white bg-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
            {tool.id === "shapes" && showShapeMenu && (
              <div className="absolute left-full top-0 ml-2 bg-white border border-outline-variant/40 shadow-xl rounded-xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                <button
                  onClick={() => { onAddShape("rect"); onToolChange("select"); setShowShapeMenu(false); }}
                  className="p-2 hover:bg-surface-container rounded-lg flex items-center justify-center text-primary transition-colors"
                  title="Rectangle"
                >
                  <Square size={16} />
                </button>
                <button
                  onClick={() => { onAddShape("circle"); onToolChange("select"); setShowShapeMenu(false); }}
                  className="p-2 hover:bg-surface-container rounded-lg flex items-center justify-center text-primary transition-colors"
                  title="Circle"
                >
                  <Circle size={16} />
                </button>
                <button
                  onClick={() => { onAddShape("line"); onToolChange("select"); setShowShapeMenu(false); }}
                  className="p-2 hover:bg-surface-container rounded-lg flex items-center justify-center text-primary transition-colors"
                  title="Line"
                >
                  <Minus size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Column 2: Page Thumbnails */}
      <div className="w-36 flex flex-col p-3 bg-surface-container-low">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xs text-primary">
            Total Pages: {numPages || 1}
          </h3>
          <Grid3X3
            size={16}
            className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
          />
        </div>
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-thin flex flex-col items-center">
          {Array.from({ length: numPages || 1 }).map((_, index) => {
            const pageNum = index + 1;
            return (
              <div
                key={pageNum}
                className="relative group flex items-center gap-1 w-[90%] mx-auto"
              >
                <div
                  className={`flex-1 relative cursor-pointer ${
                    activePage === pageNum ? "" : "opacity-60 hover:opacity-100"
                  } transition-opacity`}
                  onClick={() => onPageChange(pageNum)}
                >
                  <div
                    className={`aspect-[1/1.414] bg-surface-container-lowest rounded shadow-sm overflow-hidden p-1.5 border-2 ${
                      activePage === pageNum
                        ? "border-primary"
                        : "border-outline-variant/40"
                    } transition-colors`}
                  >
                    <div className="w-full h-full bg-surface-container rounded-sm flex flex-col items-center justify-center relative overflow-hidden">
                      <Thumbnail pdfDocRef={pdfDocRef} pageNum={pageNum} />
                    </div>
                  </div>
                  <span
                    className={`absolute -left-1 top-0 text-[9px] px-1 rounded font-bold ${
                      activePage === pageNum
                        ? "bg-primary text-white"
                        : "bg-outline text-white"
                    }`}
                  >
                    {pageNum}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onMovePage(pageNum, pageNum - 1)}
                    disabled={pageNum === 1}
                    className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => onMovePage(pageNum, pageNum + 1)}
                    disabled={pageNum === (numPages || 1)}
                    className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => onDeletePage(pageNum)}
                    disabled={(numPages || 1) <= 1}
                    className="p-1 text-on-surface-variant hover:text-error disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
                    title="Delete Page"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          
          <button
            onClick={onAddPage}
            className="w-full mt-4 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded border border-primary/30 transition-colors"
          >
            <Plus size={14} /> Thêm trang
          </button>
        </div>
      </div>
    </aside>
  );
}
