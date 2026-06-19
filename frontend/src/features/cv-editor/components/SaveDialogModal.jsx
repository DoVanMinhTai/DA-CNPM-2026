import React, { useState } from 'react';
import { FileText, File, X } from 'lucide-react';

export default function SaveDialogModal({ isOpen, onClose, onSave, saving, isCreateMode }) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-highest w-[400px] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/30">
          <h2 className="text-lg font-semibold text-on-surface">{isCreateMode ? "Tạo CV Lên Hệ Thống" : "Lưu Phiên Bản Mới"}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-on-surface-variant mb-4">
            Chọn định dạng bạn muốn sử dụng để lưu CV này lên hệ thống:
          </p>
          
          <div className="space-y-3">
            {/* PDF Option */}
            <label 
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                selectedFormat === 'pdf' 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-outline-variant hover:bg-surface-variant/50'
              }`}
            >
              <input 
                type="radio" 
                name="format" 
                value="pdf" 
                checked={selectedFormat === 'pdf'} 
                onChange={() => setSelectedFormat('pdf')}
                className="hidden"
              />
              <FileText size={24} className={selectedFormat === 'pdf' ? 'text-primary' : 'text-on-surface-variant'} />
              <div className="ml-3 flex-1">
                <div className="font-medium text-on-surface">PDF Document</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Lưu chính xác định dạng hiển thị</div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedFormat === 'pdf' ? 'border-primary' : 'border-outline-variant'
              }`}>
                {selectedFormat === 'pdf' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </label>

            {/* Word Option */}
            <label 
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                selectedFormat === 'word' 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-outline-variant hover:bg-surface-variant/50'
              }`}
            >
              <input 
                type="radio" 
                name="format" 
                value="word" 
                checked={selectedFormat === 'word'} 
                onChange={() => setSelectedFormat('word')}
                className="hidden"
              />
              <File size={24} className={selectedFormat === 'word' ? 'text-primary' : 'text-on-surface-variant'} />
              <div className="ml-3 flex-1">
                <div className="font-medium text-on-surface">Word Document (.docx)</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Chỉ trích xuất văn bản thô</div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedFormat === 'word' ? 'border-primary' : 'border-outline-variant'
              }`}>
                {selectedFormat === 'word' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container flex justify-end gap-3 border-t border-outline-variant/30">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(selectedFormat)}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg shadow hover:shadow-md hover:opacity-90 transition-all flex items-center justify-center min-w-[100px]"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isCreateMode ? 'Tạo CV' : 'Lưu Bản Mới'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
