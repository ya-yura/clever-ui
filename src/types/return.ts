// === 📁 src/types/return.ts ===
// Types for Return/Write-off module

import { BaseDocument, BaseLine } from './common';

export type ReturnType = 'return' | 'writeoff';

export type ReturnReason = 
  | 'damaged'
  | 'expired'
  | 'wrong_item'
  | 'customer_return'
  | 'other';

export interface ReturnDocument extends BaseDocument {
  type: ReturnType;
  sourceDocumentId?: string;
  totalLines: number;
  responsible?: string;
}

export interface ReturnLine extends BaseLine {
  reason?: ReturnReason;
  reasonText?: string;
  photos?: string[];
  signature?: string;
  addedAt?: number;
}
