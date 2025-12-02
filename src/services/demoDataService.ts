// === 📁 src/services/demoDataService.ts ===
// Сервис для работы с демо-данными (локальные JSON файлы)

import demoDocTypes from '@/data/demo/doctypes.json';
import demoDocuments from '@/data/demo/documents.json';
import { ODataDocumentType, ODataDocument } from '@/types/odata';

/**
 * Сервис для работы с демо-данными
 * Имитирует работу API сервера, используя локальные JSON файлы
 */
class DemoDataService {
  private docTypes: ODataDocumentType[] = [];
  private documents: Record<string, ODataDocument[]> = {};
  private products: any[] = [];
  private cells: any[] = [];
  private partners: any[] = [];
  private employees: any[] = [];
  private warehouses: any[] = [];
  private readonly fallbackProducts = [
    { id: 'DEMO-P-001', code: 'SKU-001', name: 'Демо товар 1', barcode: '990000000001', unit: 'шт' },
    { id: 'DEMO-P-002', code: 'SKU-002', name: 'Демо товар 2', barcode: '990000000002', unit: 'шт' },
    { id: 'DEMO-P-003', code: 'SKU-003', name: 'Демо товар 3', barcode: '990000000003', unit: 'шт' },
    { id: 'DEMO-P-004', code: 'SKU-004', name: 'Демо товар 4', barcode: '990000000004', unit: 'шт' },
    { id: 'DEMO-P-005', code: 'SKU-005', name: 'Демо товар 5', barcode: '990000000005', unit: 'шт' },
  ];
  
  constructor() {
    this.loadData();
  }

  /**
   * Загрузить демо-данные из JSON файлов
   */
  private loadData() {
    try {
      // Загрузить типы документов
      if (demoDocTypes && (demoDocTypes as any).value) {
        this.docTypes = (demoDocTypes as any).value as ODataDocumentType[];
        console.log('📦 [DEMO] Загружено типов документов:', this.docTypes.length);
      }

      // Загрузить документы
      if (demoDocuments) {
        this.documents = demoDocuments as any as Record<string, ODataDocument[]>;
        
        // Подсчитать общее количество документов
        let totalDocs = 0;
        Object.keys(this.documents).forEach(key => {
          const count = this.documents[key]?.length || 0;
          totalDocs += count;
          if (count > 0) {
            console.log(`📄 [DEMO] ${key}: ${count} документов`);
          }
        });
        
        console.log('📊 [DEMO] Всего документов:', totalDocs);
      }

      // Загрузить дополнительные данные (если есть)
      this.loadAdditionalData();
    } catch (error) {
      console.error('❌ [DEMO] Ошибка загрузки демо-данных:', error);
    }
  }

  /**
   * Загрузить дополнительные данные (товары, ячейки и т.д.)
   */
  private async loadAdditionalData() {
    try {
      // Попытка загрузить товары
      try {
        const productsModule = await import('@/data/demo/products.json');
        this.products = (productsModule as any).value || [];
        console.log('📦 [DEMO] Загружено товаров:', this.products.length);
      } catch {
        // Файл не найден - не критично
      }

      // Попытка загрузить ячейки
      try {
        const cellsModule = await import('@/data/demo/cells.json');
        this.cells = (cellsModule as any).value || [];
        console.log('🏪 [DEMO] Загружено ячеек:', this.cells.length);
      } catch {
        // Файл не найден - не критично
      }

      // Попытка загрузить контрагентов
      try {
        const partnersModule = await import('@/data/demo/partners.json');
        this.partners = (partnersModule as any).value || [];
        console.log('👥 [DEMO] Загружено контрагентов:', this.partners.length);
      } catch {
        // Файл не найден - не критично
      }

      // Попытка загрузить сотрудников
      try {
        const employeesModule = await import('@/data/demo/employees.json');
        this.employees = (employeesModule as any).value || [];
        console.log('👨‍💼 [DEMO] Загружено сотрудников:', this.employees.length);
      } catch {
        // Файл не найден - не критично
      }

      // Попытка загрузить склады
      try {
        const warehousesModule = await import('@/data/demo/warehouses.json');
        this.warehouses = (warehousesModule as any).value || [];
        console.log('🏭 [DEMO] Загружено складов:', this.warehouses.length);
      } catch {
        // Файл не найден - не критично
      }
    } catch (error) {
      console.warn('⚠️ [DEMO] Не удалось загрузить дополнительные данные:', error);
    }
  }

  /**
   * Получить все типы документов
   */
  getDocTypes(): { value: ODataDocumentType[] } {
    return {
      value: this.docTypes
    };
  }

  /**
   * Получить документы по типу
   */
  getDocuments(docTypeUni: string): { value: ODataDocument[] } {
    const docs = this.documents[docTypeUni] || [];
    return {
      value: docs
    };
  }

  /**
   * Получить количество документов по типу
   */
  getDocumentsCount(docTypeUni: string): number {
    return this.documents[docTypeUni]?.length || 0;
  }

  /**
   * Получить документ по ID
   */
  getDocumentById(docTypeUni: string, docId: string): ODataDocument | null {
    const docs = this.documents[docTypeUni] || [];
    return docs.find(doc => doc.id === docId) || null;
  }

