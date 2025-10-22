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
import { scanFeedback } from '@/utils/feedback';
import { speak } from '@/utils/voice';
import PickingCard from '@/components/picking/PickingCard';
import RouteProgress from '@/components/picking/RouteProgress';
import ScanHint from '@/components/receiving/ScanHint';

const Picking: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState<PickingDocument | null>(null);
  const [lines, setLines] = useState<PickingLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  const { addSyncAction } = useOfflineStorage('picking');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'picking',
    syncEndpoint: '/picking/sync',
  });

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
            docLines = response.data.lines;
            await db.pickingDocuments.put(doc);
            await db.pickingLines.bulkPut(docLines);
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
        // Create new document
        const newDoc: PickingDocument = {
          id: `PICK-${Date.now()}`,
          status: 'draft',
          orderId: '',
          orderNumber: '',
          totalLines: 0,
          completedLines: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.pickingDocuments.add(newDoc);
        setDocument(newDoc);
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
    }
  };

  const { lastScan } = useScanner({
    mode: 'keyboard',
    onScan: handleScan,
  });

  // Update document progress
  const updateDocumentProgress = async () => {
    if (!document) return;

    const completedLines = lines.filter(l => l.status === 'completed').length;
    const updatedDoc = {
      ...document,
      completedLines,
      status: completedLines === lines.length ? 'completed' as const : document.status,
      updatedAt: Date.now(),
    };

    await db.pickingDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);

    // Auto-complete if all lines done
    if (completedLines === lines.length && lines.length > 0) {
      scanFeedback(true, 'Подбор завершён!');
      speak('Подбор завершён');
    }
  };

  // Complete document
  const completeDocument = async () => {
    if (!document) return;

    const updatedDoc = {
      ...document,
      status: 'completed' as const,
      updatedAt: Date.now(),
    };

    await db.pickingDocuments.update(document.id, updatedDoc);
    await addSyncAction('complete', updatedDoc);

    setDocument(updatedDoc);
    sync();

    // Navigate to shipment
    if (confirm('Подбор завершён. Перейти к отгрузке?')) {
      navigate(`/shipment?source=${document.id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🚚 Подбор
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Заказ: {document.orderNumber || document.id}
            </p>
            {document.customer && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Клиент: {document.customer}
              </p>
            )}
            {currentCell && (
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                📍 Текущая ячейка: {currentCellName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-sm">
                {pendingCount} не синхр.
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              document.status === 'completed' ? 'bg-green-100 text-green-800' :
              document.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {document.status}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Прогресс</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {document.completedLines} / {document.totalLines}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={completeDocument}
            disabled={document.completedLines < document.totalLines}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            ✅ Завершить подбор
          </button>
          <button
            onClick={() => sync()}
            disabled={isSyncing || pendingCount === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isSyncing ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Route Progress */}
      {route.length > 0 && (
        <RouteProgress route={route} currentCellId={currentCell} />
      )}

      {/* Scan Hint */}
      <ScanHint
        lastScan={lastScan}
        hint={currentCell ? `Подберите товары из ячейки ${currentCellName}` : 'Сканируйте ячейку для начала подбора'}
      />

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
