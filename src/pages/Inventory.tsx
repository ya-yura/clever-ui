// === 📁 src/pages/Inventory.tsx ===
// Inventory module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { InventoryDocument, InventoryLine } from '@/types/inventory';
import { scanFeedback } from '@/utils/feedback';
import { speak } from '@/utils/voice';
import ScanHint from '@/components/receiving/ScanHint';

const Inventory: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState<InventoryDocument | null>(null);
  const [lines, setLines] = useState<InventoryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [discrepancyLines, setDiscrepancyLines] = useState<InventoryLine[]>([]);

  const { addSyncAction } = useOfflineStorage('inventory');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'inventory',
    syncEndpoint: '/inventory/sync',
  });

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        let doc = await db.inventoryDocuments.get(id);
        let docLines = await db.inventoryLines.where('documentId').equals(id).toArray();

        if (!doc) {
          const response = await api.getInventoryDocument(id);
          if (response.success && response.data) {
            doc = response.data.document;
            docLines = response.data.lines;
            await db.inventoryDocuments.put(doc);
            await db.inventoryLines.bulkPut(docLines);
          }
        }

        if (doc) {
          setDocument(doc);
          setLines(docLines);

          // Set first cell as current
          if (docLines.length > 0) {
            const firstCell = docLines.find(l => l.status !== 'completed');
            if (firstCell) {
              setCurrentCell(firstCell.cellId);
            }
          }
        }
      } else {
        // Create new document
        const newDoc: InventoryDocument = {
          id: `INV-${Date.now()}`,
          status: 'in_progress',
          type: 'full',
          totalLines: 0,
          completedLines: 0,
          discrepanciesCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.inventoryDocuments.add(newDoc);
        setDocument(newDoc);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

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
          speak(`Начните пересчёт ячейки ${firstPending.cellName}`);
        } else {
          scanFeedback(true, `Ячейка ${cellLines[0].cellName} - уже пересчитана`);
        }

        // Update document current cell
        const updatedDoc = {
          ...document,
          currentCellId: code,
          updatedAt: Date.now(),
        };
        await db.inventoryDocuments.update(document.id, updatedDoc);
        setDocument(updatedDoc);
      } else {
        // New cell - create lines for it (simplified: in real app would fetch from server)
        scanFeedback(true, `Новая ячейка ${code}`);
        setCurrentCell(code);
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
      l.cellId === currentCell
    );

    if (line) {
      await countProduct(line);
    } else {
      // Product not found in system for this cell
      if (confirm('Товар не найден в системе для этой ячейки. Добавить как излишек?')) {
        await addSurplus(code);
      }
    }
  };

  const countProduct = async (line: InventoryLine) => {
    const updatedLine: InventoryLine = {
      ...line,
      quantityFact: line.quantityFact + 1,
      discrepancy: line.quantitySystem - (line.quantityFact + 1),
      status: 'completed',
      countedAt: Date.now(),
    };

    await db.inventoryLines.update(line.id, updatedLine);
    await addSyncAction('count_product', updatedLine);

    setLines(prev => prev.map(l => l.id === line.id ? updatedLine : l));
    scanFeedback(true, `Посчитано: ${line.productName}`);

    // Check for discrepancy
    if (Math.abs(updatedLine.discrepancy) > 0) {
      scanFeedback(false, `Расхождение: ${updatedLine.discrepancy > 0 ? 'недостача' : 'излишек'}`);
      speak(`Внимание! Расхождение`);
    }

    updateDocumentProgress();
  };

  const addSurplus = async (code: string) => {
    if (!document || !currentCell) return;

    const newLine: InventoryLine = {
      id: `${document.id}-L${Date.now()}`,
      documentId: document.id,
      productId: `P${Date.now()}`,
      productName: `Товар ${code}`,
      productSku: code,
      barcode: code,
      quantity: 1,
      quantityPlan: 1,
      quantityFact: 1,
      quantitySystem: 0,
      discrepancy: -1,
      cellId: currentCell,
      cellName: currentCell,
      status: 'completed',
      countedAt: Date.now(),
    };

    await db.inventoryLines.add(newLine);
    await addSyncAction('add_surplus', newLine);

    setLines(prev => [...prev, newLine]);
    scanFeedback(true, 'Излишек добавлен');

    updateDocumentProgress();
  };

  const { lastScan } = useScanner({
    mode: 'keyboard',
    onScan: handleScan,
  });

  const updateDocumentProgress = async () => {
    if (!document) return;

    const completedLines = lines.filter(l => l.status === 'completed').length;
    const discrepancies = lines.filter(l => Math.abs(l.discrepancy) > 0).length;

    const updatedDoc = {
      ...document,
      completedLines,
      discrepanciesCount: discrepancies,
      updatedAt: Date.now(),
    };

    await db.inventoryDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
  };

  const showDiscrepanciesReport = () => {
    const discrepLines = lines.filter(l => Math.abs(l.discrepancy) > 0);
    setDiscrepancyLines(discrepLines);
    setShowDiscrepancyModal(true);
  };

  const completeDocument = async () => {
    if (!document) return;

    const updatedDoc: InventoryDocument = {
      ...document,
      status: 'completed',
      updatedAt: Date.now(),
    };

    await db.inventoryDocuments.update(document.id, updatedDoc);
    await addSyncAction('complete', updatedDoc);

    setDocument(updatedDoc);
    sync();

    scanFeedback(true, 'Инвентаризация завершена!');
    speak('Инвентаризация завершена');
    setTimeout(() => navigate('/'), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              🧮 Инвентаризация
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Документ: {document.id}
            </p>
            {currentCell && (
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                📍 Текущая ячейка: {currentCellName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                {pendingCount} не синхр.
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              document.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-indigo-100 text-indigo-800'
            }`}>
              {document.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {document.completedLines}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Пересчитано</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {document.discrepanciesCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Расхождений</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Прогресс</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={completeDocument}
            disabled={document.completedLines < document.totalLines}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
          >
            ✅ Завершить пересчёт
          </button>
          <button
            onClick={showDiscrepanciesReport}
            disabled={document.discrepanciesCount === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-yellow-700"
          >
            🧾 Расхождения
          </button>
          <button
            onClick={() => sync()}
            disabled={isSyncing || pendingCount === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300"
          >
            {isSyncing ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Scan Hint */}
      <ScanHint
        lastScan={lastScan}
        hint={currentCell ? `Пересчитайте товары в ячейке ${currentCellName}` : 'Сканируйте ячейку для начала пересчёта'}
      />

      {/* Lines */}
      <div className="space-y-2">
        {lines
          .filter(l => l.cellId === currentCell)
          .map(line => {
            const hasDiscrepancy = Math.abs(line.discrepancy) > 0;
            const statusColor =
              line.status === 'completed' && !hasDiscrepancy ? 'bg-green-100 border-green-500 dark:bg-green-900' :
              line.status === 'completed' && hasDiscrepancy ? 'bg-red-100 border-red-500 dark:bg-red-900' :
              'bg-gray-100 border-gray-300 dark:bg-gray-700';

            return (
              <div key={line.id} className={`card border-2 ${statusColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">
                        {line.status === 'completed' && !hasDiscrepancy ? '✅' :
                         line.status === 'completed' && hasDiscrepancy ? '⚠️' : '⚪'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {line.productName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Артикул: {line.productSku}
                        </p>
                      </div>
                    </div>

                    {/* Quantities */}
                    <div className="grid grid-cols-3 gap-2 text-center mt-3">
                      <div className="bg-white dark:bg-gray-800 rounded p-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Система</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {line.quantitySystem}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Факт</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {line.quantityFact}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded p-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Разница</div>
                        <div className={`text-lg font-bold ${
                          line.discrepancy === 0 ? 'text-green-600 dark:text-green-400' :
                          line.discrepancy > 0 ? 'text-red-600 dark:text-red-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {line.discrepancy > 0 ? '-' : line.discrepancy < 0 ? '+' : ''}
                          {Math.abs(line.discrepancy)}
                        </div>
                      </div>
                    </div>

                    {hasDiscrepancy && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded text-center">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                          {line.discrepancy > 0 ? '⚠️ Недостача' : '⚠️ Излишек'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {lines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров. Отсканируйте ячейку для начала.
          </p>
        </div>
      )}

      {/* Discrepancy Modal */}
      {showDiscrepancyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🧾 Отчёт по расхождениям
            </h3>
            <div className="space-y-2 mb-4">
              {discrepancyLines.map(line => (
                <div key={line.id} className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {line.productName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Ячейка: {line.cellName} | Артикул: {line.productSku}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Система: {line.quantitySystem} | Факт: {line.quantityFact}
                      </div>
                      <div className={`text-lg font-bold ${
                        line.discrepancy > 0 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {line.discrepancy > 0 ? 'Недостача: ' : 'Излишек: '}
                        {Math.abs(line.discrepancy)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDiscrepancyModal(false)}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
