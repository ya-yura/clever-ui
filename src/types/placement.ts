// === 📁 src/types/placement.ts ===
// Types for Placement module

import { BaseDocument, BaseLine } from './common';

export interface PlacementDocument extends BaseDocument {
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  totalLines: number;
  completedLines: number;
}

export interface PlacementLine extends BaseLine {
  cellId?: string;
  cellName?: string;
  suggestedCellId?: string;
  suggestedCellName?: string;
  placedAt?: number;
  verifiedCellId?: string;
}
