import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/authContext';

const CreateFieldsOfStudy = () => {
  const { isSuperAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Today');
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    fetchFields();
  }, [searchTerm, selectedTimeframe]);

  const fetchFields = async () => {
    try {
      const response = await axiosInstance.get('/admin-main/fields-of-study');
      setFields(response.data.fields);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    setSelectedFields(e.target.checked ? fields.map(field => field._id) : []);
  };

  const toggleFieldSelection = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Fields</h1>
          <p className="text-gray-500">{fields.length} Total</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          ADD NEW FIELD
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search fields..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white rounded-md border">
           
          </div>
          <select className="border rounded-md px-3 py-2">
            <option>Sort by</option>
            <option>Name</option>
            <option>Date</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedFields.length === fields.length}
                  className="rounded"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Created Date</th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field._id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field._id)}
                    onChange={() => toggleFieldSelection(field._id)}
                    className="rounded"
                  />
                </td>
                <td className="p-4 text-gray-800">{field.name}</td>
                <td className="p-4 text-gray-600">
                  {new Date(field.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateFieldsOfStudy;