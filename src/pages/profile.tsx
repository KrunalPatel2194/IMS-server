import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import {  User, Lock, School } from 'lucide-react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
interface ProfileFormData {
  name: string;
  email: string;
  selectedExam?: string;
  fieldOfStudy?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FieldOfStudy {
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

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    selectedExam: user?.selectedExam || '',
    fieldOfStudy: user?.fieldOfStudy || ''
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [validatingPassword, setValidatingPassword] = useState(false);
  const [fields, setFields] = useState<FieldOfStudy[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [preferenceData, setPreferenceData] = useState<PreferenceFormData>({
    fieldOfStudy: '',
    selectedExam: ''
  });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [hasPreferencesChanged, setHasPreferencesChanged] = useState(false);

  useEffect(() => {

    const fetchFields = async () => {
      try {
        const response = await axiosInstance.get('/fields');
        setFields(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message); // Access the error message safely
        }
        setError('An error occurred');
      }
    };

    if (activeView === 'preferences') {
    console.log("user Data:",user,activeView)

      fetchFields();
    }
  }, [activeView,user ]);

  useEffect(() => {
    const selectedField = fields.find(f => f._id === preferenceData.fieldOfStudy)?.name;
    const selectedExam = exams.find(e => e._id === preferenceData.selectedExam)?.name;
    
    const hasChanged = Boolean(
      (selectedField && selectedField !== user?.fieldOfStudy) || 
      (selectedExam && selectedExam !== user?.selectedExam)
    );
    const isComplete = Boolean(selectedField && selectedExam);
    
    setHasPreferencesChanged(hasChanged && isComplete);
    console.log('Preferences changed:', hasChanged && isComplete);
  }, [preferenceData.fieldOfStudy, preferenceData.selectedExam, fields, exams, user]);

  useEffect(() => {
    const initializePreferences = async () => {
      if (activeView === 'preferences' && fields.length > 0 && user?.fieldOfStudy) {
        const selectedField = fields.find(field => field.name === user.fieldOfStudy);
        if (selectedField) {
          setPreferenceData(prev => ({ ...prev, fieldOfStudy: selectedField._id }));
          
          try {
            const response = await axiosInstance.get(`/exams/byFieldOfStudy/${selectedField._id}`);
            setExams(response.data);
            
            if (user?.selectedExam) {
              const selectedExam = response.data.find((exam: Exam) => exam.name === user.selectedExam);

              if (selectedExam) {
                setPreferenceData(prev => ({
                  ...prev,
                  fieldOfStudy: selectedField._id,
                  selectedExam: selectedExam._id
                }));
              }
            }
          } catch (error) {
            console.error('Error fetching exams:', error);
          }
        }
      }
    };
  
    initializePreferences();
  }, [activeView, fields, user?.fieldOfStudy, user?.selectedExam]);

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

  const handlePreferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLogoutAlert(true);
  };

  const handleConfirmPreferenceChange = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const selectedField = fields.find(field => field._id === preferenceData.fieldOfStudy);
      const selectedExam = exams.find(exam => exam._id === preferenceData.selectedExam);
  
