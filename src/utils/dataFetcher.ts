// === 📁 src/utils/dataFetcher.ts ===
// Утилита для загрузки данных с сервера прямо из браузера

import { api } from '@/services/api';

export interface FetchDataOptions {
  includeProducts?: boolean;
  includeCells?: boolean;
  includePartners?: boolean;
  includeEmployees?: boolean;
  includeWarehouses?: boolean;
  onProgress?: (message: string, progress: number) => void;
}

export interface FetchDataResult {
  success: boolean;
  data?: {
    doctypes?: any;
    documents?: any;
    products?: any;
    cells?: any;
    partners?: any;
    employees?: any;
    warehouses?: any;
  };
  error?: string;
  stats?: {
    docTypes: number;
    documents: number;
    products: number;
    cells: number;
    partners: number;
    employees: number;
    warehouses: number;
  };
}

/**
 * Загрузить все данные с сервера
 */
export async function fetchServerData(
  options: FetchDataOptions = {}
): Promise<FetchDataResult> {
  const {
    includeProducts = true,
    includeCells = true,
    includePartners = true,
    includeEmployees = true,
    includeWarehouses = true,
    onProgress,
  } = options;

  const result: FetchDataResult = {
    success: false,
    data: {},
    stats: {
      docTypes: 0,
      documents: 0,
      products: 0,
      cells: 0,
      partners: 0,
      employees: 0,
      warehouses: 0,
    },
  };

  try {
    let progress = 0;
    const totalSteps = 2 + 
      (includeProducts ? 1 : 0) +
      (includeCells ? 1 : 0) +
      (includePartners ? 1 : 0) +
      (includeEmployees ? 1 : 0) +
      (includeWarehouses ? 1 : 0);

    // 1. Загрузить типы документов
    onProgress?.('Загрузка типов документов...', (++progress / totalSteps) * 100);
    const docTypesResponse = await api.getDocTypes();
    if (!docTypesResponse.success) {
      throw new Error('Не удалось загрузить типы документов');
    }
    result.data!.doctypes = docTypesResponse.data;
    const docTypes = docTypesResponse.data?.value || [];
    result.stats!.docTypes = docTypes.length;

    // 2. Загрузить документы
    onProgress?.('Загрузка документов...', (++progress / totalSteps) * 100);
    const documents: Record<string, any[]> = {};
    let totalDocs = 0;

    for (const docType of docTypes) {
      try {
        const docsResponse = await api.getDocsByType(docType.uni);
        if (docsResponse.success && docsResponse.data) {
          const docs = docsResponse.data.value || [];
          documents[docType.uni] = docs;
          totalDocs += docs.length;
        } else {
          documents[docType.uni] = [];
        }
      } catch (error) {
        console.error(`Ошибка загрузки документов типа ${docType.uni}:`, error);
        documents[docType.uni] = [];
      }
    }

    result.data!.documents = documents;
    result.stats!.documents = totalDocs;

    // 3. Загрузить товары
    if (includeProducts) {
      onProgress?.('Загрузка товаров...', (++progress / totalSteps) * 100);
      const productsResponse = await api.getProducts();
      if (productsResponse.success) {
        result.data!.products = productsResponse.data;
        result.stats!.products = productsResponse.data?.value?.length || 0;
      }
    }

    // 4. Загрузить ячейки
    if (includeCells) {
      onProgress?.('Загрузка ячеек...', (++progress / totalSteps) * 100);
      const cellsResponse = await api.getCells();
      if (cellsResponse.success) {
        result.data!.cells = cellsResponse.data;
        result.stats!.cells = cellsResponse.data?.value?.length || 0;
      }
    }

    // 5. Загрузить контрагентов
    if (includePartners) {
      onProgress?.('Загрузка контрагентов...', (++progress / totalSteps) * 100);
      try {
        const partnersResponse = await api.get('/Partners');
        if (partnersResponse.success) {
          result.data!.partners = partnersResponse.data;
          result.stats!.partners = partnersResponse.data?.value?.length || 0;
        }
      } catch {
        // Не критично
      }
    }

    // 6. Загрузить сотрудников
    if (includeEmployees) {
      onProgress?.('Загрузка сотрудников...', (++progress / totalSteps) * 100);
      try {
        const employeesResponse = await api.get('/Employees');
        if (employeesResponse.success) {
          result.data!.employees = employeesResponse.data;
          result.stats!.employees = employeesResponse.data?.value?.length || 0;
        }
      } catch {
        // Не критично
      }
    }

    // 7. Загрузить склады
    if (includeWarehouses) {
      onProgress?.('Загрузка складов...', (++progress / totalSteps) * 100);
      try {
        const warehousesResponse = await api.get('/Warehouses');
        if (warehousesResponse.success) {
          result.data!.warehouses = warehousesResponse.data;
          result.stats!.warehouses = warehousesResponse.data?.value?.length || 0;
        }
      } catch {
        // Не критично
      }
    }

    onProgress?.('Завершено!', 100);
    result.success = true;
    return result;
  } catch (error: any) {
    console.error('Ошибка загрузки данных:', error);
    result.error = error.message || 'Неизвестная ошибка';
    return result;
  }
}

/**
 * Скачать данные как JSON файлы
 */
export function downloadAsJson(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Скачать все данные как архив JSON файлов
 */
export async function downloadAllData(options?: FetchDataOptions) {
  const result = await fetchServerData(options);
  
  if (!result.success) {
    throw new Error(result.error || 'Не удалось загрузить данные');
  }

  // Скачать каждый файл отдельно
  if (result.data?.doctypes) {
    downloadAsJson(result.data.doctypes, 'doctypes.json');
  }
  
  if (result.data?.documents) {
    downloadAsJson(result.data.documents, 'documents.json');
  }
  
  if (result.data?.products) {
    downloadAsJson(result.data.products, 'products.json');
  }
  
  if (result.data?.cells) {
    downloadAsJson(result.data.cells, 'cells.json');
  }
  
  if (result.data?.partners) {
    downloadAsJson(result.data.partners, 'partners.json');
  }
  
  if (result.data?.employees) {
    downloadAsJson(result.data.employees, 'employees.json');
  }
  
  if (result.data?.warehouses) {
    downloadAsJson(result.data.warehouses, 'warehouses.json');
  }

  return result;
}

/**
 * Сохранить данные в localStorage для демо-режима
 */
export function saveDemoData(data: any) {
  try {
    localStorage.setItem('demo_data', JSON.stringify(data));
    console.log('✅ Демо-данные сохранены в localStorage');
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения демо-данных:', error);
    return false;
  }
}

/**
 * Загрузить данные из localStorage
 */
export function loadDemoData(): any | null {
  try {
    const data = localStorage.getItem('demo_data');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки демо-данных:', error);
  }
  return null;
}


