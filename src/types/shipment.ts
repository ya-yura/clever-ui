// === 📁 src/types/shipment.ts ===
// Types for Shipment module

import { BaseDocument, BaseLine } from './common';

export interface ShipmentDocument extends BaseDocument {
  orderId: string;
  orderNumber: string;
  customer?: string;
  deliveryAddress?: string;
  totalLines: number;
  completedLines: number;
  totalWeight?: number;
  totalPackages?: number;
  ttn?: string;
  carrier?: string;
  trackingNumber?: string;
  signature?: string;
  photo?: string;
  shippedAt?: number;
}

export interface ShipmentLine extends BaseLine {
  packageId?: string;
  serialNumber?: string;
  weight?: number;
  verifiedAt?: number;
}

export interface ShipmentDiscrepancy {
  lineId: string;
  productName: string;
  planned: number;
  actual: number;
  action?: 'adjust' | 'mark_shortage' | 'confirm';
}
