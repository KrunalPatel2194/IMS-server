import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/dentaflex-icon.png';
import { useAuth } from '../context/authContext';
const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();
    const { requestPasswordReset } = useAuth();
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setStatus({ type: '', message: '' });
  
      try {
        const result = await requestPasswordReset(email);
        
        if (result.success) {
          setStatus({
            type: 'success',
            message: result.message || 'Recovery code has been sent to your email address.'
          });
          
          // Store email for the verification page
          localStorage.setItem('resetEmail', email);
          
          // Navigate to verification page
          setTimeout(() => {
            navigate('/verify-recovery');
          }, 2000);
        } else {
          setStatus({
            type: 'error',
            message: result.error || 'Failed to send recovery code'
          });
        }
      }  catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message); // Access the error message safely
        }
        setStatus({
          type: 'error',
          message: 'An error occurred. Please try again.'
        });
      }
      finally {
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
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your email address to receive a recovery code
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#003B5C] text-white py-2 px-4 rounded font-medium hover:bg-[#002B5B] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Recovery Code'}
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
            <h2 className="text-2xl font-bold mb-2">Password Recovery</h2>
            <p className="text-lg opacity-90">We'll help you get back to your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;