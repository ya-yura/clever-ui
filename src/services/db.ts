// === 📁 src/services/db.ts ===
// IndexedDB setup using Dexie.js for offline-first architecture

import Dexie, { Table } from 'dexie';
import {
  ReceivingDocument,
  ReceivingLine,
} from '@/types/receiving';
import {
  PlacementDocument,
  PlacementLine,
} from '@/types/placement';
import {
  PickingDocument,
  PickingLine,
} from '@/types/picking';
import {
  ShipmentDocument,
  ShipmentLine,
} from '@/types/shipment';
import {
  ReturnDocument,
  ReturnLine,
} from '@/types/return';
import {
  InventoryDocument,
  InventoryLine,
} from '@/types/inventory';
import { BarcodeRecord } from '@/types/barcode';
import { LabelTemplate, PrintTask } from '@/types/label';
import { Employee, PartnerSession } from '@/types/partner';
import { ODataDocumentType, ODataDocument } from '@/types/odata';
import { ActivityEvent } from '@/types/activity';

export interface SyncAction {
  id?: number;
  module: string;
  action: string;
  data: any;
  timestamp: number;
  synced: boolean;
  error?: string;
}

export interface ErrorLog {
  id?: number;
  module: string;
  error: string;
  timestamp: number;
  resolved: boolean;
}

// Cache metadata for tracking freshness
export interface CacheMetadata {
  key: string;
  lastUpdated: number;
  expiresAt: number;
}

export class WarehouseDatabase extends Dexie {
  // Receiving tables
  receivingDocuments!: Table<ReceivingDocument, string>;
  receivingLines!: Table<ReceivingLine, string>;

  // Placement tables
  placementDocuments!: Table<PlacementDocument, string>;
  placementLines!: Table<PlacementLine, string>;

  // Picking tables
  pickingDocuments!: Table<PickingDocument, string>;
  pickingLines!: Table<PickingLine, string>;

  // Shipment tables
  shipmentDocuments!: Table<ShipmentDocument, string>;
  shipmentLines!: Table<ShipmentLine, string>;

  // Return/Write-off tables
  returnDocuments!: Table<ReturnDocument, string>;
  returnLines!: Table<ReturnLine, string>;

  // Inventory tables
  inventoryDocuments!: Table<InventoryDocument, string>;
  inventoryLines!: Table<InventoryLine, string>;

  // Barcode collector
  barcodes!: Table<BarcodeRecord, number>;

  // Label printing
  labelTemplates!: Table<LabelTemplate, string>;
  printTasks!: Table<PrintTask, number>;

  // Sync and errors
  syncActions!: Table<SyncAction, number>;
  errorLogs!: Table<ErrorLog, number>;

  // Partner/Team work
  employees!: Table<Employee, string>;
  partnerSessions!: Table<PartnerSession, string>;

  // Reference data (справочники)
  products!: Table<any, string>;
  cells!: Table<any, string>;

  // OData cache tables
  odataDocTypes!: Table<ODataDocumentType, string>;
  odataDocuments!: Table<ODataDocument, string>;
  cacheMetadata!: Table<CacheMetadata, string>;

  // Activity tracking
  activityEvents!: Table<ActivityEvent, string>;

  constructor() {
    super('WarehouseDB');

    // Version 1 - Initial schema
    this.version(1).stores({
      // Receiving
      receivingDocuments: 'id, status, createdAt, updatedAt',
      receivingLines: 'id, documentId, productId, status',

      // Placement
      placementDocuments: 'id, status, createdAt, updatedAt',
      placementLines: 'id, documentId, productId, cellId, status',

      // Picking
      pickingDocuments: 'id, status, createdAt, updatedAt',
      pickingLines: 'id, documentId, productId, cellId, status',

      // Shipment
      shipmentDocuments: 'id, status, createdAt, updatedAt',
      shipmentLines: 'id, documentId, productId, status',

      // Return/Write-off
      returnDocuments: 'id, type, status, createdAt, updatedAt',
      returnLines: 'id, documentId, productId, status',

      // Inventory
      inventoryDocuments: 'id, status, createdAt, updatedAt',
      inventoryLines: 'id, documentId, productId, cellId, status',

      // Barcode collector
      barcodes: '++id, barcode, timestamp',

      // Label printing
      labelTemplates: 'id, name, type',
      printTasks: '++id, timestamp, status',

      // Sync and errors
      syncActions: '++id, module, timestamp, synced',
      errorLogs: '++id, module, timestamp, resolved',
    });

    // Version 2 - Added Partner/Team work module
    this.version(2).stores({
      // Add new tables
      employees: 'id, name, role, department, isActive, lastActiveAt',
      partnerSessions: 'id, userId, partnerId, startedAt, endedAt, status',
    });

    // Version 3 - Added reference data tables
    this.version(3).stores({
      // Reference data
      products: 'id, name, sku, barcode',
      cells: 'id, name, zone, type',
    });

    // Version 4 - Added OData cache tables for API integration
    this.version(4).stores({
      // OData cache
      odataDocTypes: 'uni, name, displayName',
      odataDocuments: 'id, documentTypeName, finished, inProcess, createDate',
      cacheMetadata: 'key, lastUpdated, expiresAt',
    });

    // Version 5 - Activity tracking events
    this.version(5).stores({
      activityEvents: 'id, eventType, status, timestamp, userId',
    });
  }
}

export const db = new WarehouseDatabase();