      if (!selectedField || !selectedExam) {
        setError('Invalid selection. Please try again.');
        setLoading(false);
        return;
      }
      console.log("USER DATA:", user)
      // API call to save the preferences
      const response = await axiosInstance.put(`/profile/save-preference`, {
        userId: user?._id,
        fieldOfStudy: selectedField.name,
        selectedExam: selectedExam.name,
      });
      console.log(response,"RESPONSE save")
      if (response.status === 200) {
        // Update user context with new preferences
        setPreferenceData(prev => ({
            ...prev,
            fieldOfStudy: selectedField._id,
            selectedExam: selectedExam._id
          }));
  
        setError(null);
        await logout();
        navigate('/login'); // Redirect back to profile view
      } else {
        setError('Failed to save preferences.');
      }
    }catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message); // Access the error message safely
      }
      setError('An error occurred');
    } 
     finally {
      setLoading(false);
    }
  };
  

  const renderPreferencesForm = () => (
    <div className="space-y-6">
      {user?.fieldOfStudy && user?.selectedExam && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">
            Current preferences: {user.fieldOfStudy} - {user.selectedExam}
          </p>
        </div>
      )}

      <form onSubmit={handlePreferenceSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study
            </label>
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
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setActiveView('profile')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#033F6A] text-white rounded-md hover:bg-[#022a47] disabled:opacity-50"
            disabled={loading || !preferenceData.fieldOfStudy || !preferenceData.selectedExam || !hasPreferencesChanged}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {showLogoutAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Preference Change</h3>
            <p className="text-gray-600 mb-4">
              Changing your preferences will require you to log in again. Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutAlert(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPreferenceChange}
                className="px-4 py-2 bg-[#033F6A] text-white rounded-md hover:bg-[#022a47]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const verifyCurrentPassword = async (password: string) => {
    if (!password) {
      setIsCurrentPasswordValid(false);
      return;
    }
    
    setValidatingPassword(true);
    try {
      const response = await axiosInstance.post('/auth/verify-password', { 
        password: password,
        email: user?.email  // Add email to verification request
      });
      setIsCurrentPasswordValid(response.data.isValid);
    }  catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message); // Access the error message safely
      }
      setIsCurrentPasswordValid(false);
      setError('An error occurred');
    }finally {
      setValidatingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axiosInstance.put('/profile', formData);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message); // Access the error message safely
      }
      setError('Failed to update profile');
    }
    finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentPasswordValid || passwordData.newPassword !== passwordData.confirmPassword) {
      setError(
        !isCurrentPasswordValid 
          ? 'Current password is incorrect' 
          : 'New passwords do not match'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.post('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setActiveView('profile');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message); // Access the error message safely
      }
      setError('Failed to update password');
    }
    finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handlePasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === 'currentPassword') {
      verifyCurrentPassword(e.target.value);
    }
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderProfileForm = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A] disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A] disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Exam
          </label>
          <input
            type="text"
            name="selectedExam"
            value={formData.selectedExam}
            onChange={handleInputChange}
            disabled={true}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A] disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field of Study
          </label>
          <input
            type="text"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleInputChange}
            disabled={true}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A] disabled:bg-gray-50"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#033F6A] text-white rounded-md hover:bg-[#022a47] transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#033F6A] text-white rounded-md hover:bg-[#022a47] transition-colors duration-200"
          >
            Edit Profile
          </button>
        )}
      </div>
    </form>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handleUpdatePassword} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            className={`w-full px-4 py-2 border rounded-md focus:ring-[#033F6A] focus:border-[#033F6A] 
              ${isCurrentPasswordValid ? 'border-green-500' : 'border-gray-300'}`}
            required
          />
          {validatingPassword && (
            <span className="text-sm text-gray-500">Verifying password...</span>
          )}
          {!validatingPassword && passwordData.currentPassword && !isCurrentPasswordValid && (
            <span className="text-sm text-red-500">Incorrect password</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A]"
            required
            disabled={!isCurrentPasswordValid}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#033F6A] focus:border-[#033F6A]"
            required
            disabled={!isCurrentPasswordValid}
          />
          {passwordData.newPassword && passwordData.confirmPassword && 
           passwordData.newPassword !== passwordData.confirmPassword && (
            <span className="text-sm text-red-500">Passwords do not match</span>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setActiveView('profile');
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#033F6A] text-white rounded-md hover:bg-[#022a47] transition-colors duration-200 disabled:opacity-50"
          disabled={
            loading || 
            !isCurrentPasswordValid || 
            !passwordData.newPassword || 
            passwordData.newPassword !== passwordData.confirmPassword
          }
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-4 gap-6 h-full">
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 h-full">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#033F6A] flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{formData.name}</h1>
                  <p className="text-gray-500">{formData.email}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm">{error}</div>
              )}

              {activeView === 'profile' && renderProfileForm()}
              {activeView === 'password' && renderPasswordForm()}
              {activeView === 'preferences' && renderPreferencesForm()}
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#033F6A] mb-4">
                Quick Links
              </h2>
              
              <div className="space-y-2">
                {activeView !== 'profile' && (
                  <button 
                    onClick={() => setActiveView('profile')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">Update Profile</span>
                    </div>
                  </button>
                )}

                {/* {user?.provider !== 'google' && activeView !== 'password' && (
                  <button 
                    onClick={() => setActiveView('password')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">Change Password</span>
                    </div>
                  </button>
                )} */}

                {activeView !== 'preferences' && (
                  <button 
                    onClick={() => setActiveView('preferences')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <School className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">Study Preferences</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;