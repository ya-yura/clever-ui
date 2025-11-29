// === 📁 src/contexts/AuthContext.tsx ===
// Authentication context and provider with OAuth2 support

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthState, User, LoginCredentials } from '@/types/auth';
import { api } from '@/services/api';
import { authService } from '@/services/authService';
import { useAnalytics } from '@/lib/analytics';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
  checkNoAuth: () => Promise<boolean>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'auth_state';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const analytics = useAnalytics();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Save auth state to localStorage
  const saveAuthState = useCallback((state: AuthState) => {
    try {
      if (state.isAuthenticated && state.user && state.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          user: state.user,
        }));
        authService.setToken(state.token);
        api.setToken(state.token);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        authService.clearTokens();
        api.clearToken();
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }, []);

  // Logout function (defined early for use in effects)
  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    saveAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    setIsDemo(false);
    localStorage.removeItem('demo_mode');
    console.log('✅ Logout successful');
  }, [saveAuthState]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Listen for unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('⚠️ Unauthorized event received - logging out');
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Check if no authentication is required
  const checkNoAuth = async (): Promise<boolean> => {
    const result = await authService.checkNoLogin();
    return !result.requiresAuth;
  };

  const loadAuthState = () => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = authService.getToken();

      if (storedAuth && storedToken) {
        const parsed = JSON.parse(storedAuth);
        
        // Validate that we have required data
        if (!parsed.user || !parsed.user.id) {
          console.warn('⚠️ Invalid auth data in storage, clearing');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          authService.clearTokens();
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (authService.isTokenExpired(storedToken)) {
          console.warn('⚠️ Token expired, attempting refresh');
          // Attempt to refresh token
          authService.refreshAccessToken().then((result) => {
            if (result.success && result.token) {
              setAuthState({
                isAuthenticated: true,
                user: parsed.user,
                token: result.token,
              });
              api.setToken(result.token);
              console.log('✅ Token refreshed on load');
            } else {
              console.warn('⚠️ Token refresh failed, clearing auth');
              logout();
            }
          });
          setIsLoading(false);
          return;
        }

        setAuthState({
          isAuthenticated: true,
          user: parsed.user,
          token: storedToken,
        });
        
        // Set token in API service
        api.setToken(storedToken);
        
        // Set user in analytics
        if (parsed.user?.id) {
          analytics.setUserId(parsed.user.id);
        }
        
        console.log('✅ Auth state restored:', parsed.user?.name);
      } else {
        console.log('ℹ️ No saved auth state found');
      }
    } catch (error) {
      console.error('❌ Error loading auth state:', error);
      // Clear potentially corrupted data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Validate credentials
      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Имя пользователя или пароль не могут быть пустыми',
        };
      }

      // Try OAuth2 authentication
      console.log('🔐 Attempting OAuth2 login for:', credentials.username);
      const response = await authService.login(credentials);

      if (response.success && response.token && response.user) {
        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: response.user,
          token: response.token,
        };

        setAuthState(newAuthState);
        saveAuthState(newAuthState);

        if (newAuthState.user?.id) {
          analytics.setUserId(newAuthState.user.id);
        }

        console.log('✅ Login successful (OAuth2):', newAuthState.user?.name);
        return { success: true };
      }

      // Return error from OAuth2
      return {
        success: false,
        error: response.error || 'Ошибка авторизации',
      };

    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      return {
        success: false,
        error: error.message || 'Ошибка подключения',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
    saveAuthState({
      ...authState,
      user,
    });
  };

  // Demo mode login
  const loginDemo = () => {
    const demoUser: User = {
      id: 'demo-user',
      name: 'Демо Пользователь',
      username: 'demo',
      role: 'worker',
    };

    setAuthState({
      isAuthenticated: true,
      user: demoUser,
      token: 'demo-token',
    });
    
    analytics.setUserId(demoUser.id);

    setIsDemo(true);
    localStorage.setItem('demo_mode', 'true');
    console.log('✅ Demo mode activated');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginDemo,
        logout,
        updateUser,
        isLoading,
        checkNoAuth,
        isDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

