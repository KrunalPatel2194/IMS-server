// pages/ProductionManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter, ChevronDown, ChevronRight, Pencil, Trash2, X, Play, Check, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../utils/axios';

// Interfaces for data types
interface Material {
  _id: string;
  name: string;
  unit: string;
  weightPerUnit?: number;
  weightUnit?: string;
}

interface ProductItem {
  _id: string;
  name: string;
  category: string;
}

interface SubItem {
  _id: string;
  name: string;
}

interface ProductionItem {
  _id?: string;
  product: ProductItem | string;
  subItem?: SubItem | string;
  size: string;
  outputQuantity: number;
}

interface MaterialUsage {
  _id?: string;
  material: Material | string;
  quantity: number;
}

interface Recipe {
  _id: string;
  name: string;
  description?: string;
  outputItems: ProductionItem[];
  materials: MaterialUsage[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

interface ProductionBatch {
  _id: string;
  batchNumber: string;
  description?: string;
  items: ProductionItem[];
  materialsUsed: MaterialUsage[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  completedBy?: string;
  startDate?: string;
  completionDate?: string;
  createdAt: string;
}

const ProductionManagementPage = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<'recipes' | 'batches'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [expandedRecipes, setExpandedRecipes] = useState<{[key: string]: boolean}>({});
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isRecipeSelectModalOpen, setIsRecipeSelectModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recipeFilters, setRecipeFilters] = useState({
    name: '',
    isActive: 'true'
  });
  const [batchFilters, setBatchFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  // Form data state
  const [recipeFormData, setRecipeFormData] = useState({
    name: '',
    description: '',
    outputItems: [{ product: '', subItem: '', size: 'Medium', outputQuantity: 1 }],
    materials: [{ material: '', quantity: 0 }],
    notes: '',
    createdBy: 'admin',
    isActive: true
  });

  const [batchFormData, setBatchFormData] = useState({
    description: '',
    items: [{ product: '', subItem: '', size: 'Medium', quantity: 1 }],
    materialsUsed: [{ material: '', quantity: 0 }],
    status: 'planned',
    createdBy: 'admin',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [recipeScaleFormData, setRecipeScaleFormData] = useState({
    recipeId: '',
    scaleFactor: 1,
    startDate: new Date().toISOString().split('T')[0],
    createdBy: 'admin'
  });

  const sizeOptions = ['Small', 'Medium', 'Large'];
  const statusOptions = [
    { value: 'planned', label: 'Planned', color: 'bg-blue-100 text-blue-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchProducts();
    fetchMaterials();
  }, []);

  // Fetch recipes when recipe filters change
  useEffect(() => {
    if (activeTab === 'recipes') {
      fetchRecipes();
    }
  }, [recipeFilters, activeTab]);

  // Fetch batches when batch filters change
  useEffect(() => {
    if (activeTab === 'batches') {
      fetchBatches();
    }
  }, [batchFilters, activeTab]);

  // API calls
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products/products');
      setProducts(response.data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axiosInstance.get('/inventory/raw-materials');
      setMaterials(response.data || []);
    } catch (err: any) {
      console.error('Error fetching materials:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (recipeFilters.name) {
        params.append('name', recipeFilters.name);
      }
      
      if (recipeFilters.isActive) {
        params.append('isActive', recipeFilters.isActive);
      }

      const response = await axiosInstance.get(`/production/recipes?${params.toString()}`);
      setRecipes(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recipes');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (batchFilters.status) {
        params.append('status', batchFilters.status);
      }
      
      if (batchFilters.startDate && batchFilters.endDate) {
        params.append('startDate', batchFilters.startDate);
        params.append('endDate', batchFilters.endDate);
      }

      const response = await axiosInstance.get(`/production/batches?${params.toString()}`);
      setBatches(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batches');
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Form handlers
  // Fixed handleRecipeSubmit function in ProductionManagementPage.tsx

const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Debug: Log what we're sending
      console.log("Recipe form data before submission:", recipeFormData);
      
      // Filter out any empty material entries - ensure safe parsing
      const filteredMaterials = recipeFormData.materials.filter(
        m => m.material && parseFloat(String(m.quantity)) > 0
      );
      
      // Filter out any empty output item entries - ensure safe parsing
      const filteredOutputItems = recipeFormData.outputItems.filter(
        i => i.product && i.size && !isNaN(Number(i.outputQuantity)) && parseFloat(String(i.outputQuantity)) > 0
      );
      
      console.log("Filtered output items:", filteredOutputItems);
      
      if (filteredMaterials.length === 0) {
        setError('At least one material must be specified');
        setIsLoading(false);
        return;
      }
      
      if (filteredOutputItems.length === 0) {
        setError('At least one output item must be specified with valid product, size and quantity');
        setIsLoading(false);
        return;
      }
      
      // Format the data for sending - explicitly convert to proper types
      const outputItems = filteredOutputItems.map(item => ({
        product: item.product,
        subItem: item.subItem || undefined, // Convert empty string to undefined
        size: item.size,
        outputQuantity: parseFloat(String(item.outputQuantity))
      }));
      
      const materials = filteredMaterials.map(item => ({
        material: item.material,
        quantity: parseFloat(String(item.quantity))
      }));
      
      const dataToSubmit = {
        ...recipeFormData,
        materials: materials,
        outputItems: outputItems 
      };
      
      console.log("Final data being submitted:", dataToSubmit);
      
      if (isEditMode && selectedRecipe) {
        await axiosInstance.put(`/production/recipes/${selectedRecipe._id}`, dataToSubmit);
        showSuccessMessage('Recipe updated successfully');
      } else {
        await axiosInstance.post('/production/recipes', dataToSubmit);
        showSuccessMessage('Recipe created successfully');
      }
      
      setIsRecipeModalOpen(false);
      resetRecipeForm();
      fetchRecipes();
    } catch (err: any) {
      console.error("Recipe submission error:", err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to save recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Filter out any empty material entries
      const filteredMaterials = batchFormData.materialsUsed.filter(
        m => m.material && m.quantity > 0
      );
      
      // Filter out any empty item entries
    //   const filteredItems = batchFormData.items.filter(
    //     i => i.product && i.size && i.quantity > 0
    //   );
      
      if (filteredMaterials.length === 0) {
        setError('At least one material must be specified');
        setIsLoading(false);
        return;
      }
      
      if (filteredItems.length === 0) {
        setError('At least one item must be specified');
        setIsLoading(false);
        return;
      }
      
      const dataToSubmit = {
        ...batchFormData,
        materialsUsed: filteredMaterials,
        items: filteredItems
      };
      
      await axiosInstance.post('/production/batches', dataToSubmit);
      showSuccessMessage('Production batch created successfully');
      
      setIsBatchModalOpen(false);
      resetBatchForm();
      fetchBatches();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchFromRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      await axiosInstance.post('/production/batches/from-recipe', recipeScaleFormData);
      showSuccessMessage('Production batch created from recipe successfully');
      
      setIsRecipeSelectModalOpen(false);
      setActiveTab('batches');
      fetchBatches();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create batch from recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBatchStatus = async (batchId: string, status: string) => {
    try {
      const response = await axiosInstance.put(`/production/batches/${batchId}/status`, { 
        status,
        completedBy: 'admin' // Replace with actual user
      });
      showSuccessMessage(`Batch status updated to ${status}`);
      fetchBatches();
    } catch (err: any) {
      if (err.response?.data?.insufficientMaterials) {
        // Show detailed error with insufficient materials
        const materials = err.response.data.insufficientMaterials;
        setError(
          <div>
            <p className="font-medium mb-2">Insufficient materials in stock:</p>
            <ul className="list-disc pl-5 space-y-1">
              {materials.map((item: any, index: number) => (
                <li key={index}>
                  <span className="font-medium">{item.name}</span>: Need {item.required} {item.unit}, 
                  but only have {item.available} {item.unit} available
                </li>
              ))}
            </ul>
          </div>
        );
      } else {
        setError(err.response?.data?.message || 'Failed to update batch status');
      }
    }
  };
  
  

  const deleteRecipe = async (recipeId: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      await axiosInstance.delete(`/production/recipes/${recipeId}`);
      showSuccessMessage('Recipe deleted successfully');
      fetchRecipes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  const deleteBatch = async (batchId: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    
    try {
      await axiosInstance.delete(`/production/batches/${batchId}`);
      showSuccessMessage('Batch deleted successfully');
      fetchBatches();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  // Helper functions for forms
  const handleRecipeEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    // Map the recipe data to the form structure
    const mappedOutputItems = recipe.outputItems.map(item => ({
      product: typeof item.product === 'string' ? item.product : item.product._id,
      subItem: item.subItem ? (typeof item.subItem === 'string' ? item.subItem : item.subItem._id) : '',
      size: item.size,
      outputQuantity: item.outputQuantity
    }));
    
    const mappedMaterials = recipe.materials.map(material => ({
      material: typeof material.material === 'string' ? material.material : material.material._id,
      quantity: material.quantity
    }));
    
    const resetRecipeForm = () => {
        setRecipeFormData({
          name: '',
          description: '',
          outputItems: [{ product: '', subItem: '', size: 'Medium', outputQuantity: 1 }], // Changed from quantity to outputQuantity
          materials: [{ material: '', quantity: 0 }],
          notes: '',
          createdBy: 'admin',
          isActive: true
        });
        setSelectedRecipe(null);
        setIsEditMode(false);
      };
    
    setIsEditMode(true);
    setIsRecipeModalOpen(true);
  };

  const addOutputItem = () => {
    setRecipeFormData({
      ...recipeFormData,
      outputItems: [
        ...recipeFormData.outputItems,
        { product: '', subItem: '', size: 'Medium', outputQuantity: 1 }
      ]
    });
  };

  const removeOutputItem = (index: number) => {
    if (recipeFormData.outputItems.length === 1) return;
    
    setRecipeFormData({
      ...recipeFormData,
      outputItems: recipeFormData.outputItems.filter((_, i) => i !== index)
    });
  };

  const handleOutputItemChange = (index: number, field: string, value: string | number) => {
    const newOutputItems = [...recipeFormData.outputItems];
    
    // Convert empty string inputs to empty values to avoid NaN
    if (field === 'outputQuantity' && value === '') {
      newOutputItems[index] = { 
        ...newOutputItems[index], 
        [field]: '' 
      };
    } else {
      newOutputItems[index] = { 
        ...newOutputItems[index], 
        [field]: value 
      };
    }
    
    setRecipeFormData({
      ...recipeFormData,
      outputItems: newOutputItems
    });
  };

  const addMaterial = () => {
    setRecipeFormData({
      ...recipeFormData,
      materials: [
        ...recipeFormData.materials,
        { material: '', quantity: 0 }
      ]
    });
  };

  const removeMaterial = (index: number) => {
    if (recipeFormData.materials.length === 1) return;
    
    setRecipeFormData({
      ...recipeFormData,
      materials: recipeFormData.materials.filter((_, i) => i !== index)
    });
  };

  const handleMaterialChange = (index: number, field: string, value: string | number) => {
    const newMaterials = [...recipeFormData.materials];
    
    // Convert empty string inputs to empty values to avoid NaN
    if (field === 'quantity' && value === '') {
      newMaterials[index] = { 
        ...newMaterials[index], 
        [field]: '' 
      };
    } else {
      newMaterials[index] = { 
        ...newMaterials[index], 
        [field]: value 
      };
    }
    
    setRecipeFormData({
      ...recipeFormData,
      materials: newMaterials
    });
  };

  // Similar functions for batch form
  const addBatchItem = () => {
    setBatchFormData({
      ...batchFormData,
      items: [
        ...batchFormData.items,
        { product: '', subItem: '', size: 'Medium', quantity: 1 }
      ]
    });
  };

  const removeBatchItem = (index: number) => {
    if (batchFormData.items.length === 1) return;
    
    setBatchFormData({
      ...batchFormData,
      items: batchFormData.items.filter((_, i) => i !== index)
    });
  };

  const handleBatchItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...batchFormData.items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: value 
    };
    
    setBatchFormData({
      ...batchFormData,
      items: newItems
    });
  };

  const addBatchMaterial = () => {
    setBatchFormData({
      ...batchFormData,
      materialsUsed: [
        ...batchFormData.materialsUsed,
        { material: '', quantity: 0 }
      ]
    });
  };

  const removeBatchMaterial = (index: number) => {
    if (batchFormData.materialsUsed.length === 1) return;
    
    setBatchFormData({
      ...batchFormData,
      materialsUsed: batchFormData.materialsUsed.filter((_, i) => i !== index)
    });
  };

  const handleBatchMaterialChange = (index: number, field: string, value: string | number) => {
    const newMaterials = [...batchFormData.materialsUsed];
    newMaterials[index] = { 
      ...newMaterials[index], 
      [field]: value 
    };
    
    setBatchFormData({
      ...batchFormData,
      materialsUsed: newMaterials
    });
  };

  const resetRecipeForm = () => {
    setRecipeFormData({
      name: '',
      description: '',
      outputItems: [{ product: '', subItem: '', size: 'Medium', outputQuantity: 1 }],
      materials: [{ material: '', quantity: 0 }],
      notes: '',
      createdBy: 'admin',
      isActive: true
    });
    setSelectedRecipe(null);
    setIsEditMode(false);
  };

  const resetBatchForm = () => {
    setBatchFormData({
      description: '',
      items: [{ product: '', subItem: '', size: 'Medium', quantity: 1 }],
      materialsUsed: [{ material: '', quantity: 0 }],
      status: 'planned',
      createdBy: 'admin',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const toggleRecipeExpand = (recipeId: string) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  const openCreateBatchFromRecipe = (recipe: Recipe) => {
    setRecipeScaleFormData({
      ...recipeScaleFormData,
      recipeId: recipe._id
    });
    setSelectedRecipe(recipe);
    setIsRecipeSelectModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  // JSX for rendering
  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Production Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage production recipes and batches</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              resetRecipeForm();
              setIsRecipeModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </button>
          <button
            onClick={() => {
              resetBatchForm();
              setIsBatchModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Batch
          </button>
        </div>
      </div>

      {error && (
  <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
    <div className="text-sm">
      {typeof error === 'string' ? error : error}
    </div>
    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
  </div>
)}

      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md flex justify-between items-center">
          <span className="text-sm">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'recipes'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'batches'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('batches')}
          >
            Production Batches
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
        {activeTab === 'recipes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={recipeFilters.name}
                onChange={(e) => setRecipeFilters({...recipeFilters, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <select
                value={recipeFilters.isActive}
                onChange={(e) => setRecipeFilters({...recipeFilters, isActive: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Active Recipes</option>
                <option value="false">Inactive Recipes</option>
                <option value="">All Recipes</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <select
                value={batchFilters.status}
                onChange={(e) => setBatchFilters({...batchFilters, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <input
                type="date"
                placeholder="Start Date"
                value={batchFilters.startDate}
                onChange={(e) => setBatchFilters({...batchFilters, startDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <input
                type="date"
                placeholder="End Date"
                value={batchFilters.endDate}
                onChange={(e) => setBatchFilters({...batchFilters, endDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow">
        {isLoading && (activeTab === 'recipes' ? !recipes.length : !batches.length) ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          activeTab === 'recipes' ? (
            <div className="divide-y divide-gray-200">
              {recipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recipes found</div>
              ) : (
                recipes.map(recipe => (
                  <div key={recipe._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleRecipeExpand(recipe._id)}
                      >
                        {expandedRecipes[recipe._id] ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 mr-2" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 mr-2" />
                        )}
                        <div>
                          <div className="text-lg font-medium text-gray-900 flex items-center">
                            {recipe.name}
                            {!recipe.isActive && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {recipe.outputItems.length} output items • {recipe.materials.length} materials
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openCreateBatchFromRecipe(recipe)}
                          className="text-green-600 hover:text-green-800"
                          title="Create batch from recipe"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRecipeEdit(recipe)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit recipe"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete recipe"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {expandedRecipes[recipe._id] && (
                      <div className="mt-4 ml-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Output Items</h4>
                          <div className="space-y-2">
                            {recipe.outputItems.map((item, index) => (
                              <div 
                                key={index} 
                                className="bg-gray-50 p-3 rounded-md"
                              >
                                <div className="flex justify-between">
                                  <div>
                                    <span className="font-medium">
                                      {typeof item.product === 'string' 
                                        ? 'Unknown Product' 
                                        : item.product.name}
                                    </span>
                                    {item.subItem && (
                                      <span className="text-gray-600">
                                        {' - '}
                                        {typeof item.subItem === 'string'
                                          ? 'Unknown Sub-item'
                                          : item.subItem.name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm">
                                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {item.size}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Quantity: {item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Materials Used</h4>
                          <div className="space-y-2">
                            {recipe.materials.map((material, index) => (
                              <div 
                                key={index} 
                                className="bg-gray-50 p-3 rounded-md flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-medium">
                                    {typeof material.material === 'string' 
                                      ? 'Unknown Material' 
                                      : material.material.name}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {material.quantity} {typeof material.material === 'string' 
                                    ? '' 
                                    : material.material.unit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {recipe.notes && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                            <div className="bg-yellow-50 p-3 rounded-md text-sm">
                              {recipe.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {batches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No production batches found</div>
              ) : (
                batches.map(batch => (
                  <div key={batch._id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center">
                          <div className="text-lg font-medium text-gray-900 mr-2">
                            {batch.batchNumber}
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(batch.status)}`}>
                            {getStatusLabel(batch.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Created: {formatDate(batch.createdAt)}
                          {batch.status === 'in-progress' && ` • Started: ${formatDate(batch.startDate)}`}
                          {batch.status === 'completed' && ` • Completed: ${formatDate(batch.completionDate)}`}
                        </div>
                        {batch.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {batch.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {batch.status === 'planned' && (
                          <button
                            onClick={() => updateBatchStatus(batch._id, 'in-progress')}
                            className="py-1 px-3 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                            title="Start production"
                          >
                            Start
                          </button>
                        )}
                        
                        {batch.status === 'in-progress' && (
                          <button
                            onClick={() => updateBatchStatus(batch._id, 'completed')}
                            className="py-1 px-3 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                            title="Complete production"
                          >
                            Complete
                          </button>
                        )}
                        
                        {(batch.status === 'planned' || batch.status === 'in-progress') && (
                          <button
                            onClick={() => updateBatchStatus(batch._id, 'cancelled')}
                            className="py-1 px-3 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                            title="Cancel batch"
                          >
                            Cancel
                          </button>
                        )}
                        
                        {batch.status !== 'completed' && batch.status !== 'cancelled' && (
                          <button
                            onClick={() => deleteBatch(batch._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete batch"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Items Produced</h4>
                        <div className="space-y-2">
                          {batch.items.map((item, index) => (
                            <div 
                              key={index} 
                              className="bg-gray-50 p-3 rounded-md"
                            >
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-medium">
                                    {typeof item.product === 'string' 
                                      ? 'Unknown Product' 
                                      : item.product.name}
                                  </span>
                                  {item.subItem && (
                                    <span className="text-gray-600">
                                      {' - '}
                                      {typeof item.subItem === 'string'
                                        ? 'Unknown Sub-item'
                                        : item.subItem.name}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm">
                                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {item.size}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Quantity: {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Materials Used</h4>
                        <div className="space-y-2">
                          {batch.materialsUsed.map((material, index) => (
                            <div 
                              key={index} 
                              className="bg-gray-50 p-3 rounded-md flex justify-between items-center"
                            >
                              <div>
                                <span className="font-medium">
                                  {typeof material.material === 'string' 
                                    ? 'Unknown Material' 
                                    : material.material.name}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {material.quantity} {typeof material.material === 'string' 
                                  ? '' 
                                  : material.material.unit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        )}
      </div>

      {/* Recipe Modal */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsRecipeModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">
                  {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
                </h3>
                <button onClick={() => setIsRecipeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleRecipeSubmit} className="p-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Recipe Name</label>
                      <input
                        type="text"
                        value={recipeFormData.name}
                        onChange={(e) => setRecipeFormData({...recipeFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={recipeFormData.isActive}
                          onChange={(e) => setRecipeFormData({...recipeFormData, isActive: e.target.checked})}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          id="recipe-active"
                        />
                        <label htmlFor="recipe-active" className="ml-2 text-sm text-gray-600">
                          Active Recipe
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      value={recipeFormData.description}
                      onChange={(e) => setRecipeFormData({...recipeFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-600">Output Items</label>
                      <button
                        type="button"
                        onClick={addOutputItem}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {recipeFormData.outputItems.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Output Item #{index + 1}</h4>
                            {recipeFormData.outputItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOutputItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Product</label>
                              <select
                                value={item.product}
                                onChange={(e) => handleOutputItemChange(index, 'product', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                  <option key={product._id} value={product._id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Sub-Item (Optional)</label>
                              <select
                                value={item.subItem}
                                onChange={(e) => handleOutputItemChange(index, 'subItem', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Sub-Item</option>
                                {products.find(p => p._id === item.product)?.subItems?.map((subItem: any) => (
                                  <option key={subItem._id} value={subItem._id}>
                                    {subItem.name}
                                  </option>
                                )) || []}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Size</label>
                              <select
                                value={item.size}
                                onChange={(e) => handleOutputItemChange(index, 'size', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                {sizeOptions.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
      <input
        type="number"
        min="1"
        value={isNaN(item.outputQuantity) ? '' : item.outputQuantity}
        onChange={(e) => handleOutputItemChange(index, 'outputQuantity', 
          e.target.value === '' ? '' : parseInt(e.target.value))}
        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-600">Materials Required</label>
                      <button
                        type="button"
                        onClick={addMaterial}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Material
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {recipeFormData.materials.map((material, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Material #{index + 1}</h4>
                            {recipeFormData.materials.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMaterial(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Material</label>
                              <select
                                value={material.material}
                                onChange={(e) => handleMaterialChange(index, 'material', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="">Select Material</option>
                                {materials.map(mat => (
                                  <option key={mat._id} value={mat._id}>
                                    {mat.name} ({mat.unit})
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={isNaN(material.quantity) ? '' : material.quantity}
        onChange={(e) => handleMaterialChange(index, 'quantity', 
          e.target.value === '' ? '' : parseFloat(e.target.value))}
        className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Notes (Optional)</label>
                    <textarea
                      value={recipeFormData.notes}
                      onChange={(e) => setRecipeFormData({...recipeFormData, notes: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setIsRecipeModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Recipe' : 'Create Recipe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsBatchModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">Create New Production Batch</h3>
                <button onClick={() => setIsBatchModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleBatchSubmit} className="p-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={batchFormData.description}
                        onChange={(e) => setBatchFormData({...batchFormData, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={batchFormData.startDate}
                        onChange={(e) => setBatchFormData({...batchFormData, startDate: e.target.value})}
                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-600">Items to Produce</label>
                      <button
                        type="button"
                        onClick={addBatchItem}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {batchFormData.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Item #{index + 1}</h4>
                            {batchFormData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBatchItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Product</label>
                              <select
                                value={item.product}
                                onChange={(e) => handleBatchItemChange(index, 'product', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                  <option key={product._id} value={product._id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Sub-Item (Optional)</label>
                              <select
                                value={item.subItem}
                                onChange={(e) => handleBatchItemChange(index, 'subItem', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Sub-Item</option>
                                {products.find(p => p._id === item.product)?.subItems?.map((subItem: any) => (
                                  <option key={subItem._id} value={subItem._id}>
                                    {subItem.name}
                                  </option>
                                )) || []}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Size</label>
                              <select
                                value={item.size}
                                onChange={(e) => handleBatchItemChange(index, 'size', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                {sizeOptions.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleBatchItemChange(index, 'quantity', parseInt(e.target.value))}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-600">Materials Used</label>
                      <button
                        type="button"
                        onClick={addBatchMaterial}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Material
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {batchFormData.materialsUsed.map((material, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Material #{index + 1}</h4>
                            {batchFormData.materialsUsed.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBatchMaterial(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Material</label>
                              <select
                                value={material.material}
                                onChange={(e) => handleBatchMaterialChange(index, 'material', e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              >
                                <option value="">Select Material</option>
                                {materials.map(mat => (
                                  <option key={mat._id} value={mat._id}>
                                    {mat.name} ({mat.unit})
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={material.quantity}
                                onChange={(e) => handleBatchMaterialChange(index, 'quantity', parseFloat(e.target.value))}
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? 'Creating...' : 'Create Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Selection Modal for creating batch */}
      {isRecipeSelectModalOpen && selectedRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsRecipeSelectModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">Create Batch from Recipe</h3>
                <button onClick={() => setIsRecipeSelectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleBatchFromRecipe} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Selected Recipe</label>
                    <div className="px-3 py-2 border rounded bg-gray-50">
                      {selectedRecipe.name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Scale Factor</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={recipeScaleFormData.scaleFactor}
                      onChange={(e) => setRecipeScaleFormData({
                        ...recipeScaleFormData, 
                        scaleFactor: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Multiply all quantities by this value (e.g., 2 = double batch)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={recipeScaleFormData.startDate}
                      onChange={(e) => setRecipeScaleFormData({
                        ...recipeScaleFormData, 
                        startDate: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setIsRecipeSelectModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? 'Creating...' : 'Create Batch'}
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

export default ProductionManagementPage;