// pages/adminPages/FieldOfStudyPage/index.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface FieldOfStudy {
  _id: string;
  name: string;
  exams?: any[];
}

const FieldOfStudyPage = () => {
  const [fields, setFields] = useState<FieldOfStudy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentField, setCurrentField] = useState<FieldOfStudy | null>(null);
  const [name, setName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 5;

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/admin-main/fields-of-study');
      setFields(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fields of study');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentField(null);
    setName('');
    setIsModalOpen(true);
  };

  const handleEdit = (field: FieldOfStudy) => {
    setIsEditing(true);
    setCurrentField(field);
    setName(field.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (isEditing && currentField) {
        await axiosInstance.put(`/admin-main/fields-of-study/${currentField._id}`, {
          name
        });
        showSuccessMessage('Field of study updated successfully');
      } else {
        await axiosInstance.post('/admin-main/fields-of-study', { name });
        showSuccessMessage('Field of study created successfully');
      }
      setIsModalOpen(false);
      fetchFields();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save field of study');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (field: FieldOfStudy) => {
    if (!confirm('Are you sure you want to delete this field of study?')) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/admin-main/fields-of-study/${field._id}`);
      showSuccessMessage('Field of study deleted successfully');
      fetchFields();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete field of study');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(fields.length / itemsPerPage);
  const paginatedFields = fields.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fields of Study</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fields of study and their associated exams
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number of Exams
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedFields.map((field) => (
              <tr key={field._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {field.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {field.exams?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(field)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(field)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Field of Study' : 'Add Field of Study'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldOfStudyPage;