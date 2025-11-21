// === 📁 src/types/activity.ts ===
// Типы и перечисления для системы отслеживания активности

export type ActivityModule =
  | 'receiving'
  | 'placement'
  | 'picking'
  | 'shipment'
  | 'return'
  | 'inventory'
  | 'scanner'
  | 'auth'
  | 'sync'
  | 'config'
  | 'system';

export type EventResult = 'success' | 'failure' | 'partial';

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ScanContext = 'product' | 'cell' | 'licensePlate' | 'unknown';

export type EventType =
  | 'app.start'
  | 'app.background'
  | 'app.foreground'
  | 'login.success'
  | 'login.failure'
  | 'logout'
  | 'receiving.document.open'
  | 'receiving.document.complete'
  | 'receiving.line.scan'
  | 'receiving.line.adjust'
  | 'placement.cell.scan'
  | 'placement.line.complete'
  | 'picking.route.start'
  | 'picking.route.step'
  | 'picking.line.confirm'
  | 'inventory.count.start'
  | 'inventory.count.submit'
  | 'scan.barcode'
  | 'scan.error'
  | 'sync.start'
  | 'sync.success'
  | 'sync.failure'
  | 'config.update'
  | 'app.error';

export type EventStatus = 'pending' | 'sending' | 'synced' | 'error';

export interface BaseActivityPayload {
  module: ActivityModule;
  userId?: string;
  userName?: string;
  deviceId?: string;
  sessionId?: string;
  documentId?: string;
  documentType?: string;
  documentNumber?: string;
  lineId?: string;
  barcode?: string;
  partnerId?: string;
  result?: EventResult;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ReceivingEventPayload extends BaseActivityPayload {
  module: 'receiving';
  supplierName?: string;
  productId?: string;
  expectedQty?: number;
  actualQty?: number;
  difference?: number;
}

export interface PickingEventPayload extends BaseActivityPayload {
  module: 'picking';
  routeId?: string;
  cellId?: string;
  productId?: string;
  plannedQty?: number;
  pickedQty?: number;
}

export interface PlacementEventPayload extends BaseActivityPayload {
  module: 'placement';
  cellId?: string;
  productId?: string;
  plannedQty?: number;
  placedQty?: number;
}

export interface InventoryEventPayload extends BaseActivityPayload {
  module: 'inventory';
  cellId?: string;
  expectedQty?: number;
  countedQty?: number;
  discrepancy?: number;
}

export interface ScanEventPayload extends BaseActivityPayload {
  module: 'scanner' | 'receiving' | 'picking' | 'placement' | 'inventory';
  barcode: string;
  scanContext: ScanContext;
  isValid: boolean;
  matchedEntityId?: string;
}

export interface ErrorEventPayload extends BaseActivityPayload {
  module: ActivityModule;
  severity: EventSeverity;
  message: string;
  errorCode?: string;
  stack?: string;
}

export type ActivityEventPayload =
  | ReceivingEventPayload
  | PickingEventPayload
  | PlacementEventPayload
  | InventoryEventPayload
  | ScanEventPayload
  | ErrorEventPayload
  | BaseActivityPayload;

export interface ActivityEvent<TPayload extends ActivityEventPayload = ActivityEventPayload> {
  id: string; // UUID
  eventType: EventType;
  timestamp: number; // Unix timestamp
  payload: TPayload;
  status: EventStatus;
  retryCount: number;
  lastError?: string;
  createdAt: number;
}
