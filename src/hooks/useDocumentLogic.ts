import { useState, useCallback, useEffect } from 'react';
import { db } from '@/services/db';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { feedback } from '@/utils/feedback';
import analytics, { EventType } from '@/lib/analytics';
import { UniversalDocument } from '@/types/document';
import { odataAPI } from '@/services/odata-api';

export type DocLine = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  barcode: string;
  quantityPlan: number;
  quantityFact: number;
  status: 'pending' | 'partial' | 'completed' | 'over';
};

interface UseDocumentLogicProps {
  docType: 'receiving' | 'placement' | 'picking' | 'shipment' | 'return' | 'inventory';
  docId?: string;
  onComplete?: () => void;
}

export const useDocumentLogic = ({ docType, docId, onComplete }: UseDocumentLogicProps) => {
  const [document, setDocument] = useState<any | null>(null);
  const [lines, setLines] = useState<DocLine[]>([]);
  const [activeLine, setActiveLine] = useState<DocLine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiscrepancyAlert, setShowDiscrepancyAlert] = useState(false);

  const { addSyncAction } = useOfflineStorage(docType);

  // --- 1. Загрузка документа ---
  const loadDocument = useCallback(async () => {
    if (!docId) return;
    setLoading(true);
    setError(null);
    
    try {
      // Динамический выбор таблицы в зависимости от типа
      const docTable = (db as any)[`${docType}Documents`];
      const linesTable = (db as any)[`${docType}Lines`];

      let doc = await docTable.get(docId);
      let docLines: DocLine[] = [];
      
      if (!doc) {
        // Попытка загрузить из OData API
        console.log(`📡 [LOGIC] Document ${docId} not in IndexedDB, trying OData API...`);
        
        try {
          const odataTypeName = odataAPI.mapInternalToODataType(docType);
          const odataDoc = await odataAPI.getDocument(odataTypeName, docId);
          
          // Конвертируем OData документ во внутренний формат
          doc = {
            id: odataDoc.id,
            status: odataDoc.finished ? 'completed' : odataDoc.inProcess ? 'in_progress' : 'new',
            createdAt: new Date(odataDoc.createDate).getTime(),
            updatedAt: new Date(odataDoc.lastChangeDate).getTime(),
            totalLines: odataDoc.declaredItems?.length || 0,
            completedLines: 0,
            supplier: odataDoc.userName || 'Неизвестно',
            deliveryNumber: odataDoc.barcode || odataDoc.name,
            notes: odataDoc.description || '',
          };

          // Конвертируем строки
          const declaredItems = odataDoc.declaredItems || [];
          const currentItems = odataDoc.currentItems || [];
          
          docLines = declaredItems.map((item: any) => {
            const currentItem = currentItems.find((ci: any) => ci.productId === item.productId);
            const quantityFact = currentItem?.currentQuantity || 0;
            const quantityPlan = item.declaredQuantity;
            
            return {
              id: item.uid,
              productId: item.productId,
              productName: item.productName || item.productId,
              productSku: item.productId,
              barcode: item.productBarcode || item.productId,
              quantityPlan,
              quantityFact,
              status: quantityFact >= quantityPlan ? 'completed' : quantityFact > 0 ? 'partial' : 'pending',
            };
          });

          // Сохраняем в IndexedDB для оффлайн работы
          await docTable.put(doc);
          await linesTable.bulkPut(docLines);
          
          console.log(`✅ [LOGIC] Loaded document from OData and saved to IndexedDB`);
        } catch (apiError) {
          console.error(`❌ [LOGIC] Failed to load from OData:`, apiError);
          
          // 🎭 Fallback to demo data if in demo mode
          const isDemoMode = localStorage.getItem('demo_mode') === 'true';
          if (isDemoMode) {
            console.log(`🎭 [LOGIC] Trying to load from demo data...`);
            const { demoDataService } = await import('@/services/demoDataService');
            const odataTypeName = odataAPI.mapInternalToODataType(docType);
            const demoDoc = demoDataService.getDocumentWithItems(odataTypeName, docId);
            
            if (demoDoc) {
              // Конвертируем demo документ во внутренний формат
              doc = {
                id: demoDoc.id,
                status: demoDoc.finished ? 'completed' : demoDoc.inProcess ? 'in_progress' : 'new',
                createdAt: new Date(demoDoc.createDate).getTime(),
                updatedAt: new Date(demoDoc.lastChangeDate).getTime(),
                totalLines: demoDoc.declaredItems?.length || 0,
                completedLines: 0,
                supplier: demoDoc.userName || demoDoc.partnerName || 'Неизвестно',
                deliveryNumber: demoDoc.barcode || demoDoc.name,
                notes: demoDoc.description || '',
              };

              // Конвертируем строки
              const declaredItems = demoDoc.declaredItems || [];
              const currentItems = demoDoc.currentItems || [];
              
              docLines = declaredItems.map((item: any) => {
                const currentItem = currentItems.find((ci: any) => ci.productId === item.productId);
                const quantityFact = currentItem?.currentQuantity || 0;
                const quantityPlan = item.declaredQuantity;
                
                return {
                  id: item.uid,
                  productId: item.productId,
                  productName: item.productName || item.product?.name || item.productId,
                  productSku: item.product?.code || item.productId,
                  barcode: item.productBarcode || item.product?.barcode || item.productId,
                  quantityPlan,
                  quantityFact,
                  status: quantityFact >= quantityPlan ? 'completed' : quantityFact > 0 ? 'partial' : 'pending',
                };
              });

              // Сохраняем в IndexedDB для оффлайн работы
              await docTable.put(doc);
              await linesTable.bulkPut(docLines);
              
              console.log(`✅ [LOGIC] Loaded document from demo data and saved to IndexedDB`);
            } else {
              throw new Error('Документ не найден ни локально, ни на сервере, ни в демо-данных');
            }
          } else {
            throw new Error('Документ не найден ни локально, ни на сервере');
          }
        }
      } else {
        // Документ найден в IndexedDB
        docLines = await linesTable.where('documentId').equals(docId).toArray();
      }
      
      setDocument(doc);
      setLines(docLines);
      
      // Обновляем completedLines
      const completed = docLines.filter(l => l.status === 'completed').length;
      if (doc.completedLines !== completed) {
        doc.completedLines = completed;
        await docTable.put(doc);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('[LOGIC] Error loading document:', err);
      feedback.error(err.message || 'Ошибка загрузки документа');
    } finally {
      setLoading(false);
    }
  }, [docType, docId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // --- 2. Обработка сканирования ---
  const handleScan = useCallback(async (code: string) => {
    if (!document) return { success: false, message: 'Документ не загружен' };

    // Ищем товар в строках
    let line = lines.find(l => l.barcode === code || l.productSku === code);

    if (line) {
      // Товар найден в документе
      setActiveLine(line);
      
      // Проверка переполнения (1.5)
      if (line.quantityFact >= line.quantityPlan && docType !== 'return' && docType !== 'inventory') {
        feedback.warning('Излишек! Товар уже собран.');
        if (!confirm(`План выполнен (${line.quantityPlan}). Добавить сверх плана?`)) {
          return { success: false, message: 'Отмена добавления излишка' };
        }
      }

      // Авто +1 (1.4)
      await updateQuantity(line.id, 1);
      return { success: true, message: line.productName, line };
    } else {
      // Товар не найден (1.5)
      if (docType === 'inventory') {
          // Для инвентаризации создаем новую строку
          const newId = crypto.randomUUID();
          const newLine: DocLine = {
              id: newId,
              productId: 'unknown', // В реальном проекте надо искать в Products
              productName: 'Неизвестный товар', 
              productSku: code,
              barcode: code,
              quantityPlan: 0,
              quantityFact: 1,
              status: 'over'
          };
          
          const linesTable = (db as any)[`${docType}Lines`];
          await linesTable.add({ ...newLine, documentId: document.id });
          setLines(prev => [...prev, newLine]);
          setActiveLine(newLine);
          feedback.success('Товар добавлен в опись');
          return { success: true, message: 'Добавлено', line: newLine };
      }

      feedback.error('Товар не найден в документе');
      analytics.track(EventType.SCAN_ERROR, { reason: 'not_in_doc', barcode: code });
      
      return { success: false, message: 'Товар не числится в документе' };
    }
  }, [lines, document, docType]);

  // --- 3. Обновление строки ---
  const updateLine = useCallback(async (lineId: string, updates: Partial<DocLine>) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    const updatedLine = { ...line, ...updates };
    
    // Пересчитываем статус если изменилось количество
    if (updates.quantityFact !== undefined) {
        const newFact = updates.quantityFact;
        if (newFact === 0) updatedLine.status = 'pending';
        else if (newFact < line.quantityPlan) updatedLine.status = 'partial';
        else if (newFact === line.quantityPlan) updatedLine.status = 'completed';
        else updatedLine.status = 'over';
    }

    // Обновляем UI
    setLines(prev => prev.map(l => l.id === lineId ? updatedLine : l));
    if (activeLine?.id === lineId) setActiveLine(updatedLine);

    // Обновляем БД
    const linesTable = (db as any)[`${docType}Lines`];
    await linesTable.update(lineId, updatedLine);
    await addSyncAction('update_line', updatedLine);

    // Проверки завершения... (упрощено для краткости)
  }, [lines, docType, activeLine, addSyncAction]);

  const updateQuantity = (lineId: string, delta: number, absolute?: boolean) => {
      const line = lines.find(l => l.id === lineId);
      if (!line) return;
      const newFact = absolute ? delta : Math.max(0, line.quantityFact + delta);
      updateLine(lineId, { quantityFact: newFact });
  };

  // --- 4. Получение расхождений (US I.3, VI.3) ---
  const getDiscrepancies = useCallback(() => {
    return lines.map(line => {
      const diff = line.quantityFact - line.quantityPlan;
      return {
        lineId: line.id,
        productName: line.productName,
        planned: line.quantityPlan,
        actual: line.quantityFact,
        type: diff < 0 ? 'shortage' : diff > 0 ? 'surplus' : 'ok'
      } as const;
    });
  }, [lines]);

  // --- 5. Завершение документа (US I.4) ---
  const finishDocument = useCallback(async (forceComplete = false) => {
    if (!document) return;

    // US I.3: Проверка расхождений
    const discrepancies = getDiscrepancies();
    const hasDiscrepancies = discrepancies.some(d => d.type !== 'ok');
    
    if (hasDiscrepancies && !forceComplete) {
      // Показываем алерт с расхождениями (будет обработан в компоненте)
      setShowDiscrepancyAlert(true);
      return { needsConfirmation: true, discrepancies };
    }

    // US I.4: Завершение документа
    const docTable = (db as any)[`${docType}Documents`];
    const updatedDoc = {
        ...document,
        status: 'completed',
        completedLines: lines.filter(l => l.status === 'completed' || l.status === 'over').length,
        updatedAt: Date.now(),
        discrepancies: hasDiscrepancies ? discrepancies : undefined
    };

    await docTable.update(document.id, updatedDoc);
    await addSyncAction('complete_doc', updatedDoc);
    
    setDocument(updatedDoc);
    setShowDiscrepancyAlert(false);
    
    // US VIII.1: Автосохранение
    feedback.success('Документ завершен');
    
    if (onComplete) onComplete();

    return { needsConfirmation: false };

  }, [document, lines, docType, addSyncAction, onComplete, getDiscrepancies]);

  return {
    document,
    lines,
    activeLine,
    loading,
    error,
    handleScan,
    updateQuantity,
    updateLine,
    finishDocument,
    getDiscrepancies,
    showDiscrepancyAlert,
    setShowDiscrepancyAlert,
    setActiveLine
  };
};

