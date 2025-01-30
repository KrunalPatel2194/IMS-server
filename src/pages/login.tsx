import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await auth.superAdminLogin(formData.email, formData.password);
      console.log(response,"loginRE")
      if (response.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center">Admin Login</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;