import axios from 'axios';

const TOKEN_KEY = 'df_token';

const dfClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// ── Request interceptor: attach Bearer JWT ──────────────────────────────
dfClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle errors + 401 redirect ──────────────────
dfClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // On 401, clear token and redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('df_refresh_token');
      localStorage.removeItem('df_active_branch');
      // Force re-render by reloading — AuthContext will detect no token
      window.location.href = '/';
      return Promise.reject({ message: 'Session expired. Please login again.', status: 401 });
    }

    const message = err.response?.data?.message || err.message || 'Error occurred';
    const fieldErrors = err.response?.data?.fieldErrors || [];
    return Promise.reject({ message, fieldErrors, status: err.response?.status });
  }
);

export default dfClient;
