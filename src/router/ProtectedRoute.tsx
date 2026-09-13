import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isEgaPath = location.pathname.startsWith('/ega') || location.pathname.startsWith('/admin');

  if (!isAuthenticated || !user) {
    const loginRedirect = isEgaPath ? '/ega/login' : '/auth/login';
    return <Navigate to={loginRedirect} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (isEgaPath) {
      return <Navigate to="/ega/login" replace />;
    }
    const roleFallback =
      user.role === 'admin'
        ? '/ega'
        : user.role === 'teacher'
        ? '/teacher/dashboard'
        : '/dashboard';
    return <Navigate to={roleFallback} replace />;
  }

  return <>{children}</>;
};
