import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/dentaflex-icon.png';
import { useAuth } from '../context/authContext';
const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  useEffect(() => {
    // Verify we have the necessary data
    const resetEmail = localStorage.getItem('resetEmail');
    const resetCode = localStorage.getItem('resetCode');
    if (!resetEmail || !resetCode) {
      navigate('/forgot-password');
    }
  }, [navigate]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match. Please try again.'
      });
      return;
    }

    if (formData.password.length < 8) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const email = localStorage.getItem('resetEmail');
      const code = localStorage.getItem('resetCode');
      
      if (!email || !code) {
        throw new Error('Required information missing. Please try again.');
      }

      const result = await resetPassword(email, code, formData.password);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message || 'Password has been reset successfully!'
        });
        
        // Clear stored reset data
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetCode');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Failed to reset password'
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm">
              Create a new password for your account
            </p>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded text-sm ${
              status.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter your new password"
                required
                disabled={isSubmitting}
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Confirm your new password"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#003B5C] text-white py-2 px-4 rounded font-medium hover:bg-[#002B5B] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0 bg-[#003B5C] opacity-90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/dental-bg.jpg)' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <img 
              src={logo}
              alt="DentaFlex Logo" 
              className="w-24 h-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">One Last Step!</h2>
            <p className="text-lg opacity-90">Create a new password to secure your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;