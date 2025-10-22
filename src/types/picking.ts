// === 📁 src/types/picking.ts ===
// Types for Picking module

import { BaseDocument, BaseLine } from './common';

export interface PickingDocument extends BaseDocument {
  orderId: string;
  orderNumber: string;
  customer?: string;
  deliveryAddress?: string;
  totalLines: number;
  completedLines: number;
  route?: PickingRoute[];
}

export interface PickingLine extends BaseLine {
  cellId: string;
  cellName: string;
  routeOrder?: number;
  pickedAt?: number;
}

export interface PickingRoute {
  order: number;
  cellId: string;
  cellName: string;
  products: string[];
  completed: boolean;
}
