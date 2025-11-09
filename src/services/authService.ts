// === 📁 src/services/authService.ts ===
// OAuth2 Authentication Service

import { configService } from './configService';

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

export interface LoginCredentials {
  username: string;
  password: string;
}

class AuthService {
  private readonly CLIENT_ID = 'ext_client';
  private readonly CLIENT_SECRET = 'ext_client_secret';
  private readonly SCOPE = 'all offline_access';
  private readonly STORAGE_KEY_AUTH = 'auth';
  private readonly STORAGE_KEY_REFRESH = 'refresh_token';

  /**
   * Check if system requires authentication
   * Returns 404 if no auth required, 200 if auth required
   */
  async checkNoLogin(): Promise<{ requiresAuth: boolean }> {
    const serverUrl = configService.getServerUrl();
    
    try {
      const response = await fetch(`${serverUrl}/.well-known/openid-configuration`);
      
      if (response.status === 404) {
        // No authentication required
        console.log('ℹ️ No authentication required (404 from openid-configuration)');
        return { requiresAuth: false };
      }
      
      // Authentication required
      console.log('ℹ️ Authentication required');
      return { requiresAuth: true };
    } catch (error) {
      // On error, assume authentication required
      console.warn('⚠️ Error checking auth config, assuming auth required:', error);
      return { requiresAuth: true };
    }
  }

  /**
   * Authenticate with username and password via OAuth2
   */
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: any;
    error?: string;
    errorCode?: number;
  }> {
    const serverUrl = configService.getServerUrl();
    
    try {
      console.log('🔐 OAuth2 login attempt:', credentials.username);

      const requestBody = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        scope: this.SCOPE,
        grant_type: 'password'
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
        
        if (response.status === 403) {
          return {
            success: false,
            error: 'Недостаточно прав',
            errorCode: 403
          };
        }

        return {
          success: false,
          error: errorData.error_description || 'Неверное имя пользователя или пароль',
          errorCode: response.status
        };
      }

      const data: OAuthTokenResponse = await response.json();

      // Validate JWT and extract role
      const jwtPayload = this.parseJwt(data.access_token);
      
      if (!jwtPayload) {
        return {
          success: false,
          error: 'Невалидный токен'
        };
      }

      // Validate role
      if (!this.isValidRole(jwtPayload.role)) {
        return {
          success: false,
          error: 'Недостаточно прав',
          errorCode: 403
        };
      }

      // Store tokens
      this.setToken(data.access_token);
      this.setRefreshToken(data.refresh_token);

      console.log('✅ OAuth2 login successful:', {
        user: jwtPayload.sub,
        role: jwtPayload.role
      });

      return {
        success: true,
        token: data.access_token,
        refreshToken: data.refresh_token,
        user: {
          id: jwtPayload.sub,
          name: credentials.username,
          username: credentials.username,
          role: jwtPayload.role.toLowerCase()
        }
      };
    } catch (error: any) {
      console.error('❌ OAuth2 login error:', error);
      return {
        success: false,
        error: error.message || 'Ошибка подключения к серверу'
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
      password: tempToken
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

    if (!refreshToken) {
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
      const jsonPayload = decodeURIComponent(
        atob(base64)
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


