// === 📁 src/types/inventory.ts ===
// Types for Inventory module

import { BaseDocument, BaseLine } from './common';

export interface InventoryDocument extends BaseDocument {
  type?: 'full' | 'partial' | 'cycle';
  zone?: string;
  totalLines: number;
  completedLines: number;
  discrepanciesCount: number;
  currentCellId?: string;
}

export interface InventoryLine extends BaseLine {
  cellId: string;
  cellName: string;
  quantitySystem: number; // Quantity in the system before inventory
  discrepancy: number;
  countedAt?: number;
  verified?: boolean;
}

export interface InventoryDiscrepancy {
  lineId: string;
  productName: string;
  cellName: string;
  system: number;
  actual: number;
  difference: number;
  action?: 'accept' | 'recount' | 'system_error';
}
