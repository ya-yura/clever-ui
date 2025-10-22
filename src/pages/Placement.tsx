// === 📁 src/pages/Placement.tsx ===
// Placement module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { PlacementDocument, PlacementLine } from '@/types/placement';
import { scanFeedback } from '@/utils/feedback';
import PlacementCard from '@/components/placement/PlacementCard';
import ScanHint from '@/components/receiving/ScanHint';

const Placement: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('source');

  const [document, setDocument] = useState<PlacementDocument | null>(null);
  const [lines, setLines] = useState<PlacementLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  const { addSyncAction } = useOfflineStorage('placement');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'placement',
    syncEndpoint: '/placement/sync',
  });

  // Load document
  useEffect(() => {
    loadDocument();
  }, [id, sourceId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        // Load existing document
        let doc = await db.placementDocuments.get(id);
        let docLines = await db.placementLines.where('documentId').equals(id).toArray();

        if (!doc) {
          const response = await api.getPlacementDocument(id);
          if (response.success && response.data) {
            doc = response.data.document;
            docLines = response.data.lines;
            await db.placementDocuments.put(doc);
            await db.placementLines.bulkPut(docLines);
          }
        }

        if (doc) {
          setDocument(doc);
          setLines(docLines);
        }
      } else if (sourceId) {
        // Create from receiving document
        const receivingDoc = await db.receivingDocuments.get(sourceId);
        const receivingLines = await db.receivingLines.where('documentId').equals(sourceId).toArray();

        if (receivingDoc && receivingLines.length > 0) {
          const newDoc: PlacementDocument = {
            id: `PLM-${Date.now()}`,
            status: 'in_progress',
            sourceDocumentId: sourceId,
            sourceDocumentType: 'receiving',
            totalLines: receivingLines.length,
            completedLines: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          const newLines: PlacementLine[] = receivingLines.map((rLine, index) => ({
            id: `PLM-${Date.now()}-L${index + 1}`,
            documentId: newDoc.id,
            productId: rLine.productId,
            productName: rLine.productName,
            productSku: rLine.productSku,
            barcode: rLine.barcode,
            quantity: rLine.quantityFact,
            quantityPlan: rLine.quantityFact,
            quantityFact: 0,
            status: 'pending' as const,
          }));

          await db.placementDocuments.add(newDoc);
          await db.placementLines.bulkPut(newLines);

          setDocument(newDoc);
          setLines(newLines);
        }
      } else {
        // Create new document
        const newDoc: PlacementDocument = {
          id: `PLM-${Date.now()}`,
          status: 'draft',
          totalLines: 0,
          completedLines: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.placementDocuments.add(newDoc);
        setDocument(newDoc);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scan
  const handleScan = async (code: string) => {
    if (!document) return;

    // Check if it's a cell barcode (starts with CELL-)
    if (code.startsWith('CELL-')) {
      setCurrentCell(code);
      scanFeedback(true, `Ячейка ${code} активирована`);
      return;
    }

    // It's a product barcode
    if (!currentCell) {
      scanFeedback(false, 'Сначала отсканируйте ячейку');
      return;
    }

    // Find product by barcode
    const line = lines.find(l => 
      (l.barcode === code || l.productSku === code) && 
      l.status !== 'completed'
    );

    if (line) {
      // Check if suggested cell matches
      const cellMatch = !line.suggestedCellId || line.suggestedCellId === currentCell;
      
      if (!cellMatch) {
        if (confirm(`Рекомендуемая ячейка: ${line.suggestedCellName}. Разместить в ${currentCell}?`)) {
          await placeProduct(line, currentCell);
        } else {
          scanFeedback(false, 'Размещение отменено');
        }
      } else {
        await placeProduct(line, currentCell);
      }
    } else {
      scanFeedback(false, 'Товар не найден или уже размещён');
    }
  };

  const placeProduct = async (line: PlacementLine, cellId: string) => {
    const updatedLine: PlacementLine = {
      ...line,
      cellId,
      cellName: cellId,
      verifiedCellId: cellId,
      quantityFact: line.quantityFact + 1,
      status: line.quantityFact + 1 >= line.quantityPlan ? 'completed' : 'partial',
      placedAt: Date.now(),
    };

    await db.placementLines.update(line.id, updatedLine);
    await addSyncAction('place_product', updatedLine);

    setLines(prev => prev.map(l => l.id === line.id ? updatedLine : l));
    scanFeedback(true, `Размещено: ${line.productName} в ${cellId}`);

    // Update document progress
    updateDocumentProgress();

    // Set active line
    setActiveLineId(line.id);
    setTimeout(() => setActiveLineId(null), 2000);
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
      updatedAt: Date.now(),
    };

    await db.placementDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
  };

  // Complete document
  const completeDocument = async () => {
    if (!document) return;

    const updatedDoc = {
      ...document,
      status: 'completed' as const,
      updatedAt: Date.now(),
    };

    await db.placementDocuments.update(document.id, updatedDoc);
    await addSyncAction('complete', updatedDoc);

    setDocument(updatedDoc);
    sync();

    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏷️ Размещение
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Документ: {document.id}
            </p>
            {currentCell && (
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                📍 Текущая ячейка: {currentCell}
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
              className="bg-purple-600 h-2 rounded-full transition-all"
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
            ✅ Завершить размещение
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

      {/* Scan Hint */}
      <ScanHint 
        lastScan={lastScan}
        hint={currentCell ? 'Сканируйте товар для размещения' : 'Сканируйте ячейку хранения'}
      />

      {/* Lines */}
      <div className="space-y-2">
        {lines
          .sort((a, b) => {
            // Show pending first, then partial, then completed
            const statusOrder = { pending: 0, partial: 1, completed: 2 };
            return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          })
          .map(line => (
            <PlacementCard
              key={line.id}
              line={line}
              isActive={activeLineId === line.id}
            />
          ))}
      </div>

      {lines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров для размещения
          </p>
        </div>
      )}
    </div>
  );
};

export default Placement;
