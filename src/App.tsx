import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { useAuth } from './context/authContext';

// Eager loaded components
import DashboardPage from './pages/dashboard';
import RawMaterialsPage from './pages/Inventory/rawMaterialsPage';
import SuppliersPage from './pages/Inventory/supplierPage';
import OrdersPage from './pages/Inventory/orderPage';
import StockPage from './pages/Inventory/stockPage';
import ProductManagementPage from './pages/Production/ProductManagementPage';
import ProductionManagementPage from './pages/Production/ProductionManagementPage';

// Login component
const Login = React.lazy(() => import('./pages/login'));

function App() {
  const { isAuthenticated, setupSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Setup session when authenticated
    if (isAuthenticated) {
      setupSession();
    }
  }, [isAuthenticated, setupSession]);

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Login />
            </Suspense>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Main authenticated routes
  return (
    <Routes>
      {/* Redirect root to dashboard for authenticated users */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Layout wrapper for authenticated routes */}
      <Route element={<Layout />}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Inventory routes */}
        <Route path="/inventory">
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="rawmaterials" element={<RawMaterialsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="stock" element={<StockPage />} />
        </Route>
        
        {/* Sales routes */}
        <Route path="/sales">
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="production" element={<ProductionManagementPage />} />
        </Route>
        
        {/* Catch all route for authenticated users */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
