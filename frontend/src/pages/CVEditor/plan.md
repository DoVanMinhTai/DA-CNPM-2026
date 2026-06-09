# Yêu cầu Refactor: CVEditorPage.jsx

Bạn là một chuyên gia React Developer. Nhiệm vụ của bạn là refactor file `CVEditorPage.jsx` (hiện có hơn 1200 dòng, chứa logic của pdfjs, fabric, pdf-lib và toàn bộ UI) thành một cấu trúc feature-based modular. 

## ⚠️ Nguyên tắc TỐI THƯỢNG (Bắt buộc tuân thủ):
1. KHÔNG thay đổi bất kỳ class Tailwind nào. Giữ nguyên 100% UI.
2. KHÔNG thay đổi logic nghiệp vụ, chỉ di chuyển code và tạo kết nối thông qua Props/Custom Hooks.
3. Làm từng bước (Step-by-step). Sau khi hoàn thành một khối, hãy báo cáo để tôi kiểm tra rồi mới làm khối tiếp theo.

## 📂 Cấu trúc thư mục đích:
Tạo cấu trúc sau trong `src/features/cv-editor/`:
- /components (Chứa các UI Components - Dumb Components)
- /hooks (Chứa Custom Hooks xử lý logic, state)
- /utils (Chứa constants và helper functions)

## 🛠️ Lộ trình thực hiện:

### Bước 1: Tách dữ liệu tĩnh (Constants)
1. Tạo file `src/features/cv-editor/utils/editorConstants.js`.
2. Di chuyển các mảng `tools`, `fontOptions`, `colorSwatches` từ file gốc sang đây và export chúng.

### Bước 2: Tách các UI Components (Dumb Components)
Tạo các file sau trong thư mục `components/`, copy mã HTML/JSX tương ứng từ file gốc sang, thay thế các biến state trực tiếp bằng `props`:

1. **`ImageUploadModal.jsx`**: Tách toàn bộ `<div className="fixed inset-0...">` của phần upload ảnh. Nhận props: `isOpen`, `onClose`, `onConfirm`, `fileInputRef`.
2. **`EditorHeader.jsx`**: Tách thẻ `<header>`. Nhận props: `cvName`, `originalFileUrl`, `zoom`, `onZoomIn`, `onZoomOut`, `onSave`, `onExport`.
3. **`LeftSidebar.jsx`**: Tách thẻ `<aside className="flex border-r...">`. Nhận props: `activeTool`, `onToolChange`, `activePage`, `onPageChange`. (Import mảng `tools` từ `editorConstants.js`).
4. **`RightProperties.jsx`**: Tách thẻ `<aside className="hidden lg:flex...">`. Nhận props chứa trạng thái font, màu, size, độ mờ (opacity) và các hàm callback `onChange` tương ứng.
5. **`MainCanvas.jsx`**: Tách thẻ `<main>`. Chứa vòng xoay loading, thông báo lỗi và 2 lớp thẻ `<canvas>` (PDF layer và Fabric layer). Nhận props: `loading`, `error`, `zoom`.

### Bước 3: Tách Logic Xử Lý (Custom Hooks)
Tạo các file sau trong thư mục `hooks/`, gom các `useState`, `useRef`, `useEffect` từ file gốc:

1. **`usePdfRenderer.js`**: Chứa logic gọi API lấy dữ liệu CV, fetch URL gốc từ Cloudflare, khởi tạo `pdfjs-dist` worker và logic render trang PDF ra canvas. Trả về: `loading`, `error`, `cvData`, `pdfLayerRef`, hàm `renderPage`.
2. **`useFabricCanvas.js`**: Chứa logic khởi tạo `fabric.Canvas`, quản lý các công cụ (`activeTool`), bảng màu, nét vẽ, hình khối và kỹ thuật Masking (Eraser). Trả về: `fabricLayerRef`, `activeTool`, hàm `setActiveTool`, và các state của properties panel.
3. **`usePdfExport.js`**: Chứa thư viện `pdf-lib`. Viết logic nhận file gốc, đè các object xuất ra từ Fabric.js (text mới, cục tẩy trắng) lên bề mặt PDF và trả ra file hoàn chỉnh để lưu. Trả về: hàm `handleSave`, `handleExportPdf`.

### Bước 4: Lắp ráp tại file CVEditorPage.jsx
Sau khi tách xong, hãy viết lại file `CVEditorPage.jsx` để đóng vai trò là Layout Wrapper. Gọi các hooks từ Bước 3 để lấy trạng thái và truyền chúng dưới dạng props vào các Components từ Bước 2. Giữ file này dưới 100 dòng code.

---
Hãy bắt đầu với Bước 1 và Bước 2 trước. Đọc kỹ file gốc của tôi và tạo code cho `editorConstants.js` cùng các UI Components.