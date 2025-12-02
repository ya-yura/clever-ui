// === 📁 src/services/documentService.ts ===
// Service for working with documents from all modules

import { db } from './db';
import {
  UniversalDocument,
  DocumentType,
  DocumentFilter,
  DocumentSort,
  DocumentPriority,
} from '@/types/document';
import { DocumentStatus } from '@/types/common';
import { odataCache } from './odataCache';
import { ODataDocument } from '@/types/odata';

const normalizeDocTypeKey = (value?: string): string =>
  value
    ? value
        .toString()
        .toLowerCase()
        .replace(/[\s_\-]+/g, '')
        .replace(/[^a-z0-9а-яё]/g, '')
    : '';

const DOC_TYPE_ALIASES: Record<string, DocumentType> = {
  prihodnasklad: 'receiving',
  'приходнасклад': 'receiving',
  priemka: 'receiving',
  'приёмка': 'receiving',
  receiving: 'receiving',

  razmeshhenievyachejki: 'placement',
  razmeshhenie: 'placement',
  'размещениевячейки': 'placement',
  'размещение': 'placement',
  placement: 'placement',

  podborzakaza: 'picking',
  picking: 'picking',
  'подборзаказа': 'picking',
  'подбор': 'picking',

  otgruzka: 'shipment',
  shipping: 'shipment',
  'отгрузка': 'shipment',

  vozvrat: 'return',
  return: 'return',
  'возврат': 'return',

  inventarizaciya: 'inventory',
  inventory: 'inventory',
  'инвентаризация': 'inventory',
};

const MODULE_TO_DOC_TYPE_UNI: Record<DocumentType, string> = {
  receiving: 'PrihodNaSklad',
  placement: 'RazmeshhenieVYachejki',
  picking: 'PodborZakaza',
  shipment: 'Otgruzka',
  return: 'Vozvrat',
  inventory: 'Inventarizaciya',
};

/**
 * Document Service
 * Provides unified access to all document types
 */
export class DocumentService {
  /**
   * Get all documents from all modules
   */
  async getAllDocuments(): Promise<UniversalDocument[]> {
    console.log('📂 [DocumentService] getAllDocuments called');
    
    try {
      const remoteDocuments = await this.loadRemoteDocuments();
      console.log(`📂 [DocumentService] Remote documents: ${remoteDocuments.length}`);
      
      if (remoteDocuments.length > 0) {
        return remoteDocuments;
      }

      console.warn('⚠️ Falling back to legacy IndexedDB documents (receiving/placement/etc.)');
      const legacyDocs = await this.loadLegacyDocuments();
      console.log(`📂 [DocumentService] Legacy documents: ${legacyDocs.length}`);
      
      return legacyDocs;
    } catch (error) {
      console.error('❌ [DocumentService] Error in getAllDocuments:', error);
      // Return empty array instead of throwing to prevent UI breaking
      return [];
    }
  }

  /**
   * Load documents directly from OData API (with cache)
   */
  private async loadRemoteDocuments(): Promise<UniversalDocument[]> {
    try {
      let docs = await odataCache.getAllDocuments();

      if (!docs || docs.length === 0) {
        console.warn('⚠️ [DOCS] /Docs returned empty list, fallback to per-type fetching');
        try {
          const docTypes = await odataCache.getDocTypes();
          const aggregated: ODataDocument[] = [];

          for (const type of docTypes) {
            const names = [type.uni, (type as any).name, (type as any).displayName]
              .filter(Boolean) as string[];
            const typeDocs = await odataCache.getDocsByType(type.uni, {
              names,
              forceRefresh: true,
            });
            aggregated.push(...typeDocs);
          }

          docs = aggregated;
        } catch (err) {
          console.error('❌ [DOCS] Failed to load documents per type:', err);
          docs = [];
        }
      }

      if (!docs || docs.length === 0) {
        return [];
      }

      const mapped = docs
        .map((doc) => this.mapODataDocument(doc))
        .filter((doc): doc is UniversalDocument => Boolean(doc));

      return mapped;
    } catch (error) {
      console.error('Error fetching documents from OData API:', error);
      return [];
    }
  }

