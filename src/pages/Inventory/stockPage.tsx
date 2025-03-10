import { useState, useEffect } from 'react';
import {  Eye, X, Scale } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Material {
  _id: string;
  name: string;
  unit: string;
  weightPerUnit?: number;
  weightUnit?: string;
}

interface StockHistory {
  quantity: number;
  weight?: number;
  weightUnit?: string;
  action: string;
  orderNumber: string;
  date: string;
}

interface Stock {
  _id: string;
  material: Material;
  quantity: number;
  totalWeight?: number;
  weightUnit?: string;
  lastUpdated: string;
  stockHistory: StockHistory[];
}

const StockPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [weightSummary, setWeightSummary] = useState<{ kg: number; liter: number; itemCount: number } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    materialId: ''
  });

  useEffect(() => {
    fetchStocks();
    fetchMaterials();
    fetchWeightSummary();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      const response = await axiosInstance.get('/inventory/raw-materials');
      setMaterials(response.data || []);
    } catch (err: any) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials. Please try again.');
    }
  };

  const fetchWeightSummary = async () => {
    try {
      const response = await axiosInstance.get('/inventory/stock/weight-summary');
      if (response.data) {
        setWeightSummary({
          kg: response.data.kg || 0,
          liter: response.data.liter || 0,
          itemCount: response.data.itemCount || 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching weight summary:', err);
      // Don't set error state here to avoid blocking the main UI
    }
  };

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.materialId) params.append('materialId', filters.materialId);

      const response = await axiosInstance.get(`/inventory/stock?${params.toString()}`);
      setStocks(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stock levels');
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Stock Levels</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor inventory stock levels</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {weightSummary && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Total Weight Summary (Piece Items)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-md shadow">
              <div className="text-sm text-gray-500">Total Weight (kg)</div>
              <div className="text-xl font-bold text-blue-600">
                {(weightSummary.kg || 0).toFixed(2)} kg
              </div>
            </div>
            <div className="bg-white p-3 rounded-md shadow">
              <div className="text-sm text-gray-500">Total Volume (liter)</div>
              <div className="text-xl font-bold text-blue-600">
                {(weightSummary.liter || 0).toFixed(2)} liter
              </div>
            </div>
            <div className="bg-white p-3 rounded-md shadow">
              <div className="text-sm text-gray-500">Piece Items Count</div>
              <div className="text-xl font-bold text-blue-600">
                {weightSummary.itemCount || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Material</label>
            <select
              value={filters.materialId}
              onChange={(e) => setFilters({...filters, materialId: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Materials</option>
              {materials.map(material => (
                <option key={material._id} value={material._id}>
                  {material.name || 'Unnamed material'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight/Volume</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stocks.map((stock) => (
                  <tr key={stock?._id || Math.random().toString()} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stock?.material?.name || 'Unknown material'}</div>
                      <div className="text-xs text-gray-500">{stock?.material?.unit || '-'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stock?.quantity || 0} {stock?.material?.unit || '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {stock?.material?.unit === 'piece' && stock?.totalWeight ? (
                        <div className="text-sm text-gray-900">
                          {stock.totalWeight.toFixed(2)} {stock?.weightUnit || '-'}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{stock?.lastUpdated ? formatDate(stock.lastUpdated) : '-'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedStock(stock);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!stocks || stocks.length === 0) && (
              <div className="text-center py-8 text-gray-500">No stock data found</div>
            )}
          </div>
        )}
      </div>

      {/* View Stock History Modal */}
      {isViewModalOpen && selectedStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsViewModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-2xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">Stock History - {selectedStock.material?.name || 'Unknown'}</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Current Stock Level</label>
                      <p className="text-gray-900 font-medium">
                        {selectedStock.quantity || 0} {selectedStock.material?.unit || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Last Updated</label>
                      <p className="text-gray-900">{selectedStock.lastUpdated ? formatDate(selectedStock.lastUpdated) : '-'}</p>
                    </div>
                  </div>
                  
                  {selectedStock.material?.unit === 'piece' && selectedStock.totalWeight && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <label className="text-sm font-medium text-blue-800">Weight Information</label>
                      <p className="text-blue-900">
                        Total Weight: {selectedStock.totalWeight.toFixed(2)} {selectedStock.weightUnit || '-'}
                      </p>
                      <p className="text-sm text-blue-700">
                        Weight Per Unit: {selectedStock.material.weightPerUnit || 0} {selectedStock.material.weightUnit || '-'}/piece
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-500">Stock History</label>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Order Number</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(selectedStock.stockHistory || []).map((history, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {history.date ? formatDate(history.date) : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {history.action ? (history.action.charAt(0).toUpperCase() + history.action.slice(1)) : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {history.quantity || 0} {selectedStock.material?.unit || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {history.weight ? (
                                  `${history.weight.toFixed(2)} ${history.weightUnit || '-'}`
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {history.orderNumber || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {(!selectedStock.stockHistory || selectedStock.stockHistory.length === 0) && (
                        <div className="text-center py-4 text-gray-500">No history available</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;