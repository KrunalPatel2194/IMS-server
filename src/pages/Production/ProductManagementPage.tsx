// pages/ProductManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, ChevronDown, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Size {
  _id?: string;
  name: string;
}

interface SubItem {
  _id?: string;
  name: string;
  description?: string;
  availableSizes: Size[];
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  subItems: SubItem[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

const ProductManagementPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<{[key: string]: boolean}>({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSubItemModalOpen, setIsSubItemModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<SubItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    isActive: 'true'
  });

  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
    createdBy: 'admin' // You might want to get this from your auth context
  });

  const [subItemFormData, setSubItemFormData] = useState({
    name: '',
    description: '',
    availableSizes: [
      { name: 'Small' },
      { name: 'Medium' },
      { name: 'Large' }
    ],
    isActive: true,
    createdBy: 'admin' // You might want to get this from your auth context
  });

  const categories = ['Puff Pastry', 'Bread', 'Cake', 'Cookie', 'Dessert', 'Other'];
  const sizeOptions = ['Small', 'Medium', 'Large'];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (filters.name) {
        params.append('name', filters.name);
      }
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      if (filters.isActive) {
        params.append('isActive', filters.isActive);
      }

      const response = await axiosInstance.get(`/products/products?${params.toString()}`);
      setProducts(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (isEditMode && selectedProduct) {
        await axiosInstance.put(`/products/products/${selectedProduct._id}`, productFormData);
        showSuccessMessage('Product updated successfully');
      } else {
        await axiosInstance.post('/products/products', productFormData);
        showSuccessMessage('Product created successfully');
      }
      
      setIsProductModalOpen(false);
      resetProductForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (isEditMode && selectedProduct && selectedSubItem?._id) {
        await axiosInstance.put(`/products/products/${selectedProduct._id}/subitems/${selectedSubItem._id}`, subItemFormData);
        showSuccessMessage('Sub-item updated successfully');
      } else if (selectedProduct) {
        await axiosInstance.post(`/products/products/${selectedProduct._id}/subitems`, subItemFormData);
        showSuccessMessage('Sub-item added successfully');
      }
      
      setIsSubItemModalOpen(false);
      resetSubItemForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save sub-item');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axiosInstance.delete(`/products/products/${productId}`);
      showSuccessMessage('Product deleted successfully');
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const deleteSubItem = async (productId: string, subItemId: string) => {
    if (!window.confirm('Are you sure you want to delete this sub-item?')) return;
    
    try {
      await axiosInstance.delete(`/products/products/${productId}/subitems/${subItemId}`);
      showSuccessMessage('Sub-item deleted successfully');
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete sub-item');
    }
  };

  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      isActive: product.isActive,
      createdBy: product.createdBy
    });
    setIsEditMode(true);
    setIsProductModalOpen(true);
  };

  const handleSubItemEdit = (product: Product, subItem: SubItem) => {
    setSelectedProduct(product);
    setSelectedSubItem(subItem);
    setSubItemFormData({
      name: subItem.name,
      description: subItem.description || '',
      availableSizes: subItem.availableSizes.length > 0 ? 
        subItem.availableSizes : 
        [{ name: 'Small' }, { name: 'Medium' }, { name: 'Large' }],
      isActive: subItem.isActive,
      createdBy: subItem.createdBy || 'admin'
    });
    setIsEditMode(true);
    setIsSubItemModalOpen(true);
  };

  const addSubItemToProduct = (product: Product) => {
    setSelectedProduct(product);
    resetSubItemForm();
    setIsEditMode(false);
    setIsSubItemModalOpen(true);
  };

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      description: '',
      category: '',
      isActive: true,
      createdBy: 'admin'
    });
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  const resetSubItemForm = () => {
    setSubItemFormData({
      name: '',
      description: '',
      availableSizes: [
        { name: 'Small' },
        { name: 'Medium' },
        { name: 'Large' }
      ],
      isActive: true,
      createdBy: 'admin'
    });
    setSelectedSubItem(null);
    setIsEditMode(false);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleSizeSelection = (sizeName: string) => {
    setSubItemFormData(prev => {
      // Check if size already exists
      const sizeExists = prev.availableSizes.some(size => size.name === sizeName);
      
      if (sizeExists) {
        // Remove size if it exists
        return {
          ...prev,
          availableSizes: prev.availableSizes.filter(size => size.name !== sizeName)
        };
      } else {
        // Add size if it doesn't exist
        return {
          ...prev,
          availableSizes: [...prev.availableSizes, { name: sizeName }]
        };
      }
    });
  };

  const isSizeSelected = (sizeName: string) => {
    return subItemFormData.availableSizes.some(size => size.name === sizeName);
  };

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your products and sub-items</p>
        </div>
        <button
          onClick={() => {
            resetProductForm();
            setIsProductModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Product
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
              placeholder="Search products..."
              value={filters.name}
              onChange={(e) => setFilters({...filters, name: e.target.value})}
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Active Products</option>
              <option value="false">Inactive Products</option>
              <option value="">All Products</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading && !products.length ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No products found</div>
            ) : (
              products.map(product => (
                <div key={product._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleProductExpand(product._id)}
                    >
                      {expandedProducts[product._id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 mr-2" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <div>
                        <div className="text-lg font-medium text-gray-900 flex items-center">
                          {product.name}
                          {!product.isActive && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category} • {product.subItems.length} Sub-items
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => addSubItemToProduct(product)}
                        className="text-green-600 hover:text-green-800"
                        title="Add sub-item"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleProductEdit(product)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit product"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedProducts[product._id] && product.subItems.length > 0 && (
                    <div className="mt-4 ml-7 border-l-2 border-gray-200 pl-4">
                      <div className="space-y-3">
                        {product.subItems.map(subItem => (
                          <div 
                            key={subItem._id} 
                            className="bg-gray-50 p-3 rounded-md flex justify-between items-start"
                          >
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{subItem.name}</span>
                                {!subItem.isActive && (
                                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              
                              {subItem.description && (
                                <p className="text-sm text-gray-500 mt-1">{subItem.description}</p>
                              )}
                              
                              <div className="mt-2 flex flex-wrap gap-1">
                                {subItem.availableSizes.map(size => (
                                  <span
                                    key={size._id || size.name}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {size.name}
                                  </span>
                                ))}
                                {subItem.availableSizes.length === 0 && (
                                  <span className="text-xs text-gray-500">No sizes specified</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSubItemEdit(product, subItem)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit sub-item"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteSubItem(product._id, subItem._id || '')}
                                className="text-red-600 hover:text-red-800"
                                title="Delete sub-item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {expandedProducts[product._id] && product.subItems.length === 0 && (
                    <div className="mt-4 ml-7 text-sm text-gray-500">
                      No sub-items found. Add some using the "+" button.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsProductModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">
                  {isEditMode ? 'Edit Product' : 'Create New Product'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productFormData.isActive}
                      onChange={(e) => setProductFormData({...productFormData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      id="product-active"
                    />
                    <label htmlFor="product-active" className="ml-2 text-sm text-gray-600">
                      Active Product
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Item Modal */}
      {isSubItemModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsSubItemModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">
                  {isEditMode ? 'Edit Sub-Item' : `Add Sub-Item to ${selectedProduct.name}`}
                </h3>
                <button onClick={() => setIsSubItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubItemSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={subItemFormData.name}
                      onChange={(e) => setSubItemFormData({...subItemFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      value={subItemFormData.description}
                      onChange={(e) => setSubItemFormData({...subItemFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Available Sizes</label>
                    <div className="mt-1 space-y-2">
                      {sizeOptions.map(size => (
                        <div key={size} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`size-${size}`}
                            checked={isSizeSelected(size)}
                            onChange={() => toggleSizeSelection(size)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`size-${size}`} className="ml-2 text-sm text-gray-600">
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={subItemFormData.isActive}
                      onChange={(e) => setSubItemFormData({...subItemFormData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      id="subitem-active"
                    />
                    <label htmlFor="subitem-active" className="ml-2 text-sm text-gray-600">
                      Active Sub-Item
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubItemModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Sub-Item' : 'Add Sub-Item'}
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

export default ProductManagementPage;