// // src/services/adminAuth.ts
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';

// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem('adminToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
// export const checkSuperAdminExists = async () => {
//     const response = await fetch('/api/admin/superadmin-exists');
//     const data = await response.json();
//     return data.exists;
//   };
// export const createSuperAdmin = async ( 
//   email: string,
//   password: string,
//   name: string,
// ) => {
//   try {
//     const response = await axios.post(`${API_URL}/admin/superadmin`, {email,password,name});
//     if (response.data.success) {
//       localStorage.setItem('adminToken', response.data.token);
//       localStorage.setItem('adminUser', JSON.stringify(response.data.user));
//     }
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to create super admin');
//     }
//     throw error;
//   }
// };

// export const adminLogin = async (email: string, password: string ) => {
//   try {
//     const response = await axios.post(`${API_URL}/admin/login`, {email,password});
//     if (response.data.success) {
//       localStorage.setItem('adminToken', response.data.token);
//       localStorage.setItem('adminUser', JSON.stringify(response.data.user));
//     }
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Login failed');
//     }
//     throw error;
//   }
// };

// export const createAdmin = async (data: {
//   email: string;
//   password: string;
//   name: string;
// }) => {
//   try {
//     const response = await axios.post(`${API_URL}/admin/create`, data);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to create admin');
//     }
//     throw error;
//   }
// };

// export const adminLogout = () => {
//   localStorage.removeItem('adminToken');
//   localStorage.removeItem('adminUser');
//   window.location.href = '/admin/login';
// };

// export const verifyAdminToken = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/admin/verify`);
//     return response.data;
//   } catch (error) {
//     adminLogout();
//     throw error;
//   }
// };