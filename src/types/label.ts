// === 📁 src/types/label.ts ===
// Types for Label Printing module

export type LabelType = 
  | 'product'
  | 'cell'
  | 'package'
  | 'document'
  | 'ttn';

export type PrinterType = 
  | 'bluetooth'
  | 'network'
  | 'server';

export type PrintStatus = 
  | 'pending'
  | 'printing'
  | 'completed'
  | 'error';

export interface LabelTemplate {
  id: string;
  name: string;
  type: LabelType;
  template: string; // HTML or ZPL
  variables: string[];
  width?: number;
  height?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PrintTask {
  id?: number;
  templateId: string;
  data: Record<string, any>;
  copies: number;
  printer?: string;
  status: PrintStatus;
  timestamp: number;
  completedAt?: number;
  error?: string;
}

export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  address?: string;
  connected: boolean;
}