  /**
   * Legacy loader for IndexedDB data (mock data/offline modules)
   */
  private async loadLegacyDocuments(): Promise<UniversalDocument[]> {
    try {
      const [
        receiving,
        placement,
        picking,
        shipment,
        returnDocs,
        inventory,
      ] = await Promise.all([
        this.getReceivingDocuments(),
        this.getPlacementDocuments(),
        this.getPickingDocuments(),
        this.getShipmentDocuments(),
        this.getReturnDocuments(),
        this.getInventoryDocuments(),
      ]);

      return [
        ...receiving,
        ...placement,
        ...picking,
        ...shipment,
        ...returnDocs,
        ...inventory,
      ];
    } catch (error) {
      console.error('Error fetching legacy documents:', error);
      return [];
    }
  }

  /**
   * Map OData document to UniversalDocument
   */
  private mapODataDocument(doc: ODataDocument): UniversalDocument | null {
    const resolved = this.resolveDocumentType(doc);
    if (!resolved) {
      return null;
    }

    const createdAt = this.parseDate(doc.createDate);
    const updatedAt = this.parseDate(doc.lastChangeDate) || createdAt;

    return {
      id: doc.id,
      type: resolved.type,
      docTypeUni: resolved.docTypeUni,
      origin: 'odata',
      status: this.mapStatusFromOData(doc),
      priority: this.mapPriorityFromOData(doc.priority),
      number: doc.name || doc.id,
      externalId: doc.barcode || doc.id,
      createdAt,
      updatedAt,
      userId: doc.userId,
      userName: doc.userName,
      warehouseId: doc.warehouseId,
      partnerName: doc.appointment,
      notes: doc.description,
      tags: doc.notOpenedYet ? ['new'] : undefined,
    };
  }

  private parseDate(value?: string): number {
    if (!value) {
      return Date.now();
    }
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? Date.now() : timestamp;
  }

  private mapStatusFromOData(doc: ODataDocument): DocumentStatus {
    if ((doc as any).isCancelled) {
      return 'cancelled';
    }
    if (doc.finished) {
      return 'completed';
    }
    if (doc.inProcess || doc.modified) {
      return 'in_progress';
    }
    return 'draft';
  }

  private mapPriorityFromOData(priority?: number): DocumentPriority | undefined {
    if (priority === undefined || priority === null) {
      return undefined;
    }

    if (priority >= 80) return 'urgent';
    if (priority >= 50) return 'high';
    if (priority <= 20) return 'low';
    return 'normal';
  }

  private resolveDocumentType(doc: ODataDocument): { type: DocumentType; docTypeUni?: string } | null {
    const candidates = [
      doc.documentTypeName,
      (doc as any).documentTypeUni,
      (doc as any).documentType?.uni,
      (doc as any).documentType,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeDocTypeKey(candidate);
      if (!normalized) continue;

      const mappedType = DOC_TYPE_ALIASES[normalized];
      if (mappedType) {
        return {
          type: mappedType,
          docTypeUni: typeof candidate === 'string' ? candidate : undefined,
        };
      }
    }

    return null;
  }

