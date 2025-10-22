// === 📁 src/types/receiving.ts ===
// Types for Receiving module

import { BaseDocument, BaseLine } from './common';

export interface ReceivingDocument extends BaseDocument {
  supplier?: string;
  deliveryNumber?: string;
  expectedDate?: number;
  totalLines: number;
  completedLines: number;
}

export interface ReceivingLine extends BaseLine {
  expiryDate?: number;
  lotNumber?: string;
  receivedAt?: number;
}
