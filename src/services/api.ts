// === 📁 src/services/api.ts ===
// API service for server communication

import axios, { AxiosInstance, AxiosError } from 'axios';
import { configService } from './configService';

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

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - trigger logout
          console.warn('⚠️ Unauthorized (401) - clearing auth');
          this.clearToken();
          
          // Trigger logout event for AuthContext
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
   */
  updateBaseURL() {
    try {
      if (configService.isConfigured()) {
        const serverUrl = configService.getServerUrl();
        // Server URL already contains /MobileSMARTS/api/v1
        this.client.defaults.baseURL = serverUrl;
        console.log('✅ [API] baseURL updated from config:', this.client.defaults.baseURL);
      } else {
        // Use relative path for Vite proxy to work
        // In dev: proxy will forward to http://localhost:9000
        // In prod: configure proper URL via Setup page
        const defaultBaseUrl = '/MobileSMARTS/api/v1';
        this.client.defaults.baseURL = defaultBaseUrl;
        console.log('✅ [API] Config not configured, using relative path (via proxy):', defaultBaseUrl);
      }
    } catch (error) {
      console.error('❌ [API] Failed to update baseURL:', error);
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
      
      console.log(`✅ [API] Response status: ${response.status}`);
      console.log(`📦 [API] Response data type:`, Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log(`📦 [API] Response data:`, response.data);
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`❌ [API] GET ${url} failed:`, error.message);
      if (error.response) {
        console.error(`❌ [API] Response status: ${error.response.status}`);
        console.error(`❌ [API] Response data:`, error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return { success: true, data: response.data };
    } catch (error: any) {
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
