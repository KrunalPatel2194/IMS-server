// pages/adminPages/SubjectsPage/index.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Subject {
  _id: string;
  name: string;
  description: string;
  content: string;
  isPublic: boolean;
  exam: {
    _id: string;
    name: string;
  };
  topics: any[];
}

interface Exam {
  _id: string;
  name: string;
}

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    isPublic: false,
    examId: ''
  });

  const itemsPerPage = 5;

  const fetchExams = async () => {
    try {
      const response = await axiosInstance.get('/admin-main/exams');
      setExams(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    }
  };

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const url = selectedExamId 
        ? `/admin-main/subjects?examId=${selectedExamId}`
        : '/admin-main/subjects';
      const response = await axiosInstance.get(url);
      setSubjects(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [selectedExamId]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentSubject(null);
    setFormData({
      name: '',
      description: '',
      content: '',
      isPublic: false,
      examId: selectedExamId
    });
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setIsEditing(true);
    setCurrentSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      content: subject.content,
      isPublic: subject.isPublic,
      examId: subject.exam._id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (isEditing && currentSubject) {
        await axiosInstance.put(`/admin-main/subjects/${currentSubject._id}`, formData);
        showSuccessMessage('Subject updated successfully');
      } else {
        await axiosInstance.post('/admin-main/subjects', {
          examId: formData.examId,
          data: {
            name: formData.name,
            description: formData.description,
            content: formData.content,
            isPublic: formData.isPublic
          }
        });
        showSuccessMessage('Subject created successfully');
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/admin-main/subjects/${subject._id}`);
      showSuccessMessage('Subject deleted successfully');
      fetchSubjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete subject');
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isPublic: e.target.checked
    }));
  };

  const paginatedSubjects = subjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(subjects.length / itemsPerPage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage subjects and their content
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
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
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Exams</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.name}
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
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.exam.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.topics?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${subject.isPublic 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subject.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
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
          {paginatedSubjects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subjects found
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
                  {isEditing ? 'Edit Subject' : 'Add Subject'}
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
                    htmlFor="examId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Exam
                  </label>
                  <select
                    id="examId"
                    name="examId"
                    value={formData.examId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select an exam</option>
                    {exams.map((exam) => (
                      <option key={exam._id} value={exam._id}>
                        {exam.name}
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

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Make this subject public
                  </label>
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

export default SubjectsPage;