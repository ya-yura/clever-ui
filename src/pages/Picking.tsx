// === 📁 src/pages/Picking.tsx ===
// Picking module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { PickingDocument, PickingLine, PickingRoute } from '@/types/picking';
import { scanFeedback, feedback } from '@/utils/feedback';
import { speak } from '@/utils/voice';
import { STATUS_LABELS } from '@/types/document';
import PickingCard from '@/components/picking/PickingCard';
import RouteProgress from '@/components/picking/RouteProgress';
import ScannerInput from '@/components/ScannerInput';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

const Picking: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState<PickingDocument | null>(null);
  const [lines, setLines] = useState<PickingLine[]>([]);
  const [documents, setDocuments] = useState<PickingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  const { addSyncAction } = useOfflineStorage('picking');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'picking',
    syncEndpoint: '/picking/sync',
  });

  // Update header with document info or list info
  useEffect(() => {
    if (document && id) {
      setDocumentInfo({
        documentId: document.id,
        completed: document.completedLines || 0,
        total: document.totalLines || 0,
      });
      setListInfo(null);
    } else if (!id) {
      setDocumentInfo(null);
      setListInfo({
        title: 'Подбор',
        count: documents.length,
      });
    }
    
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [document, id, documents.length, setDocumentInfo, setListInfo]);

  // Load document
  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        let doc = await db.pickingDocuments.get(id);
        let docLines = await db.pickingLines.where('documentId').equals(id).toArray();

        if (!doc) {
          const response = await api.getPickingDocument(id);
          if (response.success && response.data) {
            doc = response.data.document;
            docLines = response.data.lines || [];

            if (doc) {
              await db.pickingDocuments.put(doc);
            }

            if (docLines.length) {
              await db.pickingLines.bulkPut(docLines);
            }
          }
        }

        if (doc) {
          setDocument(doc);
          setLines(docLines.sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0)));
          
          // Set first pending cell as current
          const firstPending = docLines.find(l => l.status !== 'completed');
          if (firstPending) {
            setCurrentCell(firstPending.cellId);
          }
        }
      } else {
        // Load all documents
        const allDocs = await db.pickingDocuments.toArray();
        setDocuments(allDocs);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build route from lines
  const buildRoute = (): PickingRoute[] => {
    const cellMap = new Map<string, PickingLine[]>();
    
    lines.forEach(line => {
      const existing = cellMap.get(line.cellId) || [];
      cellMap.set(line.cellId, [...existing, line]);
    });

    const route: PickingRoute[] = [];
    let order = 1;

    cellMap.forEach((cellLines, cellId) => {
      const firstLine = cellLines[0];
      const allCompleted = cellLines.every(l => l.status === 'completed');

      route.push({
        order: order++,
        cellId,
        cellName: firstLine.cellName,
        products: cellLines.map(l => l.productId),
        completed: allCompleted,
      });
    });

    return route.sort((a, b) => a.order - b.order);
  };

  const route = buildRoute();

  // Handle scan
  const handleScan = async (code: string) => {
    if (!document) return;

    // Check if it's a cell barcode
    if (code.startsWith('CELL-')) {
      const cellLines = lines.filter(l => l.cellId === code);
      
      if (cellLines.length > 0) {
        setCurrentCell(code);
        const firstPending = cellLines.find(l => l.status !== 'completed');
        
        if (firstPending) {
          scanFeedback(true, `Ячейка ${firstPending.cellName} активирована`);
          speak(`Подойдите к ячейке ${firstPending.cellName}`);
        } else {
          scanFeedback(true, `Ячейка ${cellLines[0].cellName} - все товары подобраны`);
        }
      } else {
        scanFeedback(false, 'Ячейка не в маршруте');
      }
      return;
    }

    // It's a product barcode
    if (!currentCell) {
      scanFeedback(false, 'Сначала отсканируйте ячейку');
      speak('Сначала отсканируйте ячейку');
      return;
    }

    // Find product in current cell
    const line = lines.find(l =>
      (l.barcode === code || l.productSku === code) &&
      l.cellId === currentCell &&
      l.status !== 'completed'
    );

    if (line) {
      await pickProduct(line);
    } else {
      // Check if product exists but in different cell
      const lineInOtherCell = lines.find(l =>
        (l.barcode === code || l.productSku === code) &&
        l.status !== 'completed'
      );

      if (lineInOtherCell) {
        scanFeedback(false, `Товар находится в ячейке ${lineInOtherCell.cellName}`);
        speak(`Товар находится в ячейке ${lineInOtherCell.cellName}`);
      } else {
        scanFeedback(false, 'Товар не найден или уже подобран');
      }
    }
  };

  const pickProduct = async (line: PickingLine) => {
    const updatedLine: PickingLine = {
      ...line,
      quantityFact: line.quantityFact + 1,
      status: line.quantityFact + 1 >= line.quantityPlan ? 'completed' : 'partial',
      pickedAt: Date.now(),
    };

    await db.pickingLines.update(line.id, updatedLine);
    await addSyncAction('pick_product', updatedLine);

    setLines(prev => prev.map(l => l.id === line.id ? updatedLine : l));
    scanFeedback(true, `Подобрано: ${line.productName}`);

    // Set active line for visual feedback
    setActiveLineId(line.id);
    setTimeout(() => setActiveLineId(null), 2000);

    // Update document progress
    updateDocumentProgress();

    // Check if cell is completed and move to next
    const cellLines = lines.filter(l => l.cellId === currentCell);
    const allCompleted = cellLines.every(l =>
      l.id === line.id ? updatedLine.status === 'completed' : l.status === 'completed'
    );

    if (allCompleted) {
      moveToNextCell();
    }
  };

  const moveToNextCell = () => {
    const nextCell = lines.find(l => 
      l.cellId !== currentCell && 
      l.status !== 'completed'
    );

    if (nextCell) {
      setTimeout(() => {
        setCurrentCell(nextCell.cellId);
        scanFeedback(true, `Переход к ячейке ${nextCell.cellName}`);
        speak(`Переход к ячейке ${nextCell.cellName}`);
      }, 1500);
    }
  };

  const handleSkipCell = () => {
    if (confirm('Пропустить текущую ячейку?')) {
       moveToNextCell();
    }
  };

  const { handleScan: onScanWithFeedback, lastScan } = useScanner({
    mode: 'keyboard',
    onScan: handleScan,
  });

  // Update document progress and auto-complete if all lines are done
  const updateDocumentProgress = async () => {
    if (!document) return;

    const completedLines = lines.filter(l => l.status === 'completed').length;
    const totalLines = lines.length;
    
    // Check if all lines are completed
    const allCompleted = totalLines > 0 && completedLines === totalLines;
    
    const updatedDoc = {
      ...document,
      completedLines,
      status: allCompleted ? 'completed' as const : document.status,
      updatedAt: Date.now(),
    };

    await db.pickingDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);

    // Auto-complete and navigate when all done
    if (allCompleted && document.status !== 'completed') {
      await addSyncAction('complete', updatedDoc);
      sync();
      
      // Show success feedback
      feedback.success('Подбор завершён!');
      speak('Подбор завершён');
      
      // Navigate after short delay
      setTimeout(() => {
        if (confirm('Документ завершён. Перейти к отгрузке?')) {
          navigate(`/shipment?source=${document.id}`);
        } else {
          navigate('/picking');
        }
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show document list if no id specified
  if (!id) {
    return (
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Нет документов подбора
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/picking/${doc.id}`)}
                className="card hover:shadow-lg transition-shadow text-left p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {doc.id}
                    </h3>
                    {doc.orderNumber && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Заказ: {doc.orderNumber}
                      </p>
                    )}
                    {doc.customer && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Клиент: {doc.customer}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${
                      doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                      doc.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status === 'completed' ? 'Завершен' :
                       doc.status === 'in_progress' ? 'В работе' :
                       'Черновик'}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {doc.completedLines} / {doc.totalLines} строк
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Документ не найден</p>
      </div>
    );
  }

  const progress = document.totalLines > 0
    ? (document.completedLines / document.totalLines) * 100
    : 0;

  const currentCellName = lines.find(l => l.cellId === currentCell)?.cellName || currentCell;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-compact">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Заказ: {document.orderNumber || document.id}
            </p>
            {document.customer && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {document.customer}
              </p>
            )}
            {currentCell && (
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-0.5">
                📍 {currentCellName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs">
                {pendingCount}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              document.status === 'completed' ? 'bg-green-100 text-green-800' :
              document.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {STATUS_LABELS[document.status] || document.status}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Прогресс</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {document.completedLines} / {document.totalLines}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Route Progress */}
      {route.length > 0 && (
        <RouteProgress route={route} currentCellId={currentCell} />
      )}

      {/* Scanner Input */}
      <ScannerInput 
        onScan={onScanWithFeedback}
        placeholder={currentCell ? `Ячейка ${currentCellName} - сканируйте товар...` : 'Отсканируйте ячейку...'}
      />

      {currentCell && (
        <div className="flex justify-end">
          <button 
            onClick={handleSkipCell}
            className="text-sm text-gray-500 underline hover:text-brand-primary"
          >
            Пропустить ячейку →
          </button>
        </div>
      )}

      {/* Lines */}
      <div className="space-y-2">
        {lines
          .filter(l => l.cellId === currentCell)
          .map(line => (
            <PickingCard
              key={line.id}
              line={line}
              isActive={activeLineId === line.id}
              routeOrder={line.routeOrder}
            />
          ))}
      </div>

      {lines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров для подбора
          </p>
        </div>
      )}
    </div>
  );
};

export default Picking;
