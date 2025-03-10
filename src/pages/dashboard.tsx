// pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Package, Clipboard, TrendingUp, AlertTriangle, Clock, BarChart2, ShoppingCart } from 'lucide-react';
import axiosInstance from '../utils/axios';

interface StockAlert {
  material: {
    _id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  threshold: number; // Minimum stock level
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalRecipes: number;
  totalRawMaterials: number;
  lowStockItems: number;
  materialsUsedToday: number;
  recentBatches: {
    planned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  recentOrders: {
    placed: number;
    recieved: number;
    cancelled: number;
  };
}

interface ProductionBatch {
  _id: string;
  batchNumber: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startDate?: string;
  completionDate?: string;
  createdAt: string;
  items: Array<{
    product: any;
    quantity: number;
  }>;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'placed' | 'recieved' | 'cancelled';
  createdAt: string;
  totalAmount: number;
}

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalRecipes: 0,
    totalRawMaterials: 0,
    lowStockItems: 0,
    materialsUsedToday: 0,
    recentBatches: {
      planned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    },
    recentOrders: {
      placed: 0,
      recieved: 0,
      cancelled: 0
    }
  });
  const [recentBatches, setRecentBatches] = useState<ProductionBatch[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<StockAlert[]>([]);
  const [error, setError] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchRecentBatches(),
      fetchRecentOrders(),
      fetchLowStockAlerts()
    ])
      .then(() => setIsLoading(false))
      .catch((err) => {
        console.error('Error loading dashboard data:', err,recentOrders);
        setError('Failed to load dashboard data. Please try again.');
        setIsLoading(false);
      });
  }, []);

  const fetchStats = async () => {
    try {
      // In a real implementation, you might have a dedicated API endpoint for dashboard stats
      // Here we'll simulate by fetching data from multiple endpoints
      
      // Get products count
      const productsResponse = await axiosInstance.get('/products/products');
      const activeProducts = productsResponse.data.filter((p: any) => p.isActive).length;
      
      // Get recipes count
      const recipesResponse = await axiosInstance.get('/production/recipes');
      
      // Get materials count
      const materialsResponse = await axiosInstance.get('/inventory/raw-materials');
      
      // Get stock data
      const stockResponse = await axiosInstance.get('/inventory/stock');
      // Simulate low stock items - in production you'd have a threshold for each material
      const lowStock = stockResponse.data.filter((item: any) => 
        item.quantity < 10 // Example threshold
      ).length;
      
      // Get today's batches
      const today = new Date().toISOString().split('T')[0];
      const todayBatchesResponse = await axiosInstance.get(`/production/batches?startDate=${today}&endDate=${today}`);
      const materialsUsedToday = todayBatchesResponse.data
        .filter((batch: any) => batch.status === 'completed')
        .reduce((total: number, batch: any) => total + batch.materialsUsed.length, 0);
      
      // Count batches by status
      const allBatchesResponse = await axiosInstance.get('/production/batches?limit=100');
      const batchesByStatus = {
        planned: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
      };
      
      allBatchesResponse.data.forEach((batch: any) => {
        if (batch.status === 'planned') batchesByStatus.planned++;
        else if (batch.status === 'in-progress') batchesByStatus.inProgress++;
        else if (batch.status === 'completed') batchesByStatus.completed++;
        else if (batch.status === 'cancelled') batchesByStatus.cancelled++;
      });
      
      // Count orders by status
      const ordersResponse = await axiosInstance.get('/inventory/orders');
      const ordersByStatus = {
        placed: 0,
        recieved: 0,
        cancelled: 0
      };
      
      ordersResponse.data.forEach((order: any) => {
        if (order.status === 'placed') ordersByStatus.placed++;
        else if (order.status === 'recieved') ordersByStatus.recieved++;
        else if (order.status === 'cancelled') ordersByStatus.cancelled++;
      });
      
      setStats({
        totalProducts: productsResponse.data.length,
        activeProducts,
        totalRecipes: recipesResponse.data.length,
        totalRawMaterials: materialsResponse.data.length,
        lowStockItems: lowStock,
        materialsUsedToday,
        recentBatches: batchesByStatus,
        recentOrders: ordersByStatus
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      throw err;
    }
  };

  const fetchRecentBatches = async () => {
    try {
      const response = await axiosInstance.get('/production/batches?limit=5');
      setRecentBatches(response.data);
    } catch (err) {
      console.error('Error fetching recent batches:', err);
      throw err;
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await axiosInstance.get('/inventory/orders?limit=5');
      setRecentOrders(response.data);
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      throw err;
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await axiosInstance.get('/inventory/stock');
      
      // Simulate low stock threshold check
      // In production, you'd probably have thresholds stored in the database
      const alerts = response.data
        .filter((item: any) => {
          const threshold = 10; // Example threshold
          return item.quantity < threshold;
        })
        .map((item: any) => ({
          material: item.material,
          quantity: item.quantity,
          threshold: 10 // Example threshold
        }));
      
      setLowStockAlerts(alerts);
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
      throw err;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'placed':
        return 'bg-purple-100 text-purple-800';
      case 'recieved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.activeProducts} active products</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Clipboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Production Recipes</p>
              <p className="text-xl font-semibold">{stats.totalRecipes}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.recentBatches.completed} batches completed</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Raw Materials</p>
              <p className="text-xl font-semibold">{stats.totalRawMaterials}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.materialsUsedToday} materials used today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className="text-xl font-semibold">{stats.lowStockItems}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.recentOrders.placed} orders pending</p>
        </div>
      </div>

      {/* Production Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Production Status</h2>
            <div className="p-2 rounded-full bg-blue-50">
              <BarChart2 className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 font-medium">Planned</p>
                <p className="text-2xl font-bold text-blue-900">{stats.recentBatches.planned}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-yellow-800 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.recentBatches.inProgress}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.recentBatches.completed}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.recentBatches.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Order Status</h2>
            <div className="p-2 rounded-full bg-purple-50">
              <ShoppingCart className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-purple-800 font-medium">Placed</p>
                <p className="text-2xl font-bold text-purple-900">{stats.recentOrders.placed}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 font-medium">Received</p>
                <p className="text-2xl font-bold text-green-900">{stats.recentOrders.recieved}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.recentOrders.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Production Batches</h2>
            <div className="p-2 rounded-full bg-green-50">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="p-2">
            {recentBatches.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentBatches.map((batch) => (
                  <div key={batch._id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{batch.batchNumber}</div>
                        <div className="text-sm text-gray-500">{formatDate(batch.createdAt)}</div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(batch.status)}`}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No recent batches found</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h2>
            <div className="p-2 rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="p-2">
            {lowStockAlerts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {lowStockAlerts.map((alert) => (
                  <div key={alert.material._id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{alert.material.name}</div>
                      <div className="text-red-600 font-medium">
                        {alert.quantity} / {alert.threshold} {alert.material.unit}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (alert.quantity / alert.threshold) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No low stock alerts</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;