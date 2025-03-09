import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X, ChevronDown, ChevronRight, Filter, Save } from 'lucide-react';
import axiosInstance from '../../utils/axios';

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
  exam: Exam;
}

interface Topic {
  _id: string;
  name: string;
  content?: string;
  subject: {
    _id: string;
    name: string;
    exam: {
      _id: string;
      name: string;
    };
  };
}

interface ContentStructure {
  subject: {
    title: string;
  };
  topics: Array<{
    name: string;
    subtopics: Array<{
      name: string;
    }>;
  }>;
}

interface ContentAuditResponse {
  success: boolean;
  auditId: string;
}

interface ContentStatusResponse {
  data: {
    status: 'in_progress' | 'completed' | 'failed';
    aiResponse?: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const GenerateContentPage: React.FC = () => {
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchFieldsOfStudy();
  }, []);

  useEffect(() => {
    if (selectedFieldId) {
      fetchExams(selectedFieldId);
      setSelectedExamId('');
      setSelectedSubjectId('');
    }
  }, [selectedFieldId]);

  useEffect(() => {
    if (selectedExamId) {
      fetchSubjects(selectedExamId);
      setSelectedSubjectId('');
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchTopics(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const fetchFieldsOfStudy = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<ApiResponse<FieldOfStudy[]>>('/admin-main/fields-of-study');
      setFieldsOfStudy(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fields of study');
    }
  };

  const fetchExams = async (fieldId: string): Promise<void> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Exam[]>>(`/admin-main/exams?fieldOfStudy=${fieldId}`);
      setExams(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    }
  };

  const fetchSubjects = async (examId: string): Promise<void> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Subject[]>>(`/admin-main/subjects?examId=${examId}`);
      setSubjects(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    }
  };

  const fetchTopics = async (subjectId: string): Promise<void> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Topic[]>>(`/admin-main/topics?subjectId=${subjectId}`);
      setTopics(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch topics');
    }
  };

  const handleGenerateContent = async (topic: Topic): Promise<void> => {
    try {
      setIsGenerating(true);
      setSelectedTopic(topic);
      
      const contentStructure: ContentStructure = {
        subject: { 
          title: subjects.find(s => s._id === selectedSubjectId)?.name || '' 
        },
        topics: [{
          name: topic.name,
          subtopics: [{ name: topic.name }]
        }]
      };

      const response = await axiosInstance.post<ContentAuditResponse>('/admin-main/content-audit', {
        type: 'generate',
        content: contentStructure
      });

      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axiosInstance.get<ContentStatusResponse>(
            `/admin-main/content-audit/${response.data.auditId}`
          );
          
          const { status, aiResponse } = statusResponse.data.data;

          if (status === 'completed' && aiResponse) {
            clearInterval(pollInterval);
            setGeneratedContent(aiResponse);
            setEditedContent(aiResponse);
            setIsModalOpen(true);
            setIsGenerating(false);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setError('Content generation failed');
            setIsGenerating(false);
          }
        } catch (err: any) {
          clearInterval(pollInterval);
          setError('Failed to check generation status');
          setIsGenerating(false);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate content');
      setIsGenerating(false);
    }
  };

  const handleContentSubmit = async (): Promise<void> => {
    if (!selectedTopic) return;

    try {
      await axiosInstance.put(`/admin-main/topics/${selectedTopic._id}`, {
        ...selectedTopic,
        content: editedContent
      });
      
      showSuccessMessage('Content updated successfully');
      setIsModalOpen(false);
      fetchTopics(selectedSubjectId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update content');
    }
  };

  const showSuccessMessage = (message: string): void => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and generate content for topics
          </p>
        </div>
      </div>

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

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex gap-4">
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Fields of Study</option>
              {fieldsOfStudy.map((field) => (
                <option key={field._id} value={field._id}>
                  {field.name}
                </option>
              ))}
            </select>

            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
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
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic) => (
                <tr key={topic._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.subject?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.subject?.exam?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${topic.content ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {topic.content ? 'Content Available' : 'No Content'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {topic.content ? (
                        <button
                          onClick={() => {
                            setSelectedTopic(topic);
                            setEditedContent(topic.content || '');
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateContent(topic)}
                          disabled={isGenerating}
                          className={`px-3 py-1 rounded-md text-sm font-medium 
                            ${isGenerating 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {topics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No topics found
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedTopic && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedTopic.content ? 'Edit Content' : 'Review Generated Content'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {selectedTopic.content ? 'Original Content' : 'Generated Content'}
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-md h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {selectedTopic.content || generatedContent}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Edited Content</h4>
                  <textarea
                    value={editedContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedContent(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContentSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateContentPage;