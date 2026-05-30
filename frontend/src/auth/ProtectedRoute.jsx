import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang kiểm tra trạng thái đăng nhập -> hiển thị màn hình loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          <p className="text-slate-400 font-medium animate-pulse text-sm">Đang tải phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> Điều hướng về /login và lưu đường dẫn hiện tại để quay lại sau
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập -> Cho phép truy cập vào các nested routes
  return <Outlet />;
}
