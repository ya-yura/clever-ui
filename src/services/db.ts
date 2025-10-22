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

  constructor() {
    super('WarehouseDB');

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
  }
}

export const db = new WarehouseDatabase();
