import { useState, useCallback, useEffect } from 'react';
import { odataAPI, ODataDocument, ODataDocumentItem } from '@/services/odata-api';
import { db } from '@/services/db';
import { feedback } from '@/utils/feedback';

/**
 * Hook для синхронизации с реальным OData API
 * Загружает документы и строки из API и сохраняет в IndexedDB
 */
export const useODataSync = (docType?: string) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Синхронизация типов документов
   */
  const syncDocTypes = useCallback(async () => {
    try {
      const docTypes = await odataAPI.getDocTypes();
      console.log('📥 Loaded DocTypes:', docTypes);
      
      // Сохраняем в localStorage для отображения на главной
      localStorage.setItem('odata_doctypes', JSON.stringify(docTypes));
      
      return docTypes;
    } catch (err) {
      console.error('Failed to sync DocTypes:', err);
      throw err;
    }
  }, []);

  /**
   * Синхронизация документов конкретного типа
   */
  const syncDocuments = useCallback(async (internalType: string) => {
    try {
      const oDataTypeName = odataAPI.mapInternalToODataType(internalType);
      const documents = await odataAPI.getDocumentsByType(oDataTypeName);
      
      console.log(`📥 Loaded ${documents.length} documents for ${oDataTypeName}`);

      // Маппинг на внутреннюю структуру и сохранение в IndexedDB
      const tableName = `${internalType}Documents` as any;
      const linesTableName = `${internalType}Lines` as any;

      for (const doc of documents) {
        // Конвертируем OData документ во внутренний формат
        const internalDoc = {
          id: doc.id,
          status: doc.finished ? 'completed' : doc.inProcess ? 'in_progress' : 'new',
          createdAt: new Date(doc.createDate).getTime(),
          updatedAt: new Date(doc.lastChangeDate).getTime(),
          totalLines: 0, // Будет заполнено ниже
          completedLines: 0,
          supplier: doc.userName, // Или другое поле
          deliveryNumber: doc.barcode,
          notes: doc.description,
        };

        // Загружаем полный документ с items
        const fullDoc = await odataAPI.getDocument(oDataTypeName, doc.id);
        const declaredItems = fullDoc.declaredItems || [];
        const currentItems = fullDoc.currentItems || [];

        internalDoc.totalLines = declaredItems.length;
        
        // Сохраняем документ
        await (db as any)[tableName].put(internalDoc);

        // Сохраняем строки
        for (const item of declaredItems) {
          const currentItem = currentItems.find(ci => ci.productId === item.productId);
          
          const line = {
            id: item.uid,
            documentId: doc.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productId,
            barcode: item.productBarcode,
            quantityPlan: item.declaredQuantity,
            quantityFact: currentItem ? currentItem.currentQuantity : 0,
            cellId: item.firstCellId || item.secondCellId,
            status: currentItem && currentItem.currentQuantity >= item.declaredQuantity 
              ? 'completed' 
              : currentItem && currentItem.currentQuantity > 0 
              ? 'partial' 
              : 'pending',
          };

          await (db as any)[linesTableName].put(line);
        }

        // Обновляем completedLines
        internalDoc.completedLines = declaredItems.filter((_, idx) => {
          const ci = currentItems.find(c => c.index === idx);
          return ci && ci.currentQuantity >= declaredItems[idx].declaredQuantity;
        }).length;
        
        await (db as any)[tableName].put(internalDoc);
      }

      return documents;
    } catch (err) {
      console.error(`Failed to sync documents for ${internalType}:`, err);
      throw err;
    }
  }, []);

  /**
   * Полная синхронизация всех модулей
   */
  const fullSync = useCallback(async () => {
    setSyncing(true);
    setError(null);

    try {
      // 1. Синхронизируем типы документов
      await syncDocTypes();

      // 2. Синхронизируем документы всех типов
      const types = ['receiving', 'placement', 'picking', 'shipment', 'return', 'inventory'];
      
      for (const type of types) {
        try {
          await syncDocuments(type);
        } catch (err) {
          console.warn(`Failed to sync ${type}, skipping`);
        }
      }

      const now = Date.now();
      setLastSync(now);
      localStorage.setItem('lastODataSync', now.toString());
      
      feedback.success('✅ Синхронизация завершена');
    } catch (err: any) {
      setError(err.message);
      feedback.error('❌ Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  }, [syncDocTypes, syncDocuments]);

  /**
   * Отправка изменений на сервер
   */
  const pushChanges = useCallback(async () => {
    if (!docType) return;

    try {
      const oDataTypeName = odataAPI.mapInternalToODataType(docType);
      const syncActions = await db.syncActions
        .where('module')
        .equals(docType)
        .and(action => !action.synced)
        .toArray();

      console.log(`📤 Pushing ${syncActions.length} changes for ${docType}`);

      for (const action of syncActions) {
        try {
          if (action.action === 'update_line') {
            // Обновляем строку документа
            await odataAPI.updateDocumentItem(action.data.id, {
              currentQuantity: action.data.quantityFact,
            });
          } else if (action.action === 'complete_doc') {
            // Завершаем документ
            await odataAPI.finishDocument(oDataTypeName, action.data.id);
          }

          // Помечаем как синхронизированное
          await db.syncActions.update(action.id!, { synced: true });
        } catch (err) {
          console.error(`Failed to push action ${action.id}:`, err);
          await db.syncActions.update(action.id!, { 
            error: (err as Error).message 
          });
        }
      }

      feedback.success('📤 Изменения отправлены');
    } catch (err) {
      console.error('Failed to push changes:', err);
      feedback.error('❌ Ошибка отправки данных');
    }
  }, [docType]);

  // Загружаем время последней синхронизации при монтировании
  useEffect(() => {
    const lastSyncStr = localStorage.getItem('lastODataSync');
    if (lastSyncStr) {
      setLastSync(parseInt(lastSyncStr, 10));
    }
  }, []);

  return {
    syncing,
    lastSync,
    error,
    fullSync,
    syncDocTypes,
    syncDocuments,
    pushChanges,
  };
};



