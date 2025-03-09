import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AxiosError } from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContextType, User, AuthResponse, RegisterData } from '../types/auth.types';
import axiosInstance from '../utils/axios';
import { jwtDecode } from 'jwt-decode';
import { setupSessionManager } from '../utils/setupSessionManager';

interface DecodedToken {
  sub: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
  picture?: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setupSession = useCallback(() => {
    return setupSessionManager();
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('lastActiveTime');
    setUser(null);
    setError(null);
    window.location.href = '/login';
  }, []);

  const saveUserData = useCallback((userData: User | ((prevUser: User | null) => User | null)) => {
    if (typeof userData === 'function') {
      setUser(prevUser => {
        const updatedUser = userData(prevUser);
        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          localStorage.removeItem('user');
        }
        return updatedUser;
      });
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        localStorage.setItem('lastActiveTime', Date.now().toString());
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const lastPage = localStorage.getItem('lastPage');
      const savedUser = localStorage.getItem('user');
      const lastActiveTime = localStorage.getItem('lastActiveTime');

      if (!token) {
        setLoading(false);
        return;
      }

      if (lastActiveTime) {
        const inactiveTime = Date.now() - parseInt(lastActiveTime);
        if (inactiveTime > 15 * 60 * 1000) {
          handleLogout();
          return;
        }
      }

      try {
        if (savedUser) {

          console.log(savedUser ,"savedUser")
          setUser(JSON.parse(savedUser));
        }

        const response = await axiosInstance.get<{ user: User }>('/auth/profile');
        saveUserData(response.data.user);
        setupSessionManager();
        
        // if (lastPage && window.location.pathname === '/') {
        //   window.location.href = lastPage;
        // }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (err.response?.status === 401) {
          setError('Unauthorized: Please check your permissions');
        } else {
          setError(err.response?.data?.message || 'Failed to create admins');
        }
        // handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [ saveUserData]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lastPage', window.location.pathname);
    }
  }, [user, window.location.pathname]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('sessionStart', Date.now().toString());
      saveUserData(user);
      setupSession();
      return { success: true, user };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleGoogleLogin = async (credential: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/google/login', { credential });
      if (response.data.success && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('sessionStart', Date.now().toString());
        saveUserData(response.data.user);
        setError(null);
        setupSession();
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || 'Invalid response from server');
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleGoogleRegister = async (credential: string): Promise<AuthResponse> => {
    try {
      const decoded: DecodedToken = jwtDecode(credential);
      const response = await axiosInstance.post('/auth/google/register', {
        credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('sessionStart', Date.now().toString());
      saveUserData(user);
      setupSession();
      return { success: true, user };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleRegister = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.put('/profile', profileData);
      const updatedUser = { ...user, ...response.data.user };
      saveUserData(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  };

  const handleSuperAdminLogin = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/admin/login', { email, password });
      const { token, user } = response.data;
  
      localStorage.setItem('token', token);
      localStorage.setItem('sessionStart', Date.now().toString());
      saveUserData(user);
      setupSession();
      return { success: true, user };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'Superadmin login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const isSuperAdmin = useCallback((): boolean => {
    return user?.role === 'superadmin';
  }, [user?.role]);

  const value: AuthContextType = {
    user,
    setUser: saveUserData,
    loading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    isSuperAdmin,
    superAdminLogin: handleSuperAdminLogin,
    logout: handleLogout,
    register: handleRegister,
    loginWithGoogle: handleGoogleLogin,
    registerWithGoogle: handleGoogleRegister,
    updateProfile: updateUserProfile,
    requestPasswordReset: async () => ({ success: false, error: 'Not implemented' }),
    verifyResetCode: async () => ({ success: false, error: 'Not implemented' }),
    resetPassword: async () => ({ success: false, error: 'Not implemented' }),
    updateUser: (userData: Partial<User>) => setUser(prev => prev ? { ...prev, ...userData } : null),
    setupSession
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};