  /**
   * Получить документ по ID с items (для детализации)
   * Генерирует mock items на основе products
   */
  getDocumentWithItems(docTypeUni: string, docId: string, baseDoc?: Partial<ODataDocument>): any | null {
    let doc = this.getDocumentById(docTypeUni, docId);
    if (!doc) {
      if (baseDoc) {
        doc = this.createMockDocumentFromBase(docTypeUni, docId, baseDoc);
      } else {
        doc = this.createMockDocumentFromBase(docTypeUni, docId);
      }
    }
    if (!doc) return null;

    // Generate mock items based on document type
    const itemsCount = Math.floor(Math.random() * 5) + 3; // 3-7 items
    const items = [];
    const productPool = this.products.length > 0 ? this.products : this.fallbackProducts;
    
    for (let i = 0; i < itemsCount; i++) {
      const product = productPool[i % productPool.length];
      const productName = product?.name || `Демо товар ${i + 1}`;
      const declaredQty = Math.floor(Math.random() * 20) + 5; // 5-25
      const currentQty = doc.finished 
        ? declaredQty 
        : doc.inProcess 
          ? Math.floor(declaredQty * 0.7) 
          : 0;

      items.push({
        uid: `item-${i + 1}`,
        createdBy: 'Server',
        productId: product.id,
        declaredQuantity: declaredQty,
        currentQuantity: currentQty,
        currentQuantityWithBinding: currentQty,
        firstStorageId: this.cells[0]?.id || '1',
        firstStorageBarcode: this.cells[0]?.barcode || 'CELL-001',
        registeredDate: doc.createDate,
        registrationDate: doc.createDate,
        index: i,
        expiredDate: '9999-12-31T23:59:59+00:00',
        productName,
        productBarcode: product?.barcode || `999000${i}`,
        packingUnitsQuantity: 1,
        product: {
          id: product?.id || `DEMO-P-${i}`,
          code: product?.code || `SKU-${i}`,
          name: productName,
          barcode: product?.barcode || `999000${i}`,
          unit: product.unit
        }
      });
    }

    return {
      ...doc,
      declaredItems: items,
      currentItems: items.filter(item => item.currentQuantity > 0),
      combinedItems: items
    };
  }

  /**
   * Создать мок-документ на основе данных из списка, если полноценной записи нет
   */
  private createMockDocumentFromBase(docTypeUni: string, docId: string, baseDoc: Partial<ODataDocument> = {}): ODataDocument {
    const now = new Date().toISOString();
    const status = (baseDoc as any)?.status;
    const finished = baseDoc.finished ?? (status === 'completed' || status === 'finished');
    const inProcess = baseDoc.inProcess ?? (status === 'in_progress' || status === 'processing' || (!!status && !finished));

    return {
      id: docId,
      documentTypeName: docTypeUni,
      name: baseDoc.name || baseDoc.deliveryNumber || `Документ ${docId}`,
      description: baseDoc.description || '',
      finished,
      inProcess: finished ? false : inProcess,
      createDate: baseDoc.createDate || now,
      lastChangeDate: baseDoc.lastChangeDate || baseDoc.createDate || now,
      userName: baseDoc.userName || (baseDoc as any)?.supplier || 'Демо оператор',
      userId: baseDoc.userId || 'demo-user',
      barcode: baseDoc.barcode || baseDoc.deliveryNumber || docId,
      warehouseId: baseDoc.warehouseId || 'DEMO-WH',
      partnerName: baseDoc.partnerName || (baseDoc as any)?.supplier || 'Демо партнёр',
      appointment: baseDoc.appointment || (baseDoc as any)?.operator || 'demo-user',
      priority: baseDoc.priority || 1,
      states: [],
      ...baseDoc,
    } as ODataDocument;
  }

  /**
   * Получить все документы (для страницы Documents)
   */
  getAllDocuments(): ODataDocument[] {
    const allDocs: ODataDocument[] = [];
    
    Object.keys(this.documents).forEach(key => {
      const docs = this.documents[key] || [];
      allDocs.push(...docs);
    });
    
    return allDocs;
  }

  /**
   * Проверить, доступны ли демо-данные
   */
  isAvailable(): boolean {
    return this.docTypes.length > 0;
  }

  /**
   * Получить статистику по демо-данным
   */
  getStats() {
    const stats = {
      docTypesCount: this.docTypes.length,
      totalDocuments: 0,
      byType: {} as Record<string, number>,
      productsCount: this.products.length,
      cellsCount: this.cells.length,
      partnersCount: this.partners.length,
      employeesCount: this.employees.length,
      warehousesCount: this.warehouses.length,
    };

    Object.keys(this.documents).forEach(key => {
      const count = this.documents[key]?.length || 0;
      stats.byType[key] = count;
      stats.totalDocuments += count;
    });

    return stats;
  }

  /**
   * Получить товары
   */
  getProducts(): { value: any[] } {
    return {
      value: this.products
    };
  }

  /**
   * Получить ячейки
   */
  getCells(): { value: any[] } {
    return {
      value: this.cells
    };
  }

  /**
   * Получить контрагентов
   */
  getPartners(): { value: any[] } {
    return {
      value: this.partners
    };
  }

  /**
   * Получить сотрудников
   */
  getEmployees(): { value: any[] } {
    return {
      value: this.employees
    };
  }

  /**
   * Получить склады
   */
  getWarehouses(): { value: any[] } {
    return {
      value: this.warehouses
    };
  }

  /**
   * Поиск товара по штрихкоду
   */
  findProductByBarcode(barcode: string): any | null {
    return this.products.find(p => p.barcode === barcode) || null;
  }

  /**
   * Поиск ячейки по коду
   */
  findCellByCode(code: string): any | null {
    return this.cells.find(c => c.code === code || c.barcode === code) || null;
  }
}

// Singleton instance
export const demoDataService = new DemoDataService();

