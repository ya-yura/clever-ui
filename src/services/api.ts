// === 📁 src/services/api.ts ===
// API service for server communication

import axios, { AxiosInstance, AxiosError } from 'axios';
import { configService } from './configService';
import analytics, { EventType } from '@/lib/analytics';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    console.log('🔧 [API] Initializing ApiService...');
    
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Update baseURL dynamically
    this.updateBaseURL();
    
    console.log('🔧 [API] ApiService initialized with baseURL:', this.client.defaults.baseURL);

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with auto-refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log('🔄 401 Unauthorized - attempting token refresh');
            
            // Dynamic import to avoid circular dependency
            const { authService } = await import('./authService');
            const result = await authService.refreshAccessToken();

            if (result.success && result.token) {
              // Update token and retry request
              this.setToken(result.token);
              originalRequest.headers.Authorization = `Bearer ${result.token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
          }

          // If refresh failed, trigger logout
          console.warn('⚠️ Token refresh failed - clearing auth');
          this.clearToken();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Update baseURL from config
   * 
   * Senior approach: Multiple checks for dev environment
   * - Check hostname (most reliable)
   * - Check import.meta.env
   * - Check mode explicitly
   */
  updateBaseURL() {
    try {
      // 1. Explicit configuration from Setup screen (DOCS: API_SERVER_SETUP)
      if (configService.isConfigured()) {
        const configuredUrl = configService.getServerUrl();
        if (configuredUrl) {
          const sanitized = configuredUrl.replace(/\/$/, '');

          if (this.shouldUseDevProxy(sanitized)) {
            this.client.defaults.baseURL = '/MobileSMARTS/api/v1';
            console.log('✅ [API] baseURL via Vite proxy (local dev detected):', this.client.defaults.baseURL);
            return;
          }

          this.client.defaults.baseURL = sanitized;
          console.log('✅ [API] baseURL from config:', this.client.defaults.baseURL);
          return;
        }
      }

      // 2. Local development: use Vite proxy to avoid CORS
      const devBaseUrl = this.getDevProxyBaseUrl();
      if (devBaseUrl) {
        this.client.defaults.baseURL = devBaseUrl;
        console.log('✅ [API] Dev proxy baseURL:', this.client.defaults.baseURL);
        return;
      }

      // 3. Final safety fallback — direct connection to default Mobile SMARTS server
      this.client.defaults.baseURL = 'http://localhost:9000/MobileSMARTS/api/v1';
      console.warn('⚠️ [API] Using default Mobile SMARTS URL:', this.client.defaults.baseURL);
    } catch (error) {
      console.error('❌ [API] Failed to update baseURL:', error);
      this.client.defaults.baseURL = this.client.defaults.baseURL || 'http://localhost:9000/MobileSMARTS/api/v1';
    }
  }

  /**
   * Determine base URL for local dev server (Vite proxy)
   */
  private getDevProxyBaseUrl(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isLocalhost) {
      return null;
    }

    const devPorts = new Set(['3000', '3001', '3002', '3003', '5173', '5174', '5175']);
    if (devPorts.has(window.location.port || '')) {
      return '/MobileSMARTS/api/v1';
    }

    return null;
  }

  /**
   * Determine if we should route requests through Vite proxy even when config has absolute localhost URL.
   * This helps avoid CORS issues when the API server runs on a different port (e.g. 9000) while the dev server
   * runs on 5173/5175. In this case, we should hit /MobileSMARTS/... so that the proxy forwards the call.
   */
  private shouldUseDevProxy(configuredUrl: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const target = new URL(configuredUrl);
      const currentHost = window.location.hostname;
      const targetHost = target.hostname;
      const devPorts = new Set(['3000', '3001', '3002', '3003', '5173', '5174', '5175', '5176']);
      const isLocalCurrent = currentHost === 'localhost' || currentHost === '127.0.0.1';
      const isLocalTarget = targetHost === 'localhost' || targetHost === '127.0.0.1';
      const currentPort = window.location.port || '';
      const targetPort = target.port || (target.protocol === 'https:' ? '443' : '80');

      if (!isLocalCurrent || !isLocalTarget) {
        return false;
      }

      if (!devPorts.has(currentPort)) {
        return false;
      }

      // If ports differ (e.g., frontend 5173, backend 9000) — use proxy.
      return currentPort !== targetPort;
    } catch (error) {
      console.warn('⚠️ [API] Failed to parse configured URL, skipping proxy detection:', error);
      return false;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get current baseURL
   */
  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Require authentication before making request
   */
  private requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }
  }

  // Generic request methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const start = Date.now();
    try {
      this.updateBaseURL(); // Ensure baseURL is current
      
      // Build query string manually for OData parameters
      let queryString = '';
      if (params) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          queryParams.append(key, String(value));
        }
        queryString = queryParams.toString();
      }
      
      const fullUrl = `${this.client.defaults.baseURL}${url}${queryString ? '?' + queryString : ''}`;
      console.log(`🌐 [API] GET ${fullUrl}`);
      
      const response = await this.client.get(url, { params });
      
      analytics.track(EventType.API_CALL, {
        method: 'GET',
        endpoint: url,
        status: response.status,
        duration_ms: Date.now() - start,
        success: true
      });
      
      console.log(`✅ [API] Response status: ${response.status}`);
      console.log(`📦 [API] Response data type:`, Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log(`📦 [API] Response data:`, response.data);
      
      return { success: true, data: response.data };
    } catch (error: any) {
      analytics.track(EventType.API_CALL, {
        method: 'GET',
        endpoint: url,
        status: error.response?.status || 0,
        error: error.message,
        duration_ms: Date.now() - start,
        success: false
      });
      
      console.error(`❌ [API] GET ${url} failed:`, error.message);
      if (error.response) {
        console.error(`❌ [API] Response status: ${error.response.status}`);
        console.error(`❌ [API] Response data:`, error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const start = Date.now();
    try {
      const response = await this.client.post(url, data);
      
      analytics.track(EventType.API_CALL, {
        method: 'POST',
        endpoint: url,
        status: response.status,
        duration_ms: Date.now() - start,
        success: true
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      analytics.track(EventType.API_CALL, {
        method: 'POST',
        endpoint: url,
        status: error.response?.status || 0,
        error: error.message,
        duration_ms: Date.now() - start,
        success: false
      });

      return { success: false, error: error.message };
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const start = Date.now();
    try {
      const response = await this.client.put(url, data);
      
      analytics.track(EventType.API_CALL, {
        method: 'PUT',
        endpoint: url,
        status: response.status,
        duration_ms: Date.now() - start,
        success: true
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      analytics.track(EventType.API_CALL, {
        method: 'PUT',
        endpoint: url,
        status: error.response?.status || 0,
        error: error.message,
        duration_ms: Date.now() - start,
        success: false
      });

      return { success: false, error: error.message };
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const start = Date.now();
    try {
      const response = await this.client.delete(url);
      
      analytics.track(EventType.API_CALL, {
        method: 'DELETE',
        endpoint: url,
        status: response.status,
        duration_ms: Date.now() - start,
        success: true
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      analytics.track(EventType.API_CALL, {
        method: 'DELETE',
        endpoint: url,
        status: error.response?.status || 0,
        error: error.message,
        duration_ms: Date.now() - start,
        success: false
      });

      return { success: false, error: error.message };
    }
  }

  // Module-specific endpoints
  // Receiving
  async getReceivingDocument(id: string) {
    return this.get(`/receiving/${id}`);
  }

  async syncReceiving(data: any) {
    return this.post('/receiving/sync', data);
  }

  // Placement
  async getPlacementDocument(id: string) {
    return this.get(`/placement/${id}`);
  }

  async syncPlacement(data: any) {
    return this.post('/placement/sync', data);
  }

  // Picking
  async getPickingDocument(id: string) {
    return this.get(`/picking/${id}`);
  }

  async syncPicking(data: any) {
    return this.post('/picking/sync', data);
  }

  // Shipment
  async getShipmentDocument(id: string) {
    return this.get(`/shipment/${id}`);
  }

  async syncShipment(data: any) {
    return this.post('/shipment/sync', data);
  }

  // Return
  async syncReturn(data: any) {
    return this.post('/return/sync', data);
  }

  async syncWriteoff(data: any) {
    return this.post('/writeoff/sync', data);
  }

  // Inventory
  async getInventoryDocument(id: string) {
    return this.get(`/inventory/${id}`);
  }

  async syncInventory(data: any) {
    return this.post('/inventory/sync', data);
  }

  // Barcode collector
  async uploadBarcodes(barcodes: string[]) {
    return this.post('/barcodes/upload', { barcodes });
  }

  // Label printing
  async print(data: any) {
    return this.post('/print', data);
  }

  async getTemplates() {
    return this.get('/templates');
  }

  // ============================================================
  // OData API Methods (Cleverence Mobile SMARTS)
  // ============================================================

  /**
   * Get all document types
   * GET /api/v1/DocTypes
   */
  async getDocTypes() {
    return this.get('/DocTypes');
  }

  /**
   * Get all documents
   * GET /api/v1/Docs
   */
  async getAllDocs(params?: any) {
    return this.get('/Docs', params);
  }

  /**
   * Get documents count for specific type
   * GET /api/v1/Docs/{DocType}/$count
   */
  async getDocsCount(docTypeUni: string) {
    try {
      const response = await this.client.get(`/Docs/${docTypeUni}/$count`, {
        responseType: 'text',
        transformResponse: [(data) => data],
      });

      let count: number =
        typeof response.data === 'number'
          ? response.data
          : parseInt(String(response.data).trim(), 10);

      if (Number.isNaN(count)) {
        count = 0;
      }

      return { success: true, data: count };
    } catch (error: any) {
      console.error(`❌ [API] Failed to fetch docs count for ${docTypeUni}:`, error?.message || error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get document with items (expanded)
   * GET /api/v1/Docs('id')?$expand=declaredItems,currentItems
   */
  async getDocumentById(docId: string, expand?: string[]) {
     if (!docId) {
       return { success: false, error: 'Document ID is required' };
     }
 
    const sanitizedId = docId.replace(/'/g, "''");
    const keySegment = `('${sanitizedId}')`;
 
    const params = expand && expand.length > 0
      ? { $expand: expand.join(',') }
      : undefined;
 
     return this.get(`/Docs${keySegment}`, params);
   }

  /**
   * Get documents by type - tries multiple approaches
   * @param docTypeUni - Document type unique identifier
   */
  async getDocsByType(docTypeUni: string) {
    console.log(`🔍 [API] Trying to get documents for type: ${docTypeUni}`);
    
    // Approach 1: Try specialized EntitySet (e.g. /Docs/PrihodNaSklad)
    console.log(`🔍 [API] Approach 1: /Docs/${docTypeUni}`);
    let response = await this.get(`/Docs/${docTypeUni}`);
    
    if (response.success && response.data) {
      console.log(`✅ [API] Approach 1 succeeded`);
      return response;
    }
    
    // Approach 2: Try with $filter on documentTypeName
    console.log(`🔍 [API] Approach 2: /Docs with $filter=documentTypeName eq '${docTypeUni}'`);
    response = await this.get('/Docs', {
      $filter: `documentTypeName eq '${docTypeUni}'`
    });
    
    if (response.success && response.data) {
      console.log(`✅ [API] Approach 2 succeeded`);
      return response;
    }
    
    // Approach 3: Get all docs and filter client-side
    console.log(`🔍 [API] Approach 3: /Docs (get all, filter client-side)`);
    response = await this.get('/Docs');
    
    if (response.success && response.data) {
      console.log(`✅ [API] Approach 3 succeeded (will filter client-side)`);
      // Add marker for client-side filtering
      (response as any).needsClientFilter = true;
      (response as any).filterType = docTypeUni;
      return response;
    }
    
    console.error(`❌ [API] All approaches failed for ${docTypeUni}`);
    return { success: false, error: 'Failed to fetch documents' };
  }

  /**
   * Get single document by ID
   * GET /api/v1/Docs/{docId}
   */
  async getDocById(docId: string) {
    return this.get(`/Docs/${docId}`);
  }

  /**
   * Get products
   * GET /api/v1/Products
   */
  async getProducts(params?: any) {
    return this.get('/Products', params);
  }

  /**
   * Get cells (storage locations)
   * GET /api/v1/Cells
   */
  async getCells(params?: any) {
    return this.get('/Cells', params);
  }
}

export const api = new ApiService();
