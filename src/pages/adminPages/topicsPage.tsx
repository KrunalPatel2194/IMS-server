// pages/adminPages/TopicsPage/index.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Topic {
    _id: string;
    name: string;
    content: string;
    isPublic: boolean;
    subject: {
      _id: string;
      name: string;
      exam: {
        _id: string;
        name: string;
        fieldOfStudy: {
          _id: string;
          name: string;
        }
      }
    };
    subtopics?: any[];
  }
  interface FieldOfStudy {
    _id: string;
    name: string;
  }
  
  interface Exam {
    _id: string;
    name: string;
    fieldOfStudy: FieldOfStudy;
  }
  
  interface Subject {
    _id: string;
    name: string;
    description: string;
    content: string;
    isPublic: boolean;
    exam: Exam;
    topics: Topic[];
  }
  
  interface Topic {
    _id: string;
    name: string;
    content: string;
    isPublic: boolean;
    subject: {
      _id: string;
      name: string;
      exam: Exam;
    };
    subtopics?: Subtopic[];
  }
  
  interface Subtopic {
    _id: string;
    name: string;
    content: string;
    isPublic: boolean;
  }

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isPublic: false,
    subjectId: '',
    examId: ''
  });

  const itemsPerPage = 10;
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
      const response = await axiosInstance.get('/admin-main/subjects');
      setSubjects(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    }
  };

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      let url = '/admin-main/topics';
      if (selectedExamId) {
        url += `?examId=${selectedExamId}`;
      } else if (selectedSubjectId) {
        url += `?subjectId=${selectedSubjectId}`;
      }
      const response = await axiosInstance.get(url);
      setTopics(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch topics');
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

  useEffect(() => {
    fetchTopics();
  }, [selectedExamId,selectedSubjectId]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentTopic(null);
    setFormData({
      name: '',
      content: '',
      isPublic: false,
      subjectId: selectedSubjectId,
      examId: selectedExamId
    });
    setIsModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setIsEditing(true);
    setCurrentTopic(topic);
    setFormData({
      name: topic.name,
      content: topic.content,
      isPublic: topic.isPublic,
      subjectId: topic.subject._id
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (isEditing && currentTopic) {
        await axiosInstance.put(`/admin-main/topics/${currentTopic._id}`, formData);
        showSuccessMessage('Topic updated successfully');
      } else {
        await axiosInstance.post('/admin-main/topics', {
          subjectId: formData.subjectId,
          data: {
            name: formData.name,
            content: formData.content,
            isPublic: formData.isPublic
          }
        });
        showSuccessMessage('Topic created successfully');
      }
      setIsModalOpen(false);
      fetchTopics();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save topic');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (topic: Topic) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/admin-main/topics/${topic._id}`);
      showSuccessMessage('Topic deleted successfully');
      fetchTopics();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete topic');
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

  const paginatedTopics = topics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(topics.length / itemsPerPage);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage topics and their content
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
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
    <div className="flex gap-4">
      <select
        value={selectedExamId}
        onChange={(e) => {
          setSelectedExamId(e.target.value);
          setSelectedSubjectId('');
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

      <select
        value={selectedSubjectId}
        onChange={(e) => {
          setSelectedSubjectId(e.target.value);
          setCurrentPage(1);
        }}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Subjects</option>
        {subjects
          .filter(subject => !selectedExamId || subject.exam._id === selectedExamId)
          .map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
        ))}
      </select>
    </div>
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
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtopics
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
              {paginatedTopics.map((topic) => (
                <tr key={topic._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.subject.exam.name}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.subject.name}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.subtopics?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${topic.isPublic 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {topic.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(topic)}
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
          {paginatedTopics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No topics found
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
                  {isEditing ? 'Edit Topic' : 'Add Topic'}
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
    <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
      Exam
    </label>
    <select
      id="examId"
      name="examId"
      value={formData.examId || selectedExamId}
      onChange={(e) => {
        handleInputChange(e);
        setFormData(prev => ({...prev, subjectId: ''}));
      }}
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
    <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
      Subject
    </label>
    <select
      id="subjectId"
      name="subjectId"
      value={formData.subjectId}
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      required
    >
      <option value="">Select a subject</option>
      {subjects
        .filter(subject => !formData.examId || subject.exam._id === formData.examId)
        .map((subject) => (
          <option key={subject._id} value={subject._id}>
            {subject.name}
          </option>
      ))}
    </select>
  </div>
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

                {/* <div>
                  <label
                    htmlFor="subjectId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div> */}

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
                    Make this topic public
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

export default TopicsPage;