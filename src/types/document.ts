// === 📁 src/types/document.ts ===
// Universal document types for document list module

import { DocumentStatus } from './common';

/**
 * Document type enum
 */
export type DocumentType = 
  | 'receiving'      // Приёмка
  | 'placement'      // Размещение
  | 'picking'        // Подбор
  | 'shipment'       // Отгрузка
  | 'return'         // Возврат
  | 'inventory';     // Инвентаризация

/**
 * Document priority levels
 */
export type DocumentPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Universal document interface combining all document types
 */
export interface UniversalDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  priority?: DocumentPriority;
  
  // Document metadata
  number?: string;              // Document number
  externalId?: string;          // External system ID
  
  // Dates
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  dueDate?: number;             // Deadline for completion
  
  // References
  partnerId?: string;           // Supplier/Customer ID
  partnerName?: string;         // Supplier/Customer name
  warehouseId?: string;
  warehouseName?: string;
  userId?: string;
  userName?: string;
  
  // Counters
  totalLines?: number;          // Total number of lines
  completedLines?: number;      // Completed lines
  totalQuantity?: number;       // Total planned quantity
  completedQuantity?: number;   // Completed quantity
  
  // Additional info
  notes?: string;
  tags?: string[];
  
  // Type-specific fields
  sourceDocument?: string;      // For placement (from receiving)
  route?: string;               // For picking
  vehicle?: string;             // For shipment
  returnReason?: string;        // For returns
  inventoryType?: string;       // For inventory (full/partial/cycle)
  origin?: 'legacy' | 'odata';  // Data source indicator
  docTypeUni?: string;          // Original OData document type (PrihodNaSklad, etc.)
}

/**
 * Document filter criteria
 */
export interface DocumentFilter {
  types?: DocumentType[];
  statuses?: DocumentStatus[];
  priorities?: DocumentPriority[];
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
  partnerId?: string;
  userId?: string;
  tags?: string[];
}

/**
 * Document sort options
 */
export type DocumentSortField = 
  | 'createdAt'
  | 'updatedAt'
  | 'dueDate'
  | 'number'
  | 'priority'
  | 'status'
  | 'type'
  | 'partnerName';

export type SortDirection = 'asc' | 'desc';

export interface DocumentSort {
  field: DocumentSortField;
  direction: SortDirection;
}

/**
 * Document list state
 */
export interface DocumentListState {
  documents: UniversalDocument[];
  filteredDocuments: UniversalDocument[];
  filter: DocumentFilter;
  sort: DocumentSort;
  loading: boolean;
  error?: string;
}

/**
 * Document type labels for UI
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  receiving: 'Приёмка',
  placement: 'Размещение',
  picking: 'Подбор',
  shipment: 'Отгрузка',
  return: 'Возврат',
  inventory: 'Инвентаризация',
};

/**
 * Document type colors for UI
 * Updated for Dark Theme design system
 */
export const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  receiving: 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30',
  placement: 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30',
  picking: 'bg-modules-picking-bg/20 text-modules-picking-bg border border-modules-picking-bg/30',
  shipment: 'bg-success/20 text-success border border-success/30',
  return: 'bg-error/20 text-error border border-error/30',
  inventory: 'bg-modules-inventory-bg/20 text-modules-inventory-bg border border-modules-inventory-bg/30',
};

/**
 * Document type icons (emoji)
 */
export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  receiving: '📦',
  placement: '📍',
  picking: '🛒',
  shipment: '🚚',
  return: '↩️',
  inventory: '📊',
};

/**
 * Status labels for UI
 */
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Черновик',
  in_progress: 'В работе',
  completed: 'Завершён',
  cancelled: 'Отменён',
  synced: 'Синхронизирован',
  error: 'Ошибка',
};

/**
 * Status colors for UI
 * Updated for Dark Theme design system
 */
export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-surface-tertiary text-content-secondary',
  in_progress: 'bg-brand-secondary/20 text-brand-secondary',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-error/20 text-error',
  synced: 'bg-info/20 text-info',
  error: 'bg-error text-brand-dark',
};

/**
 * Priority labels for UI
 */
export const PRIORITY_LABELS: Record<DocumentPriority, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
  urgent: 'Срочный',
};

/**
 * Priority colors for UI
 */
export const PRIORITY_COLORS: Record<DocumentPriority, string> = {
  low: 'text-content-tertiary',
  normal: 'text-info',
  high: 'text-warning',
  urgent: 'text-error',
};
