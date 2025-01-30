import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/dentaflex-icon.png';
import { SignUpFormData } from '../types/auth.types';
import { useAuth } from '../context/authContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AxiosError } from 'axios';
const SignUpPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim()
      });

      if (result.success) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || 'An unexpected error occurred');
      } else {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Create Your Account
            </h1>
            <p className="text-gray-600 text-sm">Join our community of future dentists</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                required
                disabled={isLoading}
              />
              <label 
                htmlFor="agreeToTerms" 
                className="ml-2 text-sm text-gray-600"
              >
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003B5C] text-white py-2 px-4 rounded font-medium hover:bg-[#002B5B] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* <button
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <img 
                src={googleLogo}
                alt="Google" 
                className="w-5 h-5"
              />
              SIGN UP WITH GOOGLE
            </button> */}
            <GoogleAuthButton
  mode="login"
  onError={(error) => console.error(error)}
  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors"
/>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

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
            <h2 className="text-2xl font-bold mb-2">Join DentaFlex Today</h2>
            <p className="text-lg opacity-90">Start Your Journey to Excellence in Dentistry</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;