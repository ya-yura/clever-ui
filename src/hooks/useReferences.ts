// === 📁 src/hooks/useReferences.ts ===
// Hook for updating reference data (справочники)

import { useState, useCallback } from 'react';
import { db } from '@/services/db';
import { api } from '@/services/api';

export const useReferences = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateReferences = useCallback(async () => {
    if (!navigator.onLine) {
      setUpdateError('Требуется подключение к интернету');
      return false;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Fetch reference data from server
      const response = await api.get('/api/references/sync');

      if (response.success && response.data) {
        // Update products
        if (response.data.products) {
          await db.products.clear();
          await db.products.bulkAdd(response.data.products);
        }

        // Update cells
        if (response.data.cells) {
          await db.cells.clear();
          await db.cells.bulkAdd(response.data.cells);
        }

        // Update employees
        if (response.data.employees) {
          await db.employees.clear();
          await db.employees.bulkAdd(response.data.employees);
        }

        setLastUpdateTime(Date.now());
        return true;
      } else {
        throw new Error(response.error || 'Failed to update references');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Update failed';
      setUpdateError(errorMessage);
      console.error('Reference update error:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    isUpdating,
    lastUpdateTime,
    updateError,
    updateReferences,
  };
};

