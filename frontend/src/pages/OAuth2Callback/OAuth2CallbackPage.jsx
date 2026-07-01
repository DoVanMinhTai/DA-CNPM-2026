import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { authApi } from '../../api/authApi';
import { toast } from 'sonner';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser, isAuthenticated, isLoading } = useAuth();

  // States
  const [status, setStatus] = useState('loading'); // 'loading' | 'error'

  // Xử lý thành công (đợi AuthProvider tự động gọi initAuth)
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setStatus('loading');
      if (!isLoading) {
        if (isAuthenticated) {
          toast.success('Đăng nhập thành công!');
          navigate('/dashboard', { replace: true });
        } else {
          toast.error('Có lỗi xảy ra khi khôi phục phiên đăng nhập');
          navigate('/login', { replace: true });
        }
      }
    }
  }, [searchParams, isLoading, isAuthenticated, navigate]);

  // Xử lý error hoặc fallback
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') return;

    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      toast.error('Đăng nhập thất bại: ' + decodeURIComponent(error));
      navigate('/login', { replace: true });
    } else {
      // Mặc định chuyển về login nếu không có params hợp lệ
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);



  return null;
}
