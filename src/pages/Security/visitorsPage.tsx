import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, LogOut, X } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Staff {
  _id: string;
  fullName: string;
  role: string;
  email: string;
  contactNumber: string;
}

interface Visitor {
  _id: string;
  fullName: string;
  phoneNumber: string;
  timeIn: string;
  timeOut?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  visitingTo: Staff;
}

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    searchTerm: '',
    visitingTo: ''
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    visitingTo: '',
    timeIn: new Date().toISOString().split('.')[0]
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [filters]);

  const fetchStaffMembers = async () => {
    console.log("fetch Staff Me")
    try {
      const response = await axiosInstance.get('/staff');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid staff data received');
      }
      setStaffMembers(response.data);
    } catch (err: any) {
      console.error('Staff fetch error:', err);
      setError('Unable to load staff members. Please try again.');
    }
  };
  

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.visitingTo) params.append('visitingTo', filters.visitingTo);

      const response = await axiosInstance.get(`/visitors?${params.toString()}`);
      setVisitors(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch visitors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (visitorId: string) => {
    try {
      await axiosInstance.patch(`/visitors/${visitorId}/checkout`);
      showSuccessMessage('Visitor checked out successfully');
      fetchVisitors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to checkout visitor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axiosInstance.post('/visitors', formData);
      setIsModalOpen(false);
      showSuccessMessage('Visitor registered successfully');
      setFormData({
        fullName: '',
        phoneNumber: '',
        visitingTo: '',
        timeIn: new Date().toISOString().split('.')[0]
      });
      fetchVisitors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register visitor');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const paginatedVisitors = visitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(visitors.length / itemsPerPage);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      {/* Header - Responsive stack on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Visitors</h1>
          <p className="mt-1 text-sm text-gray-500">Manage visitor entries and checkouts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Visitor
        </button>
      </div>

      {/* Messages - Full width on all screens */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters - Responsive grid layout */}
      <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={filters.visitingTo}
              onChange={(e) => setFilters({...filters, visitingTo: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Staff</option>
              {staffMembers.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.fullName} - {staff.role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiting</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{visitor.fullName}</div>
                      <div className="sm:hidden text-xs text-gray-500">{visitor.phoneNumber}</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.phoneNumber}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{visitor.visitingTo.fullName}</div>
                      <div className="text-xs text-gray-500">{visitor.visitingTo.role}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(visitor.timeIn).toLocaleString()}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.timeOut ? new Date(visitor.timeOut).toLocaleString() : '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${visitor.status === 'CHECKED_IN' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {visitor.status === 'CHECKED_IN' ? 'Present' : 'Left'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                      {visitor.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckout(visitor._id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Checkout visitor"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedVisitors.length === 0 && (
              <div className="text-center py-8 text-gray-500">No visitors found</div>
            )}

            {/* Responsive Pagination */}
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

      {/* New Visitor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setIsModalOpen(false)} 
            />
            
            <div className="relative bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Register New Visitor
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Visiting To
                  </label>
                  <select
                    value={formData.visitingTo}
                    onChange={(e) => setFormData({...formData, visitingTo: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 border"
                    required
                  >
                    <option value="">Select Staff Member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.fullName} - {staff.role} ({staff.contactNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      'Register Visitor'
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

export default VisitorsPage;

