// === 📁 src/types/odata.ts ===
// OData API types based on $metadata.xml

/**
 * Document Type from Cleverence API
 * Represents a type of warehouse operation (Receiving, Placement, etc.)
 */
export interface ODataDocumentType {
  uni: string; // Unique identifier
  name: string; // Internal name
  displayName: string; // Display name for UI
  filePath?: string;
  clientCreating: boolean;
  autoCreateNewDocument: boolean;
  autoStartNewDocumentCreation: boolean;
  autoStartNewDocumentCreationForEmptyList: boolean;
  autoOpenSigleDocument: boolean;
  inaccessibleForDocumentAbsence: boolean;
  showDeclaredQuantities: boolean;
  alias?: string;
  input: boolean;
  output: boolean;
  labelTypeName?: string;
  manualDocumentSelection: boolean;
  barcodeDocumentSelection: boolean;
  checkServerBarcodes: boolean;
  cyclic: boolean;
  manualExit: boolean;
  fullscreen: boolean;
  buttonColor?: string;
  visible?: string;
  enabled?: string;
}

/**
 * Document from Cleverence API
 * Represents a warehouse document (order, shipment, etc.)
 */
export interface ODataDocument {
  id: string;
  name: string;
  appointment?: string;
  userId?: string;
  userName?: string;
  lastChangeDate: string; // ISO 8601 DateTimeOffset
  createDate: string; // ISO 8601 DateTimeOffset
  createdOnPDA: boolean;
  documentTypeName: string;
  modified: boolean;
  inProcess: boolean;
  finished: boolean;
  warehouseId?: string;
  barcode?: string;
  priority: number;
  description?: string;
  distributeByBarcode: boolean;
  autoAppointed: boolean;
  serverHosted: boolean;
  deviceId?: string;
  deviceName?: string;
  deviceIP?: string;
  licenseStatus: number;
  notOpenedYet: boolean;
}

/**
 * Document Item from Cleverence API
 * Represents a line item in a warehouse document
 */
export interface ODataDocumentItem {
  uid: string;
  createdBy: 'Unknown' | 'Server' | 'Device' | 'ERP';
  productId?: string;
  declaredQuantity: number;
  currentQuantity: number;
  currentQuantityWithBinding: number;
  firstStorageId?: string;
  secondStorageId?: string;
  firstStorageBarcode?: string;
  secondStorageBarcode?: string;
  firstCellId?: string;
  secondCellId?: string;
  packingId?: string;
  sscc?: string;
  registeredDate: string;
  registrationDate: string;
  index: number;
  expiredDate: string;
  bindedLineUid?: string;
  productName?: string;
  productMarking?: string;
  productBarcode?: string;
  packingName?: string;
  packingUnitsQuantity: number;
}

/**
 * Product from Cleverence API
 */
export interface ODataProduct {
  id: string;
  name: string;
  unitId?: string;
  unitConvertionRate: number;
  barcode?: string;
  basePackingId?: string;
  marking?: string;
  versionNumber: number;
}

/**
 * Cell (storage location) from Cleverence API
 */
export interface ODataCell {
  id: string;
  warehouseId?: string;
  barcode?: string;
  description?: string;
  name: string;
}

/**
 * OData collection response wrapper
 */
export interface ODataCollection<T> {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: T[];
}

/**
 * OData single entity response wrapper
 */
export interface ODataSingle<T> {
  '@odata.context'?: string;
  value?: T;
}

/**
 * OData error response
 */
export interface ODataError {
  error: {
    code: string;
    message: string;
    innererror?: {
      message: string;
      type: string;
      stacktrace: string;
    };
  };
}

