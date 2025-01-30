import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')?.trim();

    console.log(token ,"TOKEN::::")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug
      console.log('Request headers:', config.headers);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data);
    if (error.response?.status === 401) {
      // Handle token invalidation
      localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;