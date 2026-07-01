import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

export default function ImageUploadModal({ isOpen, onClose, onConfirm, fileInputRef }) {
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        onConfirm();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-base font-bold">Upload Portfolio Image</h2>
          <button
            onClick={onClose}
            className="hover:bg-surface-container-high p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-7">
          <div
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer ${
              isDragging ? "border-primary bg-primary/10" : "border-outline-variant hover:border-primary hover:bg-primary/5"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center pointer-events-none">
              <Upload size={24} />
            </div>
            <div className="pointer-events-none">
              <p className="font-bold text-sm">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">
                Supports JPG, PNG (Max 5MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => {
                if (fileInputRef.current?.files?.length > 0) {
                  onConfirm();
                }
              }}
            />
          </div>
        </div>
        <div className="p-5 bg-surface-container flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-xs hover:text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
