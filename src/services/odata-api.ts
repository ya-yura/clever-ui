/**
 * OData API Integration Service
 * Интеграция с реальным API Cleverence MobileSMARTS
 * Base URL: http://localhost:9000/MobileSMARTS/api/v1/
 */

import { api } from './api';
import { demoDataService } from './demoDataService';

const BASE_URL = '/MobileSMARTS/api/v1';

export interface ODataDocType {
  uni: string;
  name: string;
  displayName: string;
  buttonColor?: string;
  clientCreating: boolean;
  manualDocumentSelection: boolean;
  input: boolean;
  output: boolean;
}

export interface ODataDocument {
  id: string;
  name: string;
  documentTypeName: string;
  finished: boolean;
  inProcess: boolean;
  modified: boolean;
  createDate: string;
  lastChangeDate: string;
  userId?: string;
  userName?: string;
  warehouseId?: string;
  priority: number;
  description?: string;
  barcode?: string;
}

export interface ODataDocumentItem {
  uid: string;
  productId: string;
  productName: string;
  productBarcode: string;
  declaredQuantity: number;
  currentQuantity: number;
  firstCellId?: string;
  secondCellId?: string;
  packingId?: string;
  index: number;
}

export interface ODataProduct {
  id: string;
  name: string;
  barcode: string;
  unitId?: string;
  marking?: string;
}

export interface ODataCell {
  id: string;
  name: string;
  barcode?: string;
  description?: string;
  warehouseId?: string;
}

class ODataAPIService {
  /**
   * Получить список типов документов
   * GET /api/v1/DocTypes
   */
  async getDocTypes(): Promise<ODataDocType[]> {
    try {
      const response = await api.get(`${BASE_URL}/DocTypes`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch DocTypes:', error);
      throw error;
    }
  }

  /**
   * Получить список документов по типу
   * GET /api/v1/Docs/{DocTypeName}
   * Например: /api/v1/Docs/PrihodNaSklad
   */
  async getDocumentsByType(docTypeName: string): Promise<ODataDocument[]> {
    try {
      const response = await api.get(`${BASE_URL}/Docs/${docTypeName}`, {
        params: {
          $expand: 'declaredItems,currentItems',
          $orderby: 'createDate desc',
        },
      });
      return response.data.value || [];
    } catch (error) {
      console.error(`Failed to fetch documents for ${docTypeName}:`, error);
      throw error;
    }
  }

  /**
   * Получить конкретный документ с расширенными данными
   * GET /api/v1/Docs/{DocTypeName}('{id}')
   */
  async getDocument(docTypeName: string, id: string): Promise<ODataDocument & { declaredItems?: ODataDocumentItem[]; currentItems?: ODataDocumentItem[] }> {
    try {
      const response = await api.get(`${BASE_URL}/Docs/${docTypeName}('${id}')`, {
        params: {
          $expand: 'declaredItems,currentItems',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Обновить документ
   * PATCH /api/v1/Docs/{DocTypeName}('{id}')
   */
  async updateDocument(docTypeName: string, id: string, data: Partial<ODataDocument>): Promise<void> {
    try {
      await api.patch(`${BASE_URL}/Docs/${docTypeName}('${id}')`, data);
    } catch (error) {
      console.error(`Failed to update document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Обновить строку документа
   * PATCH /api/v1/DocumentItem('{uid}')
   */
  async updateDocumentItem(uid: string, data: Partial<ODataDocumentItem>): Promise<void> {
    try {
      await api.patch(`${BASE_URL}/DocumentItem('${uid}')`, data);
    } catch (error) {
      console.error(`Failed to update document item ${uid}:`, error);
      throw error;
    }
  }

  /**
   * Завершить документ (EndUpdate action)
   * POST /api/v1/Docs/{DocTypeName}('{id}')/Default.EndUpdate
   */
  async finishDocument(docTypeName: string, id: string): Promise<void> {
    try {
      await api.post(`${BASE_URL}/Docs/${docTypeName}('${id}')/Default.EndUpdate`);
    } catch (error) {
      console.error(`Failed to finish document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить список товаров
   * GET /api/v1/Products
   */
  async getProducts(filter?: string): Promise<ODataProduct[]> {
    try {
      const response = await api.get(`${BASE_URL}/Products`, {
        params: {
          $filter: filter,
          $top: 100,
        },
      });
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  /**
   * Поиск товара по штрихкоду
   * GET /api/v1/Products?$filter=barcode eq '{barcode}'
   */
  async getProductByBarcode(barcode: string): Promise<ODataProduct | null> {
    try {
      const response = await api.get(`${BASE_URL}/Products`, {
        params: {
          $filter: `barcode eq '${barcode}'`,
          $top: 1,
        },
      });
      const products = response.data.value || [];
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`Failed to fetch product by barcode ${barcode}:`, error);
      return null;
    }
  }

  /**
   * Получить список ячеек
   * GET /api/v1/Cells
   */
  async getCells(warehouseId?: string): Promise<ODataCell[]> {
    try {
      const response = await api.get(`${BASE_URL}/Cells`, {
        params: {
          $filter: warehouseId ? `warehouseId eq '${warehouseId}'` : undefined,
        },
      });
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch cells:', error);
      throw error;
    }
  }

  /**
   * Маппинг типов документов на внутренние типы
   */
  mapDocTypeToInternal(oDataTypeName: string): string {
    const mapping: Record<string, string> = {
      'PrihodNaSklad': 'receiving',
      'RazmeshhenieVYachejki': 'placement',
      'PodborZakaza': 'picking',
      'Otgruzka': 'shipment',
      'Vozvrat': 'return',
      'Inventarizaciya': 'inventory',
    };
    return mapping[oDataTypeName] || oDataTypeName.toLowerCase();
  }

  /**
   * Обратный маппинг
   */
  mapInternalToODataType(internalType: string): string {
    const mapping: Record<string, string> = {
      'receiving': 'PrihodNaSklad',
      'placement': 'RazmeshhenieVYachejki',
      'picking': 'PodborZakaza',
      'shipment': 'Otgruzka',
      'return': 'Vozvrat',
      'inventory': 'Inventarizaciya',
    };
    return mapping[internalType] || internalType;
  }
}

export const odataAPI = new ODataAPIService();

