// src/types/admin.types.ts
export interface AdminUser {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'superadmin';
  }
  
  export interface AdminAuthResponse {
    success: boolean;
    token?: string;
    user?: AdminUser;
    message?: string;
    error?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AdminCreateData extends LoginCredentials {
    name: string;
  }