// === 📁 src/components/ProtectedRoute.tsx ===
// Protected route wrapper for authenticated routes

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const isConfigured = configService.isConfigured();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-content-secondary">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if not configured
  if (!isConfigured) {
    console.warn('⚠️ Not configured, redirecting to /setup');
    return <Navigate to="/setup" replace />;
  }

  // Allow access if authenticated (or while auto-login is happening, effectively)
  // We check isAuthenticated to prevent flickering, but since we call loginDemo in useEffect, 
  // we might need to show loading or just allow it to proceed if loginDemo is synchronous-ish or fast enough.
  // However, loginDemo updates state which triggers re-render.
  
  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

