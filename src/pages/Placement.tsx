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
import { scanFeedback, feedback } from '@/utils/feedback';
import { STATUS_LABELS } from '@/types/document';
import PlacementCard from '@/components/placement/PlacementCard';
import ScannerInput from '@/components/ScannerInput';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { LineStatus } from '@/types/common';

const PLACEMENT_STATUS_ORDER: Record<LineStatus, number> = {
  pending: 0,
  partial: 1,
  completed: 2,
  error: 3,
  mismatch: 4,
};

const Placement: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('source');

  const [document, setDocument] = useState<PlacementDocument | null>(null);
  const [lines, setLines] = useState<PlacementLine[]>([]);
  const [documents, setDocuments] = useState<PlacementDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [history, setHistory] = useState<{lineId: string, prevLine: PlacementLine}[]>([]);
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  const { addSyncAction } = useOfflineStorage('placement');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'placement',
    syncEndpoint: '/placement/sync',
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
        title: 'Размещение',
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
            docLines = response.data.lines || [];

            if (doc) {
              await db.placementDocuments.put(doc);
            }

            if (docLines.length) {
              await db.placementLines.bulkPut(docLines);
            }
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
      } else if (!sourceId) {
        // Load all documents
        const allDocs = await db.placementDocuments.toArray();
        setDocuments(allDocs);
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
    // Save history
    setHistory(prev => [...prev, { lineId: line.id, prevLine: { ...line } }]);

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

  const handleUndo = async () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    const { lineId, prevLine } = lastAction;

    await db.placementLines.update(lineId, prevLine);
    await addSyncAction('update_line', prevLine); // Using generic update for undo

    setLines(prev => prev.map(l => l.id === lineId ? prevLine : l));
    setHistory(prev => prev.slice(0, -1));
    
    scanFeedback(true, 'Действие отменено');
    feedback.warning('Отмена последнего действия');
    
    // Re-calc progress
    // (updateDocumentProgress will be called indirectly or we can call it)
    // We need to update doc progress based on reverted line
    const doc = await db.placementDocuments.get(document!.id);
    if (doc) {
       // recalculate locally
       const currentLines = await db.placementLines.where('documentId').equals(doc.id).toArray();
       const completedLines = currentLines.filter(l => l.status === 'completed').length;
       const updatedDoc = { ...doc, completedLines, updatedAt: Date.now() };
       await db.placementDocuments.update(doc.id, updatedDoc);
       setDocument(updatedDoc);
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

    await db.placementDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
    
    // Auto-complete and navigate when all done
    if (allCompleted && document.status !== 'completed') {
      await addSyncAction('complete', updatedDoc);
      sync();
      
      // Show success feedback
      feedback.success('Размещение завершено!');
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/placement');
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              Нет документов размещения
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/placement/${doc.id}`)}
                className="card hover:shadow-lg transition-shadow text-left p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {doc.id}
                    </h3>
                    {doc.sourceDocument && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Источник: {doc.sourceDocument}
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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="card-compact">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Документ: {document.id}
            </p>
            {currentCell && (
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                📍 {currentCell}
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
              className="bg-purple-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scanner Input */}
      <ScannerInput 
        onScan={onScanWithFeedback}
        placeholder={currentCell ? 'Отсканируйте товар...' : 'Отсканируйте ячейку...'}
      />

      {/* Actions */}
      {history.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleUndo}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            ↩ Отменить последнее
          </button>
        </div>
      )}

      {/* Lines */}
      <div className="space-y-2">
        {lines
          .sort((a, b) => {
            return (PLACEMENT_STATUS_ORDER[a.status] ?? 99) - (PLACEMENT_STATUS_ORDER[b.status] ?? 99);
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
        <div className="card text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров для размещения
          </p>
        </div>
      )}
    </div>
  );
};

export default Placement;
