import {
  ChevronDown,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
} from "lucide-react";
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
  return (
    <aside className="hidden lg:flex w-72 xl:w-80 border-l border-outline-variant/40 bg-surface flex-col z-20 flex-shrink-0">
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
                className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                  isBold
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <Bold size={14} />
              </button>
              <button
                onClick={onItalicToggle}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  isItalic
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
                className={`p-2 transition-all ${
                  textAlign === value
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
            <div className="flex flex-wrap gap-2">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch.color}
                  onClick={() => onColorChange(swatch.color)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    activeColor === swatch.color
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-110"
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
