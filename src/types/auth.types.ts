export interface User {
  _id: string;
  email: string;
  name: string;
  photo?: string;
  provider?: string;
  selectedExam?: string;
  fieldOfStudy?: string;
  examId?: string; // Added examId to user interface
  subscription?: {
    status: 'active' | 'expired';
    type: 'content_access' | 'mock_access' | 'full_access';
    expiryDate: string;
  };
  role: string
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | ((prevUser: User | null) => User | null)) => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  logout: () => void;
  isSuperAdmin: () => boolean;
  superAdminLogin: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  loginWithGoogle: (credential: string) => Promise<AuthResponse>;
  registerWithGoogle: (credential: string) => Promise<AuthResponse>;
  updateProfile: (profileData: Partial<User>) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  verifyResetCode: (email: string, code: string) => Promise<AuthResponse>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<AuthResponse>;
  updateUser: (userData: Partial<User>) => void;
  setupSession: () => (() => void);
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
  verified?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
export interface StatusState {
  type: 'success' | 'error' | ''; // The type of status (success, error, or empty for no status)
  message: string; // The message to display to the user
}