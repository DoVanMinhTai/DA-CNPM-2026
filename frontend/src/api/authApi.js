import axiosInstance, { setAccessToken, clearAccessToken } from './axiosInstance';

export const authApi = {
  // Đăng nhập bằng Email & Password
  login: async (credentials) => {
    const { data } = await axiosInstance.post('/api/auth/login', credentials);
    setAccessToken(data.accessToken); // Lưu Access Token in-memory
    return data; // { accessToken, user }
  },

  // Đăng ký tài khoản mới
  register: async (userData) => {
    const { data } = await axiosInstance.post('/api/auth/register', userData);
    return data; // { message }
  },

  // Khôi phục phiên đăng nhập (lấy Access Token mới bằng Refresh Token trong Cookie)
  refresh: async () => {
    const { data } = await axiosInstance.post('/api/auth/refresh');
    setAccessToken(data.accessToken);
    return data; // { accessToken, user }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } finally {
      clearAccessToken(); // Xóa Access Token in-memory trong mọi trường hợp
    }
  },

  // Lấy thông tin tài khoản hiện tại
  getMe: async () => {
    const { data } = await axiosInstance.get('/api/auth/me');
    return data; // UserResponse
  },

  // Gửi lại email xác thực tài khoản
  resendVerification: async (email) => {
    const { data } = await axiosInstance.post(
      `/api/auth/resend-verification?email=${encodeURIComponent(email)}`
    );
    return data; // { message }
  },

  // Xác nhận liên kết tài khoản OAuth (Google/Facebook) với tài khoản local hiện tại
  confirmLink: async (linkData) => {
    const { data } = await axiosInstance.post('/api/auth/confirm-link', linkData);
    setAccessToken(data.accessToken);
    return data; // { accessToken, user }
  },
};
