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
import { scanFeedback, feedback } from '@/utils/feedback';
import { STATUS_LABELS } from '@/types/document';
import ReceivingCard from '@/components/receiving/ReceivingCard';
import ScannerInput from '@/components/ScannerInput';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

const Receiving: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<ReceivingDocument | null>(null);
  const [lines, setLines] = useState<ReceivingLine[]>([]);
  const [documents, setDocuments] = useState<ReceivingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCell, setCurrentCell] = useState<string>('');
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  const { addSyncAction } = useOfflineStorage('receiving');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'receiving',
    syncEndpoint: '/receiving/sync',
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
        title: 'Приёмка',
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
        // Load specific document
        const doc = await db.receivingDocuments.get(id);
        const docLines = await db.receivingLines.where('documentId').equals(id).toArray();

        if (doc) {
          setDocument(doc);
          setLines(docLines);
        }
      } else {
        // Load all documents
        const allDocs = await db.receivingDocuments.toArray();
        setDocuments(allDocs);
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

    await db.receivingDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
    
    // Auto-complete and navigate when all done
    if (allCompleted && document.status !== 'completed') {
      await addSyncAction('complete', updatedDoc);
      sync();
      
      // Show success feedback
      feedback.success('Приёмка завершена!');
      
      // Navigate after short delay
      setTimeout(() => {
        if (confirm('Документ завершён. Перейти к размещению?')) {
          navigate(`/placement?source=${document.id}`);
        } else {
          navigate('/receiving');
        }
      }, 500);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#86e0cb]"></div>
      </div>
    );
  }

  // Show document list if no id specified
  if (!id) {
    return (
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[#a7a7a7]">
              Нет документов приёмки
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/receiving/${doc.id}`)}
                className="card hover:shadow-lg hover:border-[#86e0cb] transition-all text-left p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e3e3dd]">
                      {doc.id}
                    </h3>
                    {doc.supplier && (
                      <p className="text-sm text-[#a7a7a7] mt-1">
                        Поставщик: {doc.supplier}
                      </p>
                    )}
                    {doc.deliveryNumber && (
                      <p className="text-sm text-[#a7a7a7]">
                        Номер поставки: {doc.deliveryNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={
                      doc.status === 'completed' ? 'status-success' :
                      doc.status === 'in_progress' ? 'status-warning' :
                      'status-pending'
                    }>
                      {doc.status === 'completed' ? 'Завершен' :
                       doc.status === 'in_progress' ? 'В работе' :
                       'Ожидает'}
                    </span>
                    <p className="text-sm text-[#a7a7a7] mt-2">
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
        <p className="text-[#a7a7a7]">Документ не найден</p>
      </div>
    );
  }

  const progress = document.totalLines > 0 
    ? (document.completedLines / document.totalLines) * 100 
    : 0;

  return (
    <div className="space-y-3">
      {/* Scanner Input */}
      <ScannerInput 
        onScan={onScanWithFeedback}
        placeholder="Отсканируйте товар или документ..."
      />

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
        <div className="card text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров в документе. Отсканируйте документ для загрузки.
          </p>
        </div>
      )}
    </div>
  );
};

export default Receiving;
