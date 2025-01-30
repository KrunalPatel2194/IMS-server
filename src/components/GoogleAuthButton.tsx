// src/components/GoogleAuthButton.tsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CredentialResponse } from '@react-oauth/google';
interface GoogleAuthButtonProps {
  mode: 'login' | 'signup';
  onError: (error: string) => void;
  className?: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  mode, 
  onError,
  className = '' 
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    try {
      console.log('Google response:', response);
      
      if (!response?.credential) {
        throw new Error('No credential received from Google');
      }

      const result = await loginWithGoogle(response.credential);
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        console.log('Login successful, redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        throw new Error(result.error || 'Google login failed');
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred during Google authentication');
      }
    }
  };

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          console.error('Google Sign In Error');
          onError('Google authentication failed');
        }}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text={mode === 'login' ? 'signin_with' : 'signup_with'}
      />
    </div>
  );
};

export default GoogleAuthButton;