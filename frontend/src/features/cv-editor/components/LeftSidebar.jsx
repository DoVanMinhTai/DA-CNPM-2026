import { Grid3X3 } from "lucide-react";
import { tools } from "../utils/editorConstants";

export default function LeftSidebar({
  activeTool,
  onToolChange,
  activePage,
  onPageChange,
  numPages,
  onAddShape,
  onAddText,
  onShowUploadModal,
}) {
  return (
    <aside className="flex border-r border-outline-variant/40 bg-surface z-20 flex-shrink-0">
      {/* Column 1: Vertical Toolbar */}
      <div className="w-14 flex flex-col items-center py-5 gap-4 border-r border-outline-variant">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === "shapes") {
                onAddShape("rect");
                onToolChange("select");
              } else if (tool.id === "text") {
                onAddText();
                onToolChange("select");
              } else if (tool.id === "image") {
                onShowUploadModal(true);
              } else {
                onToolChange(tool.id);
              }
            }}
            className={`p-2 rounded-xl transition-all ${
              activeTool === tool.id
                ? "text-white bg-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
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
          <h3 className="font-bold text-xs text-primary">
            Total Pages: {numPages || 1}
          </h3>
          <Grid3X3
            size={16}
            className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
          />
        </div>
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          {Array.from({ length: numPages || 1 }).map((_, index) => {
            const pageNum = index + 1;
            return (
              <div
                key={pageNum}
                className={`relative group cursor-pointer ${
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
                  <div className="w-full h-full bg-surface-container rounded-sm flex flex-col items-center justify-center p-2 gap-1 text-center">
                    <span className="text-[10px] font-bold text-primary">
                      Page {pageNum}
                    </span>
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
            );
          })}
        </div>
      </div>
    </aside>
  );
}
