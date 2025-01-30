import  { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import logo from '../assets/dentaflex-icon.png';
import { StatusState } from '../types/auth.types';

const VerifyCodePage = () => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState>({ type: '', message: '' });
  const navigate = useNavigate();
  const { verifyResetCode } = useAuth();
  const inputRefs =  useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    const resetEmail = localStorage.getItem('resetEmail');
    if (!resetEmail) {
      navigate('/forgot-password');
    }
    inputRefs.current[0]?.focus();
  }, [navigate, inputRefs]);

  const handleInput = (index: number, value: string): void => {
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && index > 0 && code[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    const digits = pastedData.split('').filter(char => /^[0-9]$/.test(char));
    
    const newCode = [...code];
    digits.forEach((digit, index) => {
      if (index < 6) newCode[index] = digit;
    });
    setCode(newCode);

    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setStatus({
        type: 'error',
        message: 'Please enter all digits of the recovery code.'
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const email = localStorage.getItem('resetEmail');
      if (!email) {
        throw new Error('Email not found. Please try again.');
      }

      const result = await verifyResetCode(email, verificationCode);
      
      if (result.success) {
        // Store the verification code for the reset password page
        localStorage.setItem('resetCode', verificationCode);
        
        setStatus({
          type: 'success',
          message: 'Code verified successfully!'
        });
        
        setTimeout(() => {
          navigate('/reset-password');
        }, 2000);
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Invalid verification code'
        });
      }
    } catch (error) {
      console.error('Verification failed:', error); // Use the error for debugging
      setStatus({
        type: 'error',
        message: 'Verification failed. Please try again.',
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
              Verify Recovery Code
            </h1>
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to your email
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Recovery Code
              </label>
              <div className="flex gap-2 justify-between">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-semibold rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#003B5C] text-white py-2 px-4 rounded font-medium hover:bg-[#002B5B] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                  Resend code
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Log in
                </Link>
              </p>
            </div>
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
            <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
            <p className="text-lg opacity-90">Verify your identity to reset your password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;