import React, { useState, useEffect } from 'react';
import { Search, History, CalendarDays, Banknote, Filter, X } from 'lucide-react';
import axiosInstance from '../../../utils/axios';
import PaymentHistoryModal from './paymentHistoryModal';
import ExtensionHistoryModal from './extensionHistoryModal';
import { Student, FeePayment, DueDateExtension, PaymentFormData, ExtensionFormData, FilterOptions } from './types';
import { useAuth } from '../../../context/authContext';

const FeeCollectionPage = () => {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<FeePayment[]>([]);
  const [extensionHistory, setExtensionHistory] = useState<DueDateExtension[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isExtensionHistoryModalOpen, setIsExtensionHistoryModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    class: '',
    section: '',
    dueStatus: 'overdue'
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amountPaid: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  const [extensionForm, setExtensionForm] = useState<ExtensionFormData>({
    newDueDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axiosInstance.get(`/fees/pending?${params}`);
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async (studentId: string) => {
    try {
      const response = await axiosInstance.get(`/fees/student/${studentId}`);
      setPaymentHistory(response.data.payments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment history');
    }
  };

  const fetchExtensionHistory = async (studentId: string) => {
    try {
      const response = await axiosInstance.get(`/fees/extensions/${studentId}`);
      setExtensionHistory(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch extension history');
    }
  };

  const handleViewExtensionHistory = (student: Student) => {
    setSelectedStudent(student);
    fetchExtensionHistory(student._id);
    setIsExtensionHistoryModalOpen(true);
  };

  const resetForms = () => {
    setPaymentForm({
      amountPaid: '',
      paymentMethod: 'cash',
      transactionId: '',
      remarks: ''
    });
    setExtensionForm({
      newDueDate: '',
      reason: ''
    });
    setSelectedStudent(null);
  };
  const handleViewPaymentHistory = async (student: Student) => {
    try {
      setSelectedStudent(student);
      await fetchPaymentHistory(student._id);
      setIsPaymentHistoryModalOpen(true);
    } catch (error) {
      console.error('Error viewing payment history:', error);
    }
  };

  // handleExtension.ts
  const handleExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !user) return;

    try {
      await axiosInstance.post('/fees/extend-due-date', {
        studentId: selectedStudent._id,
        previousDueDate: selectedStudent.feeDetails.dueDate,
        newDueDate: extensionForm.newDueDate,
        reason: extensionForm.reason.trim(),
        remainingAmount: selectedStudent.feeDetails.totalFee - selectedStudent.feeDetails.paidFee,
        updatedBy: user // Ensure user._id exists
      });

      setSuccessMessage('Due date extended successfully');
      setIsExtensionModalOpen(false);
      fetchStudents();
      resetForms();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to extend due date');
    }
  };
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await axiosInstance.post('/fees/payment', {
        studentId: selectedStudent._id,
        ...paymentForm,
        amountPaid: parseFloat(paymentForm.amountPaid),
        processedBy: user // Ensure user._id exists

      });
      setSuccessMessage('Payment processed successfully');
      setIsPaymentModalOpen(false);
      fetchStudents();
      resetForms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
    }
  };
  const getDueStatus = (student: Student) => {
    const dueDate = new Date(student.feeDetails.dueDate);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue > 30) return 'bg-red-50';
    if (daysOverdue > 0) return 'bg-yellow-50';
    return '';
   };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fee Collection</h1>
          <p className="mt-1 text-sm text-gray-500">Manage student fee payments and due dates</p>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              value={filters.class}
              onChange={(e) => setFilters({...filters, class: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Class {i + 1}</option>
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
              {['A', 'B', 'C', 'D'].map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.dueStatus}
              onChange={(e) => setFilters({...filters, dueStatus: e.target.value as FilterOptions['dueStatus']})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Students</option>
              <option value="overdue">Overdue Fees</option>
              <option value="upcoming">Upcoming Due Dates</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id} className={getDueStatus(student)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class}-{student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{student.feeDetails.totalFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ₹{student.feeDetails.paidFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ₹{(student.feeDetails.totalFee - student.feeDetails.paidFee).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.feeDetails.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsPaymentModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Process Payment"
                      >
                        <Banknote className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewPaymentHistory(student)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Payment History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsExtensionModalOpen(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                        title="Extend Due Date"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">No students found</div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsPaymentModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Process Payment</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePayment} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      required
                      value={paymentForm.amountPaid}
                      onChange={(e) => setPaymentForm({...paymentForm, amountPaid: e.target.value})}
                      max={selectedStudent.feeDetails.totalFee - selectedStudent.feeDetails.paidFee}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      required
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="netbanking">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <input
                      type="text"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Process Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {isExtensionModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsExtensionModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Extend Due Date</h3>
                <button onClick={() => setIsExtensionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExtension} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Due Date</label>
                    <input
                      type="date"
                      required
                      value={extensionForm.newDueDate}
                      onChange={(e) => setExtensionForm({...extensionForm, newDueDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason for Extension</label>
                    <textarea
                      required
                      value={extensionForm.reason}
                      onChange={(e) => setExtensionForm({...extensionForm, reason: e.target.value})}
                      rows={4}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide a detailed reason for the due date extension..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsExtensionModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Extend Due Date
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {selectedStudent && (
        <PaymentHistoryModal
          isOpen={isPaymentHistoryModalOpen}
          onClose={() => setIsPaymentHistoryModalOpen(false)}
          payments={paymentHistory}
          studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
        />
      )}

      {/* Extension History Modal */}
      {selectedStudent && (
        <ExtensionHistoryModal
          isOpen={isExtensionHistoryModalOpen}
          onClose={() => setIsExtensionHistoryModalOpen(false)}
          extensions={extensionHistory}
          studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
        />
      )}
    </div>
  );
};

export default FeeCollectionPage;