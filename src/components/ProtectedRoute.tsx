// === 📁 src/components/ProtectedRoute.tsx ===
// Protected route wrapper for authenticated routes

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token, loginDemo } = useAuth();
  const isConfigured = configService.isConfigured();
  const location = useLocation();

  // Log protection check
  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', {
      path: location.pathname,
      isConfigured,
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      isLoading,
    });

    // Auto-login if configured but not authenticated (replacing Login screen)
    if (isConfigured && !isLoading && (!isAuthenticated || !user)) {
      console.log('🔄 Auto-logging in as default user...');
      loginDemo();
    }
  }, [location.pathname, isConfigured, isAuthenticated, user, token, isLoading, loginDemo]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#343436] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-[#a7a7a7]">Проверка авторизации...</p>
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
    // Show loading while auto-login kicks in
    return (
      <div className="min-h-screen bg-[#343436] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-[#a7a7a7]">Вход в систему...</p>
        </div>
      </div>
    );
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

