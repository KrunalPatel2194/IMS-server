import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Pencil, Trash2, X, ArrowUp } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface School {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  class: string;
  section: string;
  stream: string;
  photoPath?: string;
  school: School;
  parentDetails: {
    fatherName: string;
    fatherPhone: string;
    fatherEmail: string;
    motherName: string;
    motherPhone: string;
    motherEmail: string;
    address: string;
  };
  feeDetails: {
    totalFee: number;
    paidFee: number;
    dueDate: string;
  };
  idCardIssued: boolean;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    class: '',
    stream: '',
    searchTerm: '',
    school: '',
    section: ''
  });

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    class: '',
    section: '',
    stream: 'science',
    photo: null as File | null,
    school: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    parentAddress: '',
    totalFee: '',
    feeDueDate: ''
  });

  const itemsPerPage = 10;
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const streams = ['science', 'commerce', 'arts'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, [filters]);

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get('/schools');
      setSchools(response.data);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.stream) params.append('stream', filters.stream);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.school) params.append('schoolId', filters.school);
      if (filters.section) params.append('section', filters.section);

      const response = await axiosInstance.get(`/students?${params.toString()}`);
      setStudents(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      if (isEditMode && currentStudent) {
        await axiosInstance.put(`/students/${currentStudent._id}`, formDataToSend);
        showSuccessMessage('Student updated successfully');
      } else {
        await axiosInstance.post('/students', formDataToSend);
        showSuccessMessage('Student created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axiosInstance.delete(`/students/${studentId}`);
      showSuccessMessage('Student deleted successfully');
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handlePromote = async (studentId: string) => {
    try {
      await axiosInstance.post(`/students/${studentId}/promote`);
      showSuccessMessage('Student promoted successfully');
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to promote student');
    }
  };

  const handleEdit = (student: Student) => {
    setCurrentStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      middleName: student.middleName || '',
      lastName: student.lastName,
      dob: new Date(student.dob).toISOString().split('T')[0],
      gender: student.gender,
      address: student.address,
      class: student.class,
      section: student.section,
      stream: student.stream,
      photo: null,
      school: student.school._id,
      fatherName: student.parentDetails.fatherName,
      fatherPhone: student.parentDetails.fatherPhone,
      fatherEmail: student.parentDetails.fatherEmail,
      motherName: student.parentDetails.motherName,
      motherPhone: student.parentDetails.motherPhone,
      motherEmail: student.parentDetails.motherEmail,
      parentAddress: student.parentDetails.address,
      totalFee: student.feeDetails.totalFee.toString(),
      feeDueDate: new Date(student.feeDetails.dueDate).toISOString().split('T')[0]
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      gender: '',
      address: '',
      class: '',
      section: '',
      stream: 'science',
      photo: null,
      school: '',
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      parentAddress: '',
      totalFee: '',
      feeDueDate: ''
    });
    setCurrentStudent(null);
    setIsEditMode(false);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const paginatedStudents = students.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(students.length / itemsPerPage);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">Manage students in the system</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Student
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md flex justify-between items-center">
          <span className="text-sm">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={filters.class}
              onChange={(e) => setFilters({...filters, class: e.target.value})}
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.section}
              onChange={(e) => setFilters({...filters, section: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.stream}
              onChange={(e) => setFilters({...filters, stream: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Streams</option>
              {streams.map(stream => (
                <option key={stream} value={stream}>{stream.charAt(0).toUpperCase() + stream.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={filters.school}
              onChange={(e) => setFilters({...filters, school: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Schools</option>
              {schools.map(school => (
                <option key={school._id} value={school._id}>{school.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Info</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.photoPath && (
                          <img
                            src={student.photoPath}
                            alt={student.firstName}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{`${student.firstName} ${student.middleName || ''} ${student.lastName}`}</div>
                          <div className="text-xs text-gray-500">{student.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">Class {student.class}-{student.section}</div>
                      <div className="text-xs text-gray-500">{student.stream}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.parentDetails.fatherName}</div>
                      <div className="text-xs text-gray-500">{student.parentDetails.fatherPhone}</div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.school.name}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePromote(student._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Promote student"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit student"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">No students found</div>
            )}

            {totalPages > 1 && (
              <div className="bg-white px-3 sm:px-6 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className={`w-full sm:w-auto px-3 py-1 rounded-md text-sm font-medium ${
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
                    className={`w-full sm:w-auto px-3 py-1 rounded-md text-sm font-medium ${
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">
                  {isEditMode ? 'Edit Student' : 'Create New Student'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Class</label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Section</option>
                      {sections.map(section => (
                        <option key={section} value={section}>Section {section}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Stream</label>
                    <select
                      value={formData.stream}
                      onChange={(e) => setFormData({...formData, stream: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {streams.map(stream => (
                        <option key={stream} value={stream}>{stream.charAt(0).toUpperCase() + stream.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">School</label>
                    <select
                      value={formData.school}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select School</option>
                      {schools.map(school => (
                        <option key={school._id} value={school._id}>{school.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Photo</label>
                    <input
                      type="file"
                      onChange={(e) => setFormData({...formData, photo: e.target.files?.[0] || null})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      accept="image/*"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                      rows={3}
                    />
                  </div>

                  <div className="col-span-full border-t pt-4 mt-4">
                    <h4 className="text-lg font-medium mb-4">Parent Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Father's Name</label>
                        <input
                          type="text"
                          value={formData.fatherName}
                          onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Father's Phone</label>
                        <input
                          type="tel"
                          value={formData.fatherPhone}
                          onChange={(e) => setFormData({...formData, fatherPhone: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Father's Email</label>
                        <input
                          type="email"
                          value={formData.motherEmail}
                          onChange={(e) => setFormData({...formData, motherEmail: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Parents' Address</label>
                        <textarea
                          value={formData.parentAddress}
                          onChange={(e) => setFormData({...formData, parentAddress: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full border-t pt-4 mt-4">
                    <h4 className="text-lg font-medium mb-4">Fee Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Total Fee</label>
                        <input
                          type="number"
                          value={formData.totalFee}
                          onChange={(e) => setFormData({...formData, totalFee: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={formData.feeDueDate}
                          onChange={(e) => setFormData({...formData, feeDueDate: e.target.value})}
                          className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Student' : 'Create Student'}
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

export default StudentsPage;