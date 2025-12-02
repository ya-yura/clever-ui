// @ts-nocheck
// === 📁 src/utils/loadInitialData.ts ===
// Load initial data from JSON files to IndexedDB

import { db } from '@/services/db';

const DATA_LOADED_KEY = 'initial_data_loaded';

export const loadInitialData = async () => {
  // Check if data already loaded
  const dataLoaded = localStorage.getItem(DATA_LOADED_KEY);
  if (dataLoaded === 'true') {
    console.log('✅ Initial data already loaded');
    return;
  }

  try {
    console.log('🔄 Loading initial data from JSON files...');

    // Load Employees data
    try {
      const employeesData = await import('@/data/employees.json');
      if (employeesData.default && Array.isArray(employeesData.default)) {
        await db.employees.bulkAdd(employeesData.default);
        console.log('✅ Employees loaded:', employeesData.default.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load employees data:', err.message);
    }

    // Load Receiving data
    try {
      const receivingData = await import('@/data/receiving.json');
      if (receivingData.default?.documents) {
        await db.receivingDocuments.bulkPut(receivingData.default.documents);
        console.log('✅ Receiving documents loaded:', receivingData.default.documents.length);
      }
      if (receivingData.default?.lines) {
        await db.receivingLines.bulkPut(receivingData.default.lines);
        console.log('✅ Receiving lines loaded:', receivingData.default.lines.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load receiving data:', err.message);
    }

    // Load Placement data
    try {
      const placementData = await import('@/data/placement.json');
      if (placementData.default?.documents) {
        await db.placementDocuments.bulkPut(placementData.default.documents);
        console.log('✅ Placement documents loaded:', placementData.default.documents.length);
      }
      if (placementData.default?.lines) {
        await db.placementLines.bulkPut(placementData.default.lines);
        console.log('✅ Placement lines loaded:', placementData.default.lines.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load placement data:', err.message);
    }

    // Load Picking data
    try {
      const pickingData = await import('@/data/picking.json');
      if (pickingData.default?.documents) {
        await db.pickingDocuments.bulkPut(pickingData.default.documents);
        console.log('✅ Picking documents loaded:', pickingData.default.documents.length);
      }
      if (pickingData.default?.lines) {
        await db.pickingLines.bulkPut(pickingData.default.lines);
        console.log('✅ Picking lines loaded:', pickingData.default.lines.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load picking data:', err.message);
    }

    // Load Shipment data
    try {
      const shipmentData = await import('@/data/shipment.json');
      if (shipmentData.default?.documents) {
        await db.shipmentDocuments.bulkPut(shipmentData.default.documents);
        console.log('✅ Shipment documents loaded:', shipmentData.default.documents.length);
      }
      if (shipmentData.default?.lines) {
        await db.shipmentLines.bulkPut(shipmentData.default.lines);
        console.log('✅ Shipment lines loaded:', shipmentData.default.lines.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load shipment data:', err.message);
    }

    // Load Return data
    try {
      const returnData = await import('@/data/return.json');
      if (returnData.default?.documents) {
        await db.returnDocuments.bulkPut(returnData.default.documents);
        console.log('✅ Return documents loaded:', returnData.default.documents.length);
      }
      if (returnData.default?.lines) {
        await db.returnLines.bulkPut(returnData.default.lines);
        console.log('✅ Return lines loaded:', returnData.default.lines.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load return data:', err.message);
    }

    // Load Inventory data
    try {
      const inventoryData = await import('@/data/inventory.json');
      if (inventoryData.default?.documents) {
        await db.inventoryDocuments.bulkPut(inventoryData.default.documents);
        console.log('✅ Inventory documents loaded:', inventoryData.default.documents.length);
      }
      if (inventoryData.default?.lines) {
        await db.inventoryLines.bulkPut(inventoryData.default.lines);
        console.log('✅ Inventory lines loaded:', inventoryData.default.lines.length);
      }
    } catch (err) {
      console.warn('⚠️ Could not load inventory data:', err.message);
    }

    // Mark as loaded
    localStorage.setItem(DATA_LOADED_KEY, 'true');
    console.log('🎉 Initial data loading completed!');
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
    // Don't mark as loaded if there was a critical error
  }
};

// Function to reset data (for development)
export const resetData = async () => {
  try {
    await db.receivingDocuments.clear();
    await db.receivingLines.clear();
    await db.placementDocuments.clear();
    await db.placementLines.clear();
    await db.pickingDocuments.clear();
    await db.pickingLines.clear();
    await db.shipmentDocuments.clear();
    await db.shipmentLines.clear();
    await db.returnDocuments.clear();
    await db.returnLines.clear();
    await db.inventoryDocuments.clear();
    await db.inventoryLines.clear();
    
    localStorage.removeItem(DATA_LOADED_KEY);
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

