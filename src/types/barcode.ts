// === 📁 src/types/barcode.ts ===
// Types for Barcode Collector module

export interface BarcodeRecord {
  id?: number;
  barcode: string;
  timestamp: number;
  type?: string;
  duplicate?: boolean;
  exported?: boolean;
}

export interface BarcodeExport {
  barcodes: string[];
  timestamp: number;
  count: number;
  format: 'txt' | 'csv' | 'json';
}
