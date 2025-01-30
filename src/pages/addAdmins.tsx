import React, { useState } from 'react';
import { Plus, Minus, Upload } from 'lucide-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/authContext';

const CreateAdmins = () => {
  const { isSuperAdmin,user } = useAuth();
  const [admins, setAdmins] = useState([{ email: '', name: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addAdmin = () => setAdmins([...admins, { email: '', name: '' }]);

  const removeAdmin = (index) => {
    const newAdmins = [...admins];
    newAdmins.splice(index, 1);
    setAdmins(newAdmins);
  };

  const handleInputChange = (index, field, value) => {
    const newAdmins = [...admins];
    newAdmins[index][field] = value;
    setAdmins(newAdmins);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug user role
    console.log('Current user role:', user?.role);
    console.log('Is superadmin:', isSuperAdmin());
  
    if (!isSuperAdmin()) {
      setError('Only super admins can create admin accounts');
      return;
    }
  
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const response = await axiosInstance.post('/admin/create-admins', { admins });
      console.log('Response:', response);
      setSuccess('Admins created successfully!');
      setAdmins([{ email: '', name: '' }]);
    } catch (err) {
      console.error('Create admins error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to create admins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Bulk Create Admin Accounts</h2>
        <p className="text-gray-600 mb-2">
          Create multiple admin accounts simultaneously. Each admin will receive:
        </p>
        <ul className="list-disc ml-6 mt-2 text-gray-600">
          <li>Access to admin dashboard</li>
          <li>Default password: defaultPassword123</li>
          <li>Instructions to change password on first login</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-500 rounded-md">{success}</div>
        )}

        {admins.map((admin, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Admin {index + 1}</h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAdmin(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={admin.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={admin.email}
                  onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={addAdmin}
            className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Admin
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              'Creating...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Accounts
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdmins;