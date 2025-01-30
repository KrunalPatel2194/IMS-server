import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import axiosInstance from '../../utils/axios';
import { UserCircle } from 'lucide-react';

const ListAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axiosInstance.get('/admin/admins');
        setAdmins(response.data.admins);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admins');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  if (!isSuperAdmin()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          Access denied. Only super admins can view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Admin Accounts Overview</h2>
        <p className="text-gray-600">
          View and manage all admin accounts. Each admin has access to:
        </p>
        <ul className="list-disc ml-6 mt-2 text-gray-600">
          <li>Admin dashboard features</li>
          <li>User management capabilities</li>
          <li>Content management system</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <UserCircle className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">{admin.name}</h3>
                  <p className="text-gray-500 text-sm">{admin.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListAdmins;