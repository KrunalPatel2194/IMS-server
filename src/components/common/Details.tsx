import React, { useState, useEffect } from 'react';

interface DetailsProps {
  title: string;
  fields: {
    name: boolean;
    email: boolean;
    status: boolean;
  };
  data: {
    name: string;
    email: string;
    status: string;
  };
  onUpdate: (data: any) => void;
  onCreate: (data: any) => Promise<void>;
  isCreating?: boolean;
  setIsCreating?: (value: boolean) => void;
}

const Details: React.FC<DetailsProps> = ({ 
  title, 
  data,
  fields, 
  onUpdate, 
  onCreate,
  isCreating = false,
  setIsCreating
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isCreating) {
      setFormData({
        name: data.name || '',
        email: data.email || '',
        status: data.status || 'Active'
      });
    }
  }, [data, isCreating]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isCreating) {
        await onCreate(formData);
        if (setIsCreating) setIsCreating(false);
      } else {
        await onUpdate(formData);
      }
      // Reset form if creating
      if (isCreating) {
        setFormData({
          name: '',
          email: '',
          status: 'Active'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">{title}</h2>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-600">
            Name :
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter name"
          />
        </div>
      { fields.email &&
        (<div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-600">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter email"
          />
        </div>)}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-600">
            Status :
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 px-4 py-2 bg-[#001e3d] text-white font-medium rounded-md hover:bg-[#003B5C] transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : isCreating ? 'Create' : 'Update'}
        </button>
      </div>
    </div>
  );
};

export default Details;