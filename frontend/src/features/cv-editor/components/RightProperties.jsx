import {
  ChevronDown,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fontOptions, colorSwatches } from "../utils/editorConstants";

export default function RightProperties({
  selectedFont,
  onFontChange,
  fontSize,
  onFontSizeChange,
  isBold,
  onBoldToggle,
  isItalic,
  onItalicToggle,
  textAlign,
  onTextAlignChange,
  activeColor,
  onColorChange,
  opacity,
  onOpacityChange,
  onDeleteElement,
}) {
  const [customColors, setCustomColors] = useState([]);
  const [newColorInput, setNewColorInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cvEditorCustomColors");
    if (saved) {
      try {
        setCustomColors(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const handleAddCustomColor = () => {
    let color = newColorInput.trim();
    if (!color) return;
    if (!color.startsWith("#")) {
      color = "#" + color;
    }
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      const upperColor = color.toUpperCase();
      const newColors = [...new Set([...customColors, upperColor])];
      setCustomColors(newColors);
      localStorage.setItem("cvEditorCustomColors", JSON.stringify(newColors));
      onColorChange(upperColor);
      setNewColorInput("");
    }
  };
  return (
    <aside className="relative hidden lg:flex w-60 xl:w-64 border-l border-outline-variant/40 bg-surface z-40 flex-col flex-shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      <div className="p-5 border-b border-outline-variant flex-1 overflow-y-auto">
        <h3 className="font-bold text-sm text-primary mb-5">
          Text Properties
        </h3>
        <div className="space-y-5">
          {/* Font Family */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2 block">
              Font Family
            </label>
            <div className="relative">
              <select
                value={selectedFont}
                onChange={(e) => onFontChange(e.target.value)}
                className="w-full bg-surface-container rounded-xl border-none text-xs font-medium py-2.5 px-3 appearance-none focus:ring-2 focus:ring-primary cursor-pointer text-primary"
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3 pointer-events-none text-outline"
              />
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
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                className="w-full bg-surface-container rounded-xl border-none text-xs font-medium py-2.5 px-3 focus:ring-2 focus:ring-primary text-primary"
              />
            </div>
            <div className="flex items-end gap-1">
              <button
                onClick={onBoldToggle}
                className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${isBold
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                <Bold size={14} />
              </button>
              <button
                onClick={onItalicToggle}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isItalic
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                <Italic size={14} />
              </button>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="flex gap-1">
            {[
              { value: "left", Icon: AlignLeft },
              { value: "center", Icon: AlignCenter },
              { value: "right", Icon: AlignRight },
            ].map(({ value, Icon }) => (
              <button
                key={value}
                onClick={() => onTextAlignChange(value)}
                className={`p-2 transition-all ${textAlign === value
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-primary"
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

            {/* Custom Color Input */}
            <div className="flex gap-2 items-center my-2">
              <div className="flex-1 relative">
                <span className="absolute left-2 top-1.5 text-outline-variant font-bold text-xs">#</span>
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value.replace('#', ''))}
                  placeholder="FFFFFF"
                  maxLength={6}
                  className="w-full bg-surface-container rounded-lg border-none text-xs py-1 pl-6 pr-2 focus:ring-1 focus:ring-primary text-primary outline-none uppercase font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomColor()}
                />
              </div>
              <button
                onClick={handleAddCustomColor}
                className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors mt-2"
                title="Add custom hex color"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Color Palette with Overflow */}
            <div className="flex gap-2 overflow-x-auto pt-2 pb-3 px-1 -mx-1 scrollbar-thin scrollbar-thumb-outline-variant/50 scrollbar-track-transparent">
              {[...colorSwatches.map(s => s.color), ...customColors].map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`shrink-0 w-6 h-6 rounded-full transition-all ${activeColor === color
                    ? "ring-2 ring-offset-2 ring-primary"
                    : "hover:scale-110"
                    }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
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
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="w-full accent-primary bg-surface-container h-1 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Delete Element */}
      <div className="p-5 border-t border-outline-variant">
        <button
          onClick={onDeleteElement}
          className="w-full py-3 border-2 border-error text-error rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-error hover:text-white transition-all text-sm"
        >
          <Trash2 size={16} />
          Delete Element
        </button>
      </div>
    </aside>
  );
}
