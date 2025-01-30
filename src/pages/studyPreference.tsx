// StudyPreferences.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import axiosInstance from '../utils/axios';

interface Field {
  _id: string;
  name: string;
}

interface Exam {
  _id: string;
  name: string;
  fieldOfStudy: string;
}

interface PreferenceFormData {
  fieldOfStudy: string;
  selectedExam: string;
}

const StudyPreferences: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferenceData, setPreferenceData] = useState<PreferenceFormData>({
    fieldOfStudy: '',
    selectedExam: ''
  });

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axiosInstance.get('/fields');
        setFields(response.data);
      } catch (err) {
        setError('Failed to load fields of study');
        console.error('Error fetching fields:', err);
      }
    };

    fetchFields();
  }, []);

  const handlePreferenceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'fieldOfStudy') {
      setPreferenceData({
        fieldOfStudy: value,
        selectedExam: ''
      });
      
      if (value) {
        try {
          const response = await axiosInstance.get(`/exams/byFieldOfStudy/${value}`);
          setExams(response.data);
        } catch (error) {
          console.error('Error fetching exams:', error);
        }
      } else {
        setExams([]);
      }
    } else {
      setPreferenceData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const selectedField = fields.find(field => field._id === preferenceData.fieldOfStudy);
      const selectedExam = exams.find(exam => exam._id === preferenceData.selectedExam);

      if (!selectedField || !selectedExam) {
        setError('Invalid selection');
        return;
      }

      const response = await axiosInstance.put(`/profile/save-preference`, {
        userId: user?._id,
        fieldOfStudy: selectedField.name,
        selectedExam: selectedExam.name,
      });

      if (response.status === 200) {
        updateUser({
          ...user,
          fieldOfStudy: selectedField.name,
          selectedExam: selectedExam.name
        });
        navigate('/payment-packages');

        console.log(user ,"USER AUTH")
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('An error occurred while saving preferences');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Welcome to DentaFlex</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study
            </label>
            <p className="text-sm text-gray-600 mb-2">Choose your primary academic focus (e.g., Dentistry, Medicine). This determines the scope of your study materials.</p>
            <select
              name="fieldOfStudy"
              value={preferenceData.fieldOfStudy}
              onChange={handlePreferenceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A]"
              required
            >
              <option value="">Select Field of Study</option>
              {fields.map(field => (
                <option key={field._id} value={field._id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Exam
            </label>
            <p className="text-sm text-gray-600 mb-2">Choose the specific exam you're preparing for (e.g., AFK - Assessment of Fundamental Knowledge). You'll get access to exam-specific content and practice materials.</p>
            <select
              name="selectedExam"
              value={preferenceData.selectedExam}
              onChange={handlePreferenceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A]"
              disabled={!preferenceData.fieldOfStudy}
              required
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#033F6A] text-white py-2 px-4 rounded-md hover:bg-[#022a47] transition-colors disabled:opacity-50"
            disabled={loading || !preferenceData.fieldOfStudy || !preferenceData.selectedExam}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudyPreferences;