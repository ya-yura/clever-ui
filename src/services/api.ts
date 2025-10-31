// === 📁 src/services/api.ts ===
// API service for server communication

import axios, { AxiosInstance, AxiosError } from 'axios';
import serverConfig from '@/config/server.json';

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
    this.client = axios.create({
      baseURL: serverConfig.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
          // Handle unauthorized
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Generic request methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return { success: true, data: response.data };
    } catch (error: any) {
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
   * Get documents by type
   * GET /api/v1/Docs/{DocType.uni}/
   * @param docTypeUni - Document type unique identifier
   */
  async getDocsByType(docTypeUni: string) {
    return this.get(`/Docs/${docTypeUni}`);
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
