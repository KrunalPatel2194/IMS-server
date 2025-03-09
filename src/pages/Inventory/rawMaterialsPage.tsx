import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Pencil, Trash2, X } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
}

interface RawMaterial {
  _id: string;
  name: string;
  unit: 'kg' | 'liter' | 'piece' | 'meter';
  weightPerUnit?: number;
  weightUnit?: 'kg' | 'liter';
  supplier?: Supplier;
  createdBy: string;
  createdAt: string;
}

const RawMaterialsPage = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    searchTerm: '',
    supplier: '',
    unit: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    weightPerUnit: '',
    weightUnit: 'kg',
    supplier: '',
    createdBy: 'admin' // You might want to get this from your auth context
  });

  const itemsPerPage = 10;
  const units = ['kg', 'liter', 'piece', 'meter'];
  const weightUnits = ['kg', 'liter'];

  useEffect(() => {
    fetchMaterials();
  }, [filters]); // Re-fetch when filters change

  useEffect(() => {
    fetchSuppliers();
  }, []); // Fetch suppliers only once on component mount

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get('/inventory/suppliers');
      setSuppliers(response.data);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      let url = '/inventory/raw-materials';
      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.searchTerm) {
        queryParams.append('name', filters.searchTerm);
      }
      if (filters.supplier) {
        queryParams.append('supplier', filters.supplier);
      }
      if (filters.unit) {
        queryParams.append('unit', filters.unit);
      }

      // Append query params to URL if any exist
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await axiosInstance.get(url);
      setMaterials(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const dataToSubmit: any = {
        name: formData.name,
        unit: formData.unit,
        supplier: formData.supplier || undefined, // Only include supplier if it's not empty
        createdBy: formData.createdBy
      };

      // Only include weight-related fields if unit is piece
      if (formData.unit === 'piece') {
        dataToSubmit.weightPerUnit = parseFloat(formData.weightPerUnit);
        dataToSubmit.weightUnit = formData.weightUnit;
      }

      if (isEditMode && currentMaterial) {
        await axiosInstance.put(`/inventory/raw-materials/${currentMaterial._id}`, dataToSubmit);
        showSuccessMessage('Material updated successfully');
      } else {
        await axiosInstance.post('/inventory/raw-materials', dataToSubmit);
        showSuccessMessage('Material created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await axiosInstance.delete(`/inventory/raw-materials/${materialId}`);
      showSuccessMessage('Material deleted successfully');
      fetchMaterials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleEdit = (material: RawMaterial) => {
    setCurrentMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      weightPerUnit: material.weightPerUnit?.toString() || '',
      weightUnit: material.weightUnit || 'kg',
      supplier: material.supplier?._id || '',
      createdBy: material.createdBy
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      weightPerUnit: '',
      weightUnit: 'kg',
      supplier: '',
      createdBy: 'admin' // Reset to default createdBy
    });
    setCurrentMaterial(null);
    setIsEditMode(false);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Filter materials based on search term locally (in addition to backend filtering)
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !filters.searchTerm || 
      material.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesUnit = !filters.unit || material.unit === filters.unit;
    const matchesSupplier = !filters.supplier || 
      material.supplier?._id === filters.supplier;
    
    return matchesSearch && matchesUnit && matchesSupplier;
  });

  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Raw Materials</h1>
          <p className="mt-1 text-sm text-gray-500">Manage raw materials inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Material
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={filters.unit}
              onChange={(e) => setFilters({...filters, unit: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Units</option>
              {units.map(unit => (
                <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filters.supplier}
              onChange={(e) => setFilters({...filters, supplier: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight Per Unit</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMaterials.map((material) => (
                  <tr key={material._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.unit}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {material.unit === 'piece' && material.weightPerUnit 
                          ? `${material.weightPerUnit} ${material.weightUnit}`
                          : '-'}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.supplier?.name || '-'}</div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.createdBy}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit material"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(material._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedMaterials.length === 0 && (
              <div className="text-center py-8 text-gray-500">No materials found</div>
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
            
            <div className="relative bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">
                  {isEditMode ? 'Edit Material' : 'Create New Material'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {formData.unit === 'piece' && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="text-sm font-medium text-blue-800 mb-2">Weight Per Unit</div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.weightPerUnit}
                            onChange={(e) => setFormData({...formData, weightPerUnit: e.target.value})}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required={formData.unit === 'piece'}
                          />
                        </div>
                        <div className="w-1/3">
                          <label className="block text-sm text-gray-600 mb-1">Unit</label>
                          <select
                            value={formData.weightUnit}
                            onChange={(e) => setFormData({...formData, weightUnit: e.target.value as 'kg' | 'liter'})}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {weightUnits.map(unit => (
                              <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Supplier</label>
                    <select
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                      ))}
                    </select>
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
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Material' : 'Create Material'}
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

export default RawMaterialsPage;