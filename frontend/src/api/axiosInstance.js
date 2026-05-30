import axios from 'axios';

// Module-level in-memory state for access token
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};

const axiosInstance = axios.create({
  baseURL: '', // Using Vite proxy in development, absolute in production
  withCredentials: true, // QUAN TRỌNG: Gửi cookies kèm theo mọi request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: tự động gắn Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: tự động xử lý lỗi 401 và xoay vòng Refresh Token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Tránh vòng lặp vô tận khi các endpoint auth trả về 401
    if (
      originalRequest.url.includes('/api/auth/refresh') ||
      originalRequest.url.includes('/api/auth/login') ||
      originalRequest.url.includes('/api/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh, đưa request hiện tại vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
        });

        accessToken = data.accessToken;
        
        // Retry all queued requests with new token
        failedQueue.forEach(({ resolve }) => resolve());
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token hết hạn hoặc không hợp lệ -> Logout
        accessToken = null;
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];
        
        // Xóa thông tin auth và chuyển hướng về trang đăng nhập
        window.dispatchEvent(new CustomEvent('auth-logout'));
        window.location.href = '/login?session_expired=true';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
