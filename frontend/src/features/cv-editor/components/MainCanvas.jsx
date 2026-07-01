import { fontOptions } from '../utils/editorConstants';

export default function MainCanvas({
  loading,
  error,
  canvasWidth,
  canvasHeight,
  pdfCanvasRef,
  fabricCanvasRef,
  containerRef,
  extractedTexts = [],
  modifiedTexts = {},
  onTextModify = () => {},
  activeTextId,
  setActiveTextId,
}) {
  return (
    <div
      ref={containerRef}
      className="flex-1 bg-surface-container-highest relative overflow-auto flex justify-center items-start p-10"
    >
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-container-highest/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-bold text-primary animate-pulse">
              Đang phân tích PDF...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-error text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      <div
        className="relative shadow-2xl bg-white transition-all duration-300"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: canvasWidth,
          minHeight: canvasHeight,
        }}
      >
        <canvas ref={pdfCanvasRef} className="absolute top-0 left-0" />
        <canvas ref={fabricCanvasRef} className="absolute top-0 left-0 z-20" />

        {/* DOM TEXT LAYER */}
        <div id="text-layer" className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none">
          {extractedTexts.map((item) => {
            const isEditing = activeTextId === item.id;
            const mods = modifiedTexts[item.id];
            const modsObj = typeof mods === 'string' ? { text: mods } : (mods || {});
            const currentText = modsObj.text !== undefined ? modsObj.text : item.text;
            
            // Có thay đổi nếu có nội dung mới, hoặc có bất kỳ tùy chỉnh style nào
            const hasChanged = mods !== undefined;
            
            // Thuộc tính hiển thị
            const displayFontSize = modsObj.fontSize || item.fontSize;
            const displayFontFamily = modsObj.fontFamily || item.fontFamily || fontOptions[0];
            let displayColor = modsObj.color || item.color || '#000000';
            
            const isOriginalBold = item.fontFamily && item.fontFamily.toLowerCase().includes("bold");
            const displayFontWeight = (modsObj.isBold !== undefined ? modsObj.isBold : isOriginalBold) ? "bold" : "normal";
            const displayFontStyle = modsObj.isItalic ? "italic" : "normal";
            
            // 3-State Lifecycle
            let textColor = 'transparent';
            let ringClass = '';
            
            if (isEditing) {
              textColor = displayColor;
              ringClass = 'ring-1 ring-blue-500 outline-none bg-white/30'; 
            } else if (hasChanged) {
              textColor = displayColor;
            }
            
            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: `${item.left}px`,
                  top: `${item.top}px`,
                  zIndex: isEditing || hasChanged ? 10 : 1,
                }}
              >
                {/* MASK LAYER (Lớp che khuất) */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `-2px`,
                    top: `0px`,
                    width: `${item.width + 4}px`,
                    height: `${item.fontSize * 1.25}px`, // Chiều cao gốc để che vừa khít
                    backgroundColor: isEditing || hasChanged ? '#FFFFFF' : 'transparent',
                  }}
                />

                {/* TEXT LAYER (Lớp chữ mới) */}
                <div
                  id={`text-edit-${item.id}`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (!isEditing) {
                      setActiveTextId(item.id);
                      setTimeout(() => {
                        const el = document.getElementById(`text-edit-${item.id}`);
                        if (el) {
                          el.focus();
                          const selection = window.getSelection();
                          const range = document.createRange();
                          range.selectNodeContents(el);
                          selection.removeAllRanges();
                          selection.addRange(range);
                        }
                      }, 0);
                    }
                  }}
                  onBlur={(e) => {
                    setActiveTextId(null);
                    const newText = e.target.innerText.replace(/[\r\n]+$/, '');
                    onTextModify(item.id, newText);
                  }}
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  className={`absolute cursor-text whitespace-nowrap overflow-visible transition-colors rounded-sm ${ringClass}`}
                  style={{
                    left: `0px`,
                    top: `0px`,
                    fontSize: `${displayFontSize}px`,
                    fontFamily: displayFontFamily,
                    fontWeight: displayFontWeight,
                    fontStyle: displayFontStyle,
                    textAlign: modsObj.textAlign || 'left',
                    color: textColor,
                    minWidth: `${item.width}px`,
                    lineHeight: 1.1,
                    margin: 0,
                    padding: '0 2px',
                    pointerEvents: 'auto',
                    backgroundColor: 'transparent',
                  }}
                >
                  {currentText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
