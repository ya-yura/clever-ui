// === 📁 src/services/authService.ts ===
// OAuth2 Authentication Service

import { configService } from './configService';
import { LoginCredentials } from '@/types/auth';

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
  iss: string;
  aud: string;
  iat: number;
}

class AuthService {
  private readonly CLIENT_ID = 'ext_client';
  private readonly CLIENT_SECRET = 'ext_client_secret';
  private readonly SCOPE = 'all offline_access';
  private readonly STORAGE_KEY_AUTH = 'auth';
  private readonly STORAGE_KEY_REFRESH = 'refresh_token';

  /**
   * Check if system requires authentication (DEV MODE - always requires auth but accepts any)
   */
  async checkNoLogin(): Promise<{ requiresAuth: boolean }> {
    const serverUrl = configService.getServerUrl();
    if (!serverUrl) {
      return { requiresAuth: false };
    }

    try {
      const response = await fetch(`${serverUrl}/.well-known/openid-configuration`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.status === 404) {
        return { requiresAuth: false };
      }

      if (response.ok) {
        return { requiresAuth: true };
      }

      // Non-404 errors treated as auth required
      return { requiresAuth: true };
    } catch (error) {
      console.warn('⚠️ Failed to determine authentication requirement:', error);
      return { requiresAuth: true };
    }
  }

  /**
   * Authenticate with username and password
   */
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: any;
    error?: string;
    errorCode?: number;
  }> {
    const mode = credentials.mode || 'oauth';
    if (mode === 'demo') {
      return this.loginDemo(credentials);
    }
    return this.loginOAuth(credentials);
  }

  private async loginDemo(credentials: LoginCredentials) {
    console.log('🔐 [DEMO MODE] Login attempt:', credentials.username);

    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: 'Введите имя пользователя и пароль',
      };
    }

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: credentials.username,
        role: 'Administrator',
        exp: Math.floor(Date.now() / 1000) + 86400,
        iss: 'demo-mode',
        aud: 'warehouse-app',
        iat: Math.floor(Date.now() / 1000),
      })
    );
    const mockToken = `${header}.${payload}.demo-signature`;
    const mockRefreshToken = 'demo-refresh-token-' + Date.now();

    this.setToken(mockToken);
    this.setRefreshToken(mockRefreshToken);

    return {
      success: true,
      token: mockToken,
      refreshToken: mockRefreshToken,
      user: {
        id: credentials.username,
        name: credentials.username,
        username: credentials.username,
        role: 'Administrator',
      },
    };
  }

  private async loginOAuth(credentials: LoginCredentials) {
    const serverUrl = configService.getServerUrl();

    if (!serverUrl) {
      return {
        success: false,
        error: 'Сервер не настроен. Перейдите в раздел настройки.',
      };
    }

    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: 'Введите имя пользователя и пароль',
      };
    }

    try {
      const requestBody = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        scope: this.SCOPE,
        grant_type: 'password',
      });

      const response = await fetch(`${serverUrl}/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error_description || 'Неверное имя пользователя или пароль',
          errorCode: response.status,
        };
      }

      const data: OAuthTokenResponse = await response.json();
      const payload = this.parseJwt(data.access_token);

      if (!payload) {
        return {
          success: false,
          error: 'Не удалось обработать ответ сервера',
        };
      }

      if (!this.isValidRole(payload.role)) {
        return {
          success: false,
          error: 'Недостаточно прав для входа',
        };
      }

      this.setToken(data.access_token);
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }

      return {
        success: true,
        token: data.access_token,
        refreshToken: data.refresh_token,
        user: {
          id: payload.sub,
          name: payload.sub,
          username: payload.sub,
          role: payload.role,
        },
      };
    } catch (error: any) {
      console.error('❌ OAuth login error:', error);
      return {
        success: false,
        error: error.message || 'Ошибка подключения к серверу',
      };
    }
  }

  /**
   * Authenticate with temporary token (?tempuid=<token>)
   */
  async loginWithTempToken(tempToken: string): Promise<{
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: any;
    error?: string;
  }> {
    console.log('🔑 Temp token login attempt');

    // Use special username with temp token as password
    return this.login({
      username: '__tempuid__',
      password: tempToken,
      mode: 'oauth',
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    const serverUrl = configService.getServerUrl();
    const refreshToken = this.getRefreshToken();

    if (!refreshToken || refreshToken.startsWith('demo-refresh-token')) {
      return {
        success: false,
        error: 'No refresh token available'
      };
    }

    try {
      console.log('🔄 Refreshing access token');

      const requestBody = new URLSearchParams({
        scope: 'refresh_token offline_access',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET
      });

      const response = await fetch(`${serverUrl}/connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error_description || 'Failed to refresh token'
        };
      }

      const data: OAuthTokenResponse = await response.json();

      // Update stored tokens
      this.setToken(data.access_token);
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }

      console.log('✅ Token refreshed successfully');

      return {
        success: true,
        token: data.access_token
      };
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Failed to refresh token'
      };
    }
  }

  /**
   * Parse JWT token and extract payload
   */
  parseJwt(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ JWT parse error:', error);
      return null;
    }
  }

  /**
   * Check if JWT token is expired
   */
  isTokenExpired(token: string): boolean {
    if (token.endsWith('.demo-signature')) return false;
    
    const payload = this.parseJwt(token);
    if (!payload || !payload.exp) return true;

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Add 5 minute buffer
    return currentTime >= (expiryTime - 5 * 60 * 1000);
  }

  /**
   * Validate user role
   */
  private isValidRole(role: string): boolean {
    return role === 'Administrator' || role === 'User';
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY_AUTH);
  }

  /**
   * Set auth token in storage
   */
  setToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEY_AUTH, token);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY_REFRESH);
  }

  /**
   * Set refresh token in storage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEY_REFRESH, token);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.STORAGE_KEY_AUTH);
    localStorage.removeItem(this.STORAGE_KEY_REFRESH);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearTokens();
    console.log('✅ Logout successful');
  }
}

export const authService = new AuthService();











