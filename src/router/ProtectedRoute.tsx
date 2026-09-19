import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { adminAuthService } from '../services/adminAuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isEgaPath = location.pathname.startsWith('/ega') || location.pathname.startsWith('/admin');

  // Dedicated Admin Route Protection (/ega/*, /admin/*)
  if (isEgaPath) {
    const isEgaLogin = location.pathname === '/ega/login' || location.pathname === '/admin/login';
    if (!isEgaLogin) {
      const isSecureAdmin = adminAuthService.isAuthorizedAdmin();
      if (!isSecureAdmin) {
        return <Navigate to="/ega/login" state={{ from: location }} replace />;
      }
    }
    return <>{children}</>;
  }

  // Student / User Dashboard Routes
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions for user paths
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
