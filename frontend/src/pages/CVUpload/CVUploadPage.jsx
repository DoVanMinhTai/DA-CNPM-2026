import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Upload, FileText, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cvApi } from '../../api/cvApi'

export default function CVUploadPage() {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState('') // 'uploading', 'extracting', 'parsing', 'completed'
  const [selectedFile, setSelectedFile] = useState(null)
  
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Validate file size and extension
  const handleFileValidate = (file) => {
    if (!file) return false

    // Allowed extensions
    const allowedExtensions = ['.pdf', '.docx']
    const fileName = file.name.toLowerCase()
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

    if (!isValidExtension) {
      toast.error('Định dạng file không hợp lệ! Vui lòng chọn file .pdf hoặc .docx')
      return false
    }

    // Size limit 5MB
    const maxSizeBytes = 5 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error('Kích thước file vượt quá giới hạn 5MB! Vui lòng chọn file nhẹ hơn.')
      return false
    }

    return true
  }

  // Handle core upload and parsing workflow
  const handleCvUploadWorkflow = async (file) => {
    if (!handleFileValidate(file)) return

    setSelectedFile(file)
    setIsUploading(true)
    
    try {
      // Stage 1: Uploading to Cloudflare R2
      setUploadStage('uploading')
      
      // Stage 2: Extracting text using Apache Tika (simulated progress updates to keep UI fluid)
      setTimeout(() => {
        setUploadStage('extracting')
      }, 1500)

      // Stage 3: AI Structuring using Google Gemini
      setTimeout(() => {
        setUploadStage('parsing')
      }, 3500)

      // Perform real API upload call
      const response = await cvApi.uploadCv(file)

      setUploadStage('completed')
      toast.success('Bóc tách và phân tích CV thành công!')
      
      // Redirect to CV Editor passing parsed content
      setTimeout(() => {
        navigate(`/cv/editor/${response.cvId}`, { 
          state: { 
            cvData: response.content,
            cvId: response.cvId,
            originalFileUrl: response.originalFileUrl,
            cvName: file.name
          } 
        })
      }, 1000)
      
    } catch (error) {
      setIsUploading(false)
      setSelectedFile(null)
      setUploadStage('')
      
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý CV!'
      toast.error(errorMsg)
      console.error('CV Upload Error:', error)
    }
  }

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCvUploadWorkflow(e.dataTransfer.files[0])
    }
  }

  // Input change handler
  const handleFileChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleCvUploadWorkflow(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại Bảng điều khiển
        </Link>
        
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
          <Sparkles size={12} className="text-accent" />
          Tiêu chuẩn ATS
        </span>
      </div>

      <div className="text-center mb-10 animate-fade-in delay-100">
        <h1 className="text-3xl font-extrabold text-secondary-dark tracking-tight">
          Tải lên CV của bạn
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-xl mx-auto text-sm leading-relaxed">
          Tải lên tệp PDF hoặc DOCX. Hệ thống AI Gemini của chúng tôi sẽ tự động trích xuất thông tin cá nhân, kinh nghiệm và kỹ năng để điền tự động vào trình chỉnh sửa.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden animate-fade-in delay-200">
        {!isUploading ? (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`p-10 md:p-16 flex flex-col items-center justify-center border-3 border-dashed rounded-2xl m-4 transition-all duration-300 text-center cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/5 scale-[0.99]' 
                : 'border-outline-variant/70 hover:border-primary/50 hover:bg-surface-container-low/30'
            }`}
            onClick={handleButtonClick}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />

            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
              <Upload size={32} className="text-primary" />
            </div>

            <h3 className="text-lg font-bold text-secondary-dark mb-2">
              Kéo thả CV của bạn vào đây hoặc nhấp để duyệt
            </h3>
            <p className="text-xs text-outline mb-6">
              Hỗ trợ định dạng PDF, DOCX (Tối đa 5MB)
            </p>

            <button 
              type="button" 
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              Chọn tệp từ máy tính
            </button>
          </div>
        ) : (
          <div className="p-12 md:p-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
                <Loader2 size={36} className="text-primary animate-spin" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
                <Sparkles size={14} className="text-primary" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-secondary-dark mb-2 animate-pulse">
              Đang phân tích CV của bạn...
            </h3>
            
            <p className="text-sm text-outline mb-8 max-w-sm">
              Đang xử lý tệp: <span className="font-semibold text-secondary-dark">{selectedFile?.name}</span>
            </p>

            {/* Stages visualization */}
            <div className="w-full max-w-md space-y-4 bg-surface-container-low p-5 rounded-xl border border-outline-variant/20 text-left">
              <div className="flex items-center gap-3">
                {uploadStage === 'uploading' ? (
                  <Loader2 size={16} className="text-primary animate-spin flex-shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                )}
                <span className={`text-sm ${uploadStage === 'uploading' ? 'text-primary font-semibold' : 'text-outline'}`}>
                  Bước 1: Tải file lên Cloudflare R2 Storage
                </span>
              </div>

              <div className="flex items-center gap-3">
                {uploadStage === 'uploading' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-outline-variant/30 flex-shrink-0" />
                ) : uploadStage === 'extracting' ? (
                  <Loader2 size={16} className="text-primary animate-spin flex-shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                )}
                <span className={`text-sm ${uploadStage === 'extracting' ? 'text-primary font-semibold' : uploadStage === 'uploading' ? 'text-outline-variant' : 'text-outline'}`}>
                  Bước 2: Trích xuất nội dung văn bản (Apache Tika)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {uploadStage === 'uploading' || uploadStage === 'extracting' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-outline-variant/30 flex-shrink-0" />
                ) : uploadStage === 'parsing' ? (
                  <Loader2 size={16} className="text-primary animate-spin flex-shrink-0" />
                ) : uploadStage === 'completed' ? (
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-outline-variant/30 flex-shrink-0" />
                )}
                <span className={`text-sm ${uploadStage === 'parsing' ? 'text-primary font-semibold' : uploadStage === 'completed' ? 'text-outline' : 'text-outline-variant'}`}>
                  Bước 3: AI Gemini phân tích & cấu trúc JSON
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer note info */}
        <div className="bg-surface-container/30 px-6 py-4 flex items-start gap-2.5 border-t border-outline-variant/20">
          <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-outline leading-relaxed">
            Lưu ý: Thao tác bóc tách và phân tích CV bằng AI sẽ khấu trừ **1 credit** từ số dư tài khoản của bạn.
            Hãy đảm bảo tài liệu chứa đầy đủ thông tin để AI phân tích tốt nhất.
          </p>
        </div>
      </div>
    </div>
  )
}
