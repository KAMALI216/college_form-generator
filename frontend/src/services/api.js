import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const pathname = window.location.pathname || '';
  const isAdminPortal = pathname.startsWith('/admin');

  // Prefer admin token (jwtToken) in admin routes, otherwise prefer user token (userToken)
  let token;
  if (isAdminPortal) {
    token = localStorage.getItem('jwtToken');
  } else {
    token = localStorage.getItem('userToken');
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const pathname = window.location.pathname || '';
    const isUserProtectedRoute = pathname.startsWith('/forms') || pathname.startsWith('/user/my-submissions') || pathname.startsWith('/user/my-documents') || pathname.startsWith('/user');

    if ((error?.response?.status === 401 || error?.response?.status === 403) && isUserProtectedRoute) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userAuthUser');
      window.location.href = '/user/login';
    }

    return Promise.reject(error);
  }
);

export default api;