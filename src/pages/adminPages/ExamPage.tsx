// pages/adminPages/ExamPage/index.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Exam {
  _id: string;
  name: string;
  description: string;
  fieldOfStudy: {
    _id: string;
    name: string;
  };
  subjects?: any[];
}

interface FieldOfStudy {
  _id: string;
  name: string;
}

const ExamPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [fields, setFields] = useState<FieldOfStudy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fieldOfStudyId: ''
  });

  const itemsPerPage = 5;

  const fetchFieldsOfStudy = async () => {
    try {
      const response = await axiosInstance.get('/admin-main/fields-of-study');
      setFields(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fields of study');
    }
  };

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/admin-main/exams');
      setExams(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldsOfStudy();
    fetchExams();
  }, []);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentExam(null);
    setFormData({
      name: '',
      description: '',
      fieldOfStudyId: selectedFieldId
    });
    setIsModalOpen(true);
  };

  const handleEdit = (exam: Exam) => {
    setIsEditing(true);
    setCurrentExam(exam);
    setFormData({
      name: exam.name,
      description: exam.description,
      fieldOfStudyId: exam.fieldOfStudy._id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (isEditing && currentExam) {
        await axiosInstance.put(`/admin-main/exams/${currentExam._id}`, formData);
        showSuccessMessage('Exam updated successfully');
      } else {
        await axiosInstance.post('/admin-main/exams', formData);
        showSuccessMessage('Exam created successfully');
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (exam: Exam) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/admin-main/exams/${exam._id}`);
      showSuccessMessage('Exam deleted successfully');
      fetchExams();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredExams = selectedFieldId
    ? exams.filter(exam => exam.fieldOfStudy._id === selectedFieldId)
    : exams;

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage exams for different fields of study
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exam
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

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedFieldId}
            onChange={(e) => {
              setSelectedFieldId(e.target.value);
              setCurrentPage(1); // Reset page when filter changes
            }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Fields of Study</option>
            {fields.map((field) => (
              <option key={field._id} value={field._id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field of Study
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedExams.map((exam) => (
                <tr key={exam._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.fieldOfStudy.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {exam.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.subjects?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam)}
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

          {/* Empty State */}
          {paginatedExams.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No exams found
            </div>
          )}

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
      )}

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
                  {isEditing ? 'Edit Exam' : 'Add Exam'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="fieldOfStudyId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Field of Study
                  </label>
                  <select
                    id="fieldOfStudyId"
                    name="fieldOfStudyId"
                    value={formData.fieldOfStudyId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a field of study</option>
                    {fields.map((field) => (
                      <option key={field._id} value={field._id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      isEditing ? 'Update' : 'Create'
                    )}
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

export default ExamPage;