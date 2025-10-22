// === 📁 src/pages/Receiving.tsx ===
// Receiving module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { ReceivingDocument, ReceivingLine } from '@/types/receiving';
import { scanFeedback } from '@/utils/feedback';
import ReceivingCard from '@/components/receiving/ReceivingCard';
import ScanHint from '@/components/receiving/ScanHint';

const Receiving: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<ReceivingDocument | null>(null);
  const [lines, setLines] = useState<ReceivingLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');

  const { addSyncAction } = useOfflineStorage('receiving');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'receiving',
    syncEndpoint: '/receiving/sync',
  });

  // Load document
  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        // Try to load from local DB first
        let doc = await db.receivingDocuments.get(id);
        let docLines = await db.receivingLines.where('documentId').equals(id).toArray();

        // If not found locally, fetch from server
        if (!doc) {
          const response = await api.getReceivingDocument(id);
          if (response.success && response.data) {
            doc = response.data.document;
            docLines = response.data.lines;
            // Save to local DB
            await db.receivingDocuments.put(doc);
            await db.receivingLines.bulkPut(docLines);
          }
        }

        if (doc) {
          setDocument(doc);
          setLines(docLines);
        }
      } else {
        // Create new document
        const newDoc: ReceivingDocument = {
          id: `RCV-${Date.now()}`,
          status: 'draft',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          totalLines: 0,
          completedLines: 0,
        };
        await db.receivingDocuments.add(newDoc);
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

    // Check if it's a document barcode
    if (code.startsWith('DOC-')) {
      // Load document
      navigate(`/receiving/${code}`);
      return;
    }

    // Find product by barcode
    const line = lines.find(l => l.barcode === code || l.productSku === code);
    
    if (line) {
      // Increment fact
      const updatedLine = {
        ...line,
        quantityFact: line.quantityFact + 1,
        status: line.quantityFact + 1 >= line.quantityPlan ? 'completed' : 'partial' as const,
      };

      await db.receivingLines.update(line.id, updatedLine);
      await addSyncAction('update_line', updatedLine);
      
      // Refresh lines
      setLines(prev => prev.map(l => l.id === line.id ? updatedLine : l));
      
      scanFeedback(true, `Добавлено: ${line.productName}`);
      
      // Update document progress
      updateDocumentProgress();
    } else {
      scanFeedback(false, 'Товар не найден в документе');
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
      updatedAt: Date.now(),
    };

    await db.receivingDocuments.update(document.id, updatedDoc);
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

    await db.receivingDocuments.update(document.id, updatedDoc);
    await addSyncAction('complete', updatedDoc);
    
    setDocument(updatedDoc);
    sync();

    // Navigate to placement
    if (confirm('Документ завершён. Перейти к размещению?')) {
      navigate(`/placement?source=${document.id}`);
    }
  };

  const adjustQuantity = async (lineId: string, delta: number) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    const newFact = Math.max(0, line.quantityFact + delta);
    const updatedLine = {
      ...line,
      quantityFact: newFact,
      status: newFact >= line.quantityPlan ? 'completed' : newFact > 0 ? 'partial' : 'pending' as const,
    };

    await db.receivingLines.update(lineId, updatedLine);
    await addSyncAction('update_line', updatedLine);
    
    setLines(prev => prev.map(l => l.id === lineId ? updatedLine : l));
    updateDocumentProgress();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              📦 Приёмка
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Документ: {document.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <span className="status-warning">
                {pendingCount} не синхр.
              </span>
            )}
            <span className={`status-badge ${
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
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={completeDocument}
            disabled={document.completedLines < document.totalLines}
            className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Завершить приёмку
          </button>
          <button
            onClick={() => sync()}
            disabled={isSyncing || pendingCount === 0}
            className="btn-secondary"
          >
            {isSyncing ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Scan Hint */}
      <ScanHint lastScan={lastScan} />

      {/* Lines */}
      <div className="space-y-2">
        {lines.map(line => (
          <ReceivingCard
            key={line.id}
            line={line}
            onAdjust={(delta) => adjustQuantity(line.id, delta)}
          />
        ))}
      </div>

      {lines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров в документе. Отсканируйте документ для загрузки.
          </p>
        </div>
      )}
    </div>
  );
};

export default Receiving;