  /**
   * Get receiving documents
   */
  private async getReceivingDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.receivingDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.receivingLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'receiving' as DocumentType,
        status: doc.status,
        externalId: doc.deliveryNumber,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        partnerName: doc.supplier,
        userId: doc.userId,
        notes: doc.notes,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get placement documents
   */
  private async getPlacementDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.placementDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.placementLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'placement' as DocumentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        userId: doc.userId,
        notes: doc.notes,
        sourceDocument: doc.sourceDocumentId,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get picking documents
   */
  private async getPickingDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.pickingDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.pickingLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'picking' as DocumentType,
        status: doc.status,
        number: doc.orderNumber,
        externalId: doc.orderId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        partnerName: doc.customer,
        userId: doc.userId,
        notes: doc.notes,
        route: doc.route ? `${doc.route.length} ячеек` : undefined,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get shipment documents
   */
  private async getShipmentDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.shipmentDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.shipmentLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'shipment' as DocumentType,
        status: doc.status,
        number: doc.orderNumber,
        externalId: doc.orderId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        partnerName: doc.customer,
        userId: doc.userId,
        notes: doc.notes,
        vehicle: doc.carrier,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get return documents
   */
  private async getReturnDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.returnDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.returnLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'return' as DocumentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        userId: doc.userId,
        notes: doc.notes,
        returnReason: doc.type === 'return' ? 'Возврат' : 'Списание',
        totalLines: doc.totalLines || totalLines,
        completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Get inventory documents
   */
  private async getInventoryDocuments(): Promise<UniversalDocument[]> {
    const docs = await db.inventoryDocuments.toArray();
    return Promise.all(docs.map(async (doc) => {
      const lines = await db.inventoryLines
        .where('documentId')
        .equals(doc.id)
        .toArray();

      const totalLines = lines.length;
      const completedLines = lines.filter(l => l.status === 'completed').length;
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantityPlan, 0);
      const completedQuantity = lines.reduce((sum, l) => sum + l.quantityFact, 0);

      return {
        id: doc.id,
        type: 'inventory' as DocumentType,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        syncedAt: doc.syncedAt,
        userId: doc.userId,
        notes: doc.notes,
        inventoryType: doc.type,
        totalLines: doc.totalLines || totalLines,
        completedLines: doc.completedLines || completedLines,
        totalQuantity,
        completedQuantity,
      } as UniversalDocument;
    }));
  }

  /**
   * Filter documents
   */
  filterDocuments(
    documents: UniversalDocument[],
    filter: DocumentFilter
  ): UniversalDocument[] {
    let filtered = [...documents];

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(doc => filter.types!.includes(doc.type));
    }

    // Filter by statuses
    if (filter.statuses && filter.statuses.length > 0) {
      filtered = filtered.filter(doc => filter.statuses!.includes(doc.status));
    }

    // Filter by priorities
    if (filter.priorities && filter.priorities.length > 0) {
      filtered = filtered.filter(doc => 
        doc.priority && filter.priorities!.includes(doc.priority)
      );
    }

    // Filter by date range
    if (filter.dateFrom) {
      filtered = filtered.filter(doc => doc.createdAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      filtered = filtered.filter(doc => doc.createdAt <= filter.dateTo!);
    }

    // Filter by partner
    if (filter.partnerId) {
      filtered = filtered.filter(doc => doc.partnerId === filter.partnerId);
    }

    // Filter by user
    if (filter.userId) {
      filtered = filtered.filter(doc => doc.userId === filter.userId);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.some(tag => filter.tags!.includes(tag))
      );
    }

    // Search query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.number?.toLowerCase().includes(query) ||
        doc.partnerName?.toLowerCase().includes(query) ||
        doc.notes?.toLowerCase().includes(query) ||
        doc.externalId?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Sort documents
   */
  sortDocuments(
    documents: UniversalDocument[],
    sort: DocumentSort
  ): UniversalDocument[] {
    const sorted = [...documents];
    const direction = sort.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let valueA: any = a[sort.field];
      let valueB: any = b[sort.field];

      // Handle undefined values
      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return direction;
      if (valueB === undefined) return -direction;

      // String comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction * valueA.localeCompare(valueB);
      }

      // Numeric comparison
      if (valueA < valueB) return -direction;
      if (valueA > valueB) return direction;
      return 0;
    });

    return sorted;
  }

  /**
   * Get document URL by type and id
   */
  getDocumentUrl(doc: UniversalDocument): string {
    if (doc.origin === 'odata') {
      const docTypeUni = doc.docTypeUni || MODULE_TO_DOC_TYPE_UNI[doc.type];
      if (docTypeUni) {
        return `/docs/${docTypeUni}/${doc.id}`;
      }
    }
    return `/${doc.type}/${doc.id}`;
  }

  /**
   * Calculate completion percentage
   */
  getCompletionPercentage(doc: UniversalDocument): number {
    if (!doc.totalQuantity || doc.totalQuantity === 0) return 0;
    return Math.round((doc.completedQuantity || 0) / doc.totalQuantity * 100);
  }
}

// Export singleton instance
export const documentService = new DocumentService();

