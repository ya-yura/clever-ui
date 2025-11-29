// === 📁 src/pages/Return.tsx ===
// Return/Write-off module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { db } from '@/services/db';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { ReturnDocument, ReturnLine, ReturnType, ReturnReason } from '@/types/return';
import { scanFeedback, feedback } from '@/utils/feedback';
import { STATUS_LABELS } from '@/types/document';
import ScannerInput from '@/components/ScannerInput';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

const Return: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState<ReturnDocument | null>(null);
  const [lines, setLines] = useState<ReturnLine[]>([]);
  const [documents, setDocuments] = useState<ReturnDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReturnReason | ''>('');
  const [customReason, setCustomReason] = useState('');
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  const { addSyncAction } = useOfflineStorage('return');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'return',
    syncEndpoint: document?.type === 'return' ? '/return/sync' : '/writeoff/sync',
  });

  // Update header with document info or list info
  useEffect(() => {
    if (document && id) {
      const title = document.type === 'return' ? 'Возврат' : 'Списание';
      setDocumentInfo({
        documentId: document.id,
        completed: lines.filter(l => l.reason).length,
        total: lines.length,
      });
      setListInfo(null);
    } else if (!id) {
      setDocumentInfo(null);
      setListInfo({
        title: 'Возврат',
        count: documents.length,
      });
    }
    
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [document, id, documents.length, lines.length, lines, setDocumentInfo, setListInfo]);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        const doc = await db.returnDocuments.get(id);
        const docLines = await db.returnLines.where('documentId').equals(id).toArray();

        if (doc) {
          setDocument(doc);
          setLines(docLines);
        }
      } else {
        // Load all documents
        const allDocs = await db.returnDocuments.toArray();
        setDocuments(allDocs);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (type: ReturnType) => {
    const newDoc: ReturnDocument = {
      id: `${type.toUpperCase()}-${Date.now()}`,
      status: 'in_progress',
      type,
      totalLines: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.returnDocuments.add(newDoc);
    setDocument(newDoc);
    setShowTypeSelector(false);
  };

  const handleScan = async (code: string) => {
    if (!document) return;

    // Check if product already in lines
    const existingLine = lines.find(l => l.barcode === code || l.productSku === code);

    if (existingLine) {
      scanFeedback(false, 'Товар уже добавлен');
      return;
    }

    // Create new line (in real app, we'd fetch product info from API)
    const newLine: ReturnLine = {
      id: `${document.id}-L${lines.length + 1}`,
      documentId: document.id,
      productId: `P${Date.now()}`,
      productName: `Товар ${code}`,
      productSku: code,
      barcode: code,
      quantity: 1,
      quantityPlan: 1,
      quantityFact: 1,
      status: 'pending',
      addedAt: Date.now(),
    };

    await db.returnLines.add(newLine);
    await addSyncAction('add_line', newLine);

    setLines(prev => [...prev, newLine]);
    scanFeedback(true, 'Товар добавлен');

    // Update document
    const updatedDoc = {
      ...document,
      totalLines: lines.length + 1,
      updatedAt: Date.now(),
    };
    await db.returnDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);

    // Show reason modal
    setSelectedLineId(newLine.id);
    setShowReasonModal(true);
  };

  const { handleScan: onScanWithFeedback, lastScan } = useScanner({
    mode: 'keyboard',
    onScan: handleScan,
  });

  const saveReason = async () => {
    if (!selectedLineId || !selectedReason) return;

    const line = lines.find(l => l.id === selectedLineId);
    if (!line) return;

    const updatedLine: ReturnLine = {
      ...line,
      reason: selectedReason,
      reasonText: selectedReason === 'other' ? customReason : undefined,
      status: 'completed',
    };

    await db.returnLines.update(selectedLineId, updatedLine);
    await addSyncAction('update_reason', updatedLine);

    setLines(prev => prev.map(l => l.id === selectedLineId ? updatedLine : l));

    // Reset modal
    setShowReasonModal(false);
    setSelectedLineId(null);
    setSelectedReason('');
    setCustomReason('');
    
    // Check if all lines now have reasons - auto-complete if yes
    const allHaveReasons = lines.every(l => 
      l.id === selectedLineId ? true : l.reason
    );
    
    if (allHaveReasons && lines.length > 0 && document?.status !== 'completed') {
      // Автоматически завершаем документ
      setTimeout(() => completeDocument(), 300);
    }
  };

  const completeDocument = async () => {
    if (!document) return;

    // Check if all lines have reasons
    const missingReasons = lines.filter(l => !l.reason);
    if (missingReasons.length > 0) {
      alert('Укажите причину для всех товаров');
      return;
    }

    const updatedDoc: ReturnDocument = {
      ...document,
      status: 'completed',
      updatedAt: Date.now(),
    };

    await db.returnDocuments.update(document.id, updatedDoc);
    await addSyncAction('complete', updatedDoc);

    setDocument(updatedDoc);
    sync();

    feedback.success('Документ завершён!');
    setTimeout(() => navigate('/return'), 500);
  };

  const removeProduct = async (lineId: string) => {
    await db.returnLines.delete(lineId);
    setLines(prev => prev.filter(l => l.id !== lineId));

    if (document) {
      const updatedDoc = {
        ...document,
        totalLines: lines.length - 1,
        updatedAt: Date.now(),
      };
      await db.returnDocuments.update(document.id, updatedDoc);
      setDocument(updatedDoc);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show document list if no id specified
  if (!id) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowTypeSelector(true)}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:brightness-90 transition-colors"
          >
            + Создать
          </button>
        </div>

        {showTypeSelector && (
          <div className="card text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Выберите тип документа
            </h3>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => createDocument('return')}
                className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:brightness-90 transition-colors"
              >
                ♻️ Возврат
              </button>
              <button
                onClick={() => createDocument('writeoff')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                🗑️ Списание
              </button>
              <button
                onClick={() => setShowTypeSelector(false)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {documents.length === 0 && !showTypeSelector ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Нет документов возврата или списания
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/return/${doc.id}`)}
                className="card hover:shadow-lg transition-shadow text-left p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {doc.type === 'return' ? '♻️' : '🗑️'} {doc.id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {doc.type === 'return' ? 'Возврат' : 'Списание'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${
                      doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                      doc.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status === 'completed' ? 'Завершен' :
                       doc.status === 'in_progress' ? 'В работе' :
                       'Ожидает'}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {doc.totalLines} {doc.totalLines === 1 ? 'строка' : doc.totalLines < 5 ? 'строки' : 'строк'}
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

  const reasons: { value: ReturnReason; label: string }[] = [
    { value: 'damaged', label: '🔨 Брак / Повреждение' },
    { value: 'expired', label: '📅 Срок годности истёк' },
    { value: 'wrong_item', label: '❌ Ошибка комплектации' },
    { value: 'customer_return', label: '↩️ Возврат от клиента' },
    { value: 'other', label: '📝 Другое' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Документ: {document.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {pendingCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                {pendingCount} не синхр.
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              document.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {STATUS_LABELS[document.status] || document.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {lines.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Всего позиций</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {lines.filter(l => l.reason).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">С причиной</div>
          </div>
        </div>
      </div>

      {/* Scanner Input */}
      <ScannerInput 
        onScan={onScanWithFeedback}
        placeholder="Отсканируйте товар..."
      />

      {/* Lines */}
      <div className="space-y-2">
        {lines.map(line => (
          <div
            key={line.id}
            className={`card border-2 ${
              line.reason
                ? 'bg-green-50 border-green-500 dark:bg-green-900'
                : 'bg-red-50 border-red-500 dark:bg-red-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {line.productName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Артикул: {line.productSku}
                </p>
                {line.reason && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Причина:
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {reasons.find(r => r.value === line.reason)?.label || line.reasonText}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!line.reason && (
                  <button
                    onClick={() => {
                      setSelectedLineId(line.id);
                      setShowReasonModal(true);
                    }}
                    className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:brightness-90"
                  >
                    Указать причину
                  </button>
                )}
                <button
                  onClick={() => removeProduct(line.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Photo Button */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  alert('Функция фотофиксации будет доступна в следующей версии');
                  // In real app: open camera -> save photo blob -> update line.photo
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition-colors"
              >
                <Camera size={16} />
                <span>Добавить фото</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {lines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Нет товаров. Отсканируйте товары для добавления.
          </p>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Укажите причину
            </h3>
            <div className="space-y-2 mb-4">
              {reasons.map(reason => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
                    selectedReason === reason.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
            {selectedReason === 'other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Опишите причину"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                rows={3}
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={saveReason}
                disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-green-700"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedLineId(null);
                  setSelectedReason('');
                  setCustomReason('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Return;
