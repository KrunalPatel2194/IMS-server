import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireSuperAdmin = false }) => {
  const auth = useAuth();
  
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && auth.user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!['admin', 'superadmin'].includes(auth.user.role || '')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;