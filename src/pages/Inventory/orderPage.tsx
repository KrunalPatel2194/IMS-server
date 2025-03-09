import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, Pencil, Eye, X, PackageCheck, Package } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface Material {
  _id: string;
  name: string;
  unit: string;
  weightPerUnit?: number;
  weightUnit?: string;
}

interface OrderItem {
  material: Material;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  boxQuantity?: number;
  boxPrice?: number;
  isPricePerBox?: boolean;
  unitsPerBox?: number;
  totalBoxes?: number;
  totalWeight?: number;
  weightUnit?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'placed' | 'recieved' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const [orderItems, setOrderItems] = useState<{
    material: string;
    quantity: string;
    unitPrice: string;
    unitsPerBox: string;
    boxPrice: string;
    isPricePerBox: boolean;
    orderByBox: boolean;
    boxQuantity: string;
  }[]>([{ 
    material: '', 
    quantity: '', 
    unitPrice: '', 
    unitsPerBox: '10',
    boxPrice: '',
    isPricePerBox: false,
    orderByBox: false,
    boxQuantity: '1'
  }]);

  useEffect(() => {
    fetchOrders();
    fetchMaterials();
  }, [dateRange]);

  const fetchMaterials = async () => {
    try {
      const response = await axiosInstance.get('/inventory/raw-materials');
      if (response.data) {
        setMaterials(response.data);
      } else {
        setMaterials([]);
      }
    } catch (err: any) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials. Please try again.');
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axiosInstance.get(`/inventory/orders?${params.toString()}`);
      if (response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { 
      material: '', 
      quantity: '', 
      unitPrice: '',
      unitsPerBox: '10',
      boxPrice: '',
      isPricePerBox: false,
      orderByBox: false,
      boxQuantity: '1'
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | boolean) => {
    try {
      const newItems = [...orderItems];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate derived values based on mode (box vs unit)
      const item = newItems[index];
      const unitsPerBox = parseFloat(item.unitsPerBox) || 1;
      
      // If switching between ordering by box vs units
      if (field === 'orderByBox') {
        const orderByBox = value as boolean;
        
        if (orderByBox) {
          // Switching to box mode - we need to make sure boxQuantity is set
          if (!item.boxQuantity || item.boxQuantity === '0') {
            item.boxQuantity = '1';
          }
          
          // If we have units, calculate how many boxes that would be
          if (item.quantity) {
            const units = parseFloat(item.quantity);
            item.boxQuantity = Math.ceil(units / unitsPerBox).toString();
          }
          
          // If we already have units and unit price, calculate box price
          if (item.unitPrice && item.unitsPerBox) {
            const unitPrice = parseFloat(item.unitPrice);
            item.boxPrice = (unitPrice * unitsPerBox).toString();
          }
        } else {
          // Switching to unit mode - calculate quantity from boxQuantity
          if (item.boxQuantity && item.unitsPerBox) {
            const boxes = parseFloat(item.boxQuantity);
            item.quantity = (boxes * unitsPerBox).toString();
          }
        }
      }
      
      // If price per box is toggled
      if (field === 'isPricePerBox') {
        const isPricePerBox = value as boolean;
        
        if (isPricePerBox) {
          // Calculate box price from unit price if possible
          if (item.unitPrice && item.unitsPerBox) {
            const unitPrice = parseFloat(item.unitPrice);
            item.boxPrice = (unitPrice * unitsPerBox).toString();
          }
        } else {
          // Calculate unit price from box price if possible
          if (item.boxPrice && item.unitsPerBox) {
            const boxPrice = parseFloat(item.boxPrice);
            item.unitPrice = (boxPrice / unitsPerBox).toString();
          }
        }
      }
      
      // If units per box changes, update dependent calculations
      if (field === 'unitsPerBox') {
        const newUnitsPerBox = parseFloat(value as string) || 1;
        
        // Update box price based on unit price
        if (item.unitPrice) {
          const unitPrice = parseFloat(item.unitPrice);
          item.boxPrice = (unitPrice * newUnitsPerBox).toString();
        }
        
        // If ordering by box, update quantity
        if (item.orderByBox && item.boxQuantity) {
          const boxes = parseFloat(item.boxQuantity);
          item.quantity = (boxes * newUnitsPerBox).toString();
        }
      }
      
      // If box quantity changes and we're ordering by box
      if (field === 'boxQuantity' && item.orderByBox) {
        const newBoxes = parseFloat(value as string) || 0;
        const unitsPerBox = parseFloat(item.unitsPerBox) || 1;
        
        // Update total quantity
        item.quantity = (newBoxes * unitsPerBox).toString();
      }
      
      // If quantity changes and we're ordering by unit
      if (field === 'quantity' && !item.orderByBox) {
        // No need to do anything special here
      }
      
      // If box price changes, update unit price
      if (field === 'boxPrice' && item.isPricePerBox) {
        const boxPrice = parseFloat(value as string) || 0;
        const unitsPerBox = parseFloat(item.unitsPerBox) || 1;
        
        if (unitsPerBox > 0) {
          item.unitPrice = (boxPrice / unitsPerBox).toString();
        }
      }
      
      // If unit price changes, update box price
      if (field === 'unitPrice' && !item.isPricePerBox) {
        const unitPrice = parseFloat(value as string) || 0;
        const unitsPerBox = parseFloat(item.unitsPerBox) || 1;
        
        item.boxPrice = (unitPrice * unitsPerBox).toString();
      }
      
      setOrderItems(newItems);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const calculateItemTotal = (item: typeof orderItems[0]) => {
    if (!item.quantity || !item.unitPrice) return 0;
    
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    
    return quantity * unitPrice;
  };

  const calculateTotal = () => {
    try {
      return orderItems.reduce((sum, item) => {
        return sum + calculateItemTotal(item);
      }, 0);
    } catch (error) {
      console.error('Error calculating total:', error);
      return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const items = orderItems.map(item => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const unitsPerBox = parseFloat(item.unitsPerBox) || 1;
        const boxPrice = parseFloat(item.boxPrice) || (unitPrice * unitsPerBox);
        
        // Calculate how many full boxes and remaining units
        const totalBoxes = Math.floor(quantity / unitsPerBox);
        
        // Prepare order item data
        const orderItem: any = {
          material: item.material,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: quantity * unitPrice,
          unitsPerBox: unitsPerBox,
          isPricePerBox: item.isPricePerBox
        };
        
        // Add box information
        orderItem.boxPrice = boxPrice;
        orderItem.totalBoxes = totalBoxes;
        
        // If ordering by box, include that info
        if (item.orderByBox) {
          orderItem.orderedByBox = true;
          orderItem.boxQuantity = parseFloat(item.boxQuantity) || 0;
        }
        
        return orderItem;
      });

      const response = await axiosInstance.post('/inventory/orders', {
        items,
        createdBy: 'admin' // Replace with actual user
      });

      setIsModalOpen(false);
      resetForm();
      showSuccessMessage('Order created successfully');
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await axiosInstance.put(`/inventory/orders/${orderId}/status`, { status });
      showSuccessMessage('Order status updated successfully');
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const resetForm = () => {
    setOrderItems([{ 
      material: '', 
      quantity: '', 
      unitPrice: '',
      unitsPerBox: '10',
      boxPrice: '',
      isPricePerBox: false,
      orderByBox: false,
      boxQuantity: '1'
    }]);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage inventory orders</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Order
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order?._id || Math.random().toString()} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order?.orderNumber || 'N/A'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{order?.createdAt ? formatDate(order.createdAt) : 'N/A'}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{order?.items?.length || 0} items</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{order?.totalAmount?.toFixed(2) || '0.00'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <select
                        value={order?.status || 'placed'}
                        onChange={(e) => handleStatusUpdate(order?._id || '', e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 font-medium ${
                          order?.status === 'recieved'
                            ? 'bg-green-100 text-green-800'
                            : order?.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="placed">Placed</option>
                        <option value="recieved">Recieved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
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

            {(!orders || orders.length === 0) && (
              <div className="text-center py-8 text-gray-500">No orders found</div>
            )}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-4xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">Create New Order</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-6">
                  {orderItems.map((item, index) => (
                    <div key={index} className="border rounded-md p-4 bg-gray-50">
                      <div className="flex gap-4 items-start mb-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Material</label>
                          <select
                            value={item.material}
                            onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Material</option>
                            {materials.map(material => (
                              <option key={material._id} value={material._id}>
                                {material.name || 'Unnamed material'} ({material.unit || 'unknown'})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="pt-7">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={orderItems.length === 1}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Toggle between ordering by unit or box */}
                      <div className="mb-4 flex items-center space-x-2">
                        <span className="text-sm font-medium">Order by: </span>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'orderByBox', false)}
                            className={`px-3 py-1.5 text-sm ${!item.orderByBox 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-700'}`}
                          >
                            <Package className="inline-block w-4 h-4 mr-1" />
                            Units
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemChange(index, 'orderByBox', true)}
                            className={`px-3 py-1.5 text-sm ${item.orderByBox 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-700'}`}
                          >
                            <PackageCheck className="inline-block w-4 h-4 mr-1" />
                            Boxes
                          </button>
                        </div>
                      </div>

                      {/* Box Configuration */}
                      <div className="mb-4 bg-blue-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-blue-800 mb-2">Box Configuration</div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">Units Per Box</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.unitsPerBox}
                              onChange={(e) => handleItemChange(index, 'unitsPerBox', e.target.value)}
                              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          
                          <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                              <input
                                type="checkbox"
                                checked={item.isPricePerBox}
                                onChange={(e) => handleItemChange(index, 'isPricePerBox', e.target.checked)}
                                className="mr-1"
                              />
                              <span>Price per box</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.boxPrice}
                              onChange={(e) => handleItemChange(index, 'boxPrice', e.target.value)}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                item.isPricePerBox ? 'bg-white' : 'bg-gray-100'
                              }`}
                              disabled={!item.isPricePerBox}
                              placeholder="Box Price"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Order Details - Different UI based on ordering mode */}
                      {item.orderByBox ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Number of Boxes</label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.boxQuantity}
                              onChange={(e) => handleItemChange(index, 'boxQuantity', e.target.value)}
                              className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <div className="mt-2 text-xs text-gray-500">
                              Total Units: {((parseFloat(item.boxQuantity) || 0) * (parseFloat(item.unitsPerBox) || 0)).toFixed(0)}
                            </div>
                          </div>
                          <div className="bg-indigo-50 p-3 rounded-md flex items-center">
                            <div className="text-sm w-full">
                              <div className="font-medium text-indigo-900">Box Order Summary</div>
                              <div className="mt-1 text-indigo-800">
                                {parseFloat(item.boxQuantity) || 0} boxes × {parseFloat(item.unitsPerBox) || 0} units per box
                              </div>
                              <div className="mt-1 flex justify-between items-center">
                                <span className="text-indigo-800">Price per box:</span>
                                <span className="font-medium">₹{parseFloat(item.boxPrice) || 0}</span>
                              </div>
                              <div className="mt-1 flex justify-between items-center">
                                <span className="text-indigo-800">Price per unit:</span>
                                <span className="font-medium">₹{parseFloat(item.unitPrice) || 0}</span>
                              </div>
                              <div className="mt-2 flex justify-between items-center border-t border-indigo-200 pt-2 text-indigo-900 font-medium">
                                <span>Total:</span>
                                <span>₹{calculateItemTotal(item).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Quantity (Units)</label>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                  className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Unit Price (₹)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                  className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {Math.ceil((parseFloat(item.quantity) || 0) / (parseFloat(item.unitsPerBox) || 1))} full boxes needed
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-md flex items-center">
                            <div className="text-sm w-full">
                              <div className="font-medium text-green-900">Unit Order Summary</div>
                              <div className="mt-1 text-green-800">
                                {parseFloat(item.quantity) || 0} units at ₹{parseFloat(item.unitPrice) || 0} per unit
                              </div>
                              <div className="mt-1 flex justify-between items-center">
                                <span className="text-green-800">Box equivalent:</span>
                                <span className="font-medium">
                                  {Math.ceil((parseFloat(item.quantity) || 0) / (parseFloat(item.unitsPerBox) || 1))} boxes
                                </span>
                              </div>
                              <div className="mt-2 flex justify-between items-center border-t border-green-200 pt-2 text-green-900 font-medium">
                                <span>Total:</span>
                                <span>₹{calculateItemTotal(item).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between items-center">
                  <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Another Item
                    </button>
                    <div className="text-lg font-medium">
                      Total: ₹{calculateTotal().toFixed(2)}
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
                    {isLoading ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsViewModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-2xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg text-gray-800">Order Details</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Order Number</label>
                    <p className="text-gray-900 font-medium">{selectedOrder?.orderNumber || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Date</label>
                    <p className="text-gray-900">{selectedOrder?.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      selectedOrder?.status === 'recieved'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder?.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder?.status ? (selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)) : 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Items</label>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit/Box</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(selectedOrder?.items || []).map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item?.material?.name || 'Unknown material'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item?.quantity || 0} {item?.material?.unit || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item?.unitsPerBox ? (
                                  <>{item.unitsPerBox} per box</>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item?.isPricePerBox ? (
                                  <>
                                    ₹{(item?.boxPrice || 0).toFixed(2)}/box
                                    <span className="text-xs text-gray-500 block">
                                      (₹{(item?.unitPrice || 0).toFixed(2)}/unit)
                                    </span>
                                  </>
                                ) : (
                                  <>₹{(item?.unitPrice || 0).toFixed(2)}/unit</>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">₹{(item?.totalPrice || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                        <div className="text-center py-4 text-gray-500">No items in this order</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-lg font-medium">
                    Total Amount: ₹{(selectedOrder?.totalAmount || 0).toFixed(2)}
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

export default OrdersPage;