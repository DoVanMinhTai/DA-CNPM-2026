import { createContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, clearAccessToken } from '../api/axiosInstance';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true trong khi kiểm tra auth lần đầu
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Thử khôi phục session bằng cách gọi API refresh token
  const initAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshData = await authApi.refresh();
      if (refreshData && refreshData.accessToken) {
        setAccessToken(refreshData.accessToken);
        const userData = await authApi.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Refresh response empty');
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Đăng nhập bằng email/password
  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Bỏ qua lỗi khi logout
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
    }
  }, []);

  // Hàm thủ công thiết lập thông tin user (ví dụ sau khi đăng nhập OAuth2 thành công)
  const setAuthUser = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // Kiểm tra phiên đăng nhập ngay khi ứng dụng khởi chạy
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Đăng ký bộ lắng nghe sự kiện logout toàn cục (từ axios interceptor khi refresh token hết hạn)
  useEffect(() => {
    const handleGlobalLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    initAuth,
    setAuthUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
