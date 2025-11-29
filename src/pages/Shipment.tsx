// === 📁 src/pages/Shipment.tsx ===
// Shipment module page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/services/db';
import { api } from '@/services/api';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useSync } from '@/hooks/useSync';
import { ShipmentDocument, ShipmentLine } from '@/types/shipment';
import { scanFeedback, feedback } from '@/utils/feedback';
import { STATUS_LABELS } from '@/types/document';
import ScannerInput from '@/components/ScannerInput';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

const Shipment: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('source');

  const [document, setDocument] = useState<ShipmentDocument | null>(null);
  const [lines, setLines] = useState<ShipmentLine[]>([]);
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTtnModal, setShowTtnModal] = useState(false);
  const [ttnNumber, setTtnNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  const { addSyncAction } = useOfflineStorage('shipment');
  const { sync, isSyncing, pendingCount } = useSync({
    module: 'shipment',
    syncEndpoint: '/shipment/sync',
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
        title: 'Отгрузка',
        count: documents.length,
      });
    }
    
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [document, id, documents.length, setDocumentInfo, setListInfo]);

  useEffect(() => {
    loadDocument();
  }, [id, sourceId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      if (id) {
        let doc = await db.shipmentDocuments.get(id);
        let docLines = await db.shipmentLines.where('documentId').equals(id).toArray();

        if (!doc) {
          const response = await api.getShipmentDocument(id);
          if (response.success && response.data) {
            doc = response.data.document;
            docLines = response.data.lines || [];

            if (doc) {
              await db.shipmentDocuments.put(doc);
            }

            if (docLines.length) {
              await db.shipmentLines.bulkPut(docLines);
            }
          }
        }

        if (doc) {
          setDocument(doc);
          setLines(docLines);
        }
      } else if (sourceId) {
        // Create from picking document
        const pickingDoc = await db.pickingDocuments.get(sourceId);
        const pickingLines = await db.pickingLines.where('documentId').equals(sourceId).toArray();

        if (pickingDoc && pickingLines.length > 0) {
          const newDoc: ShipmentDocument = {
            id: `SHIP-${Date.now()}`,
            status: 'in_progress',
            orderId: pickingDoc.orderId,
            orderNumber: pickingDoc.orderNumber,
            customer: pickingDoc.customer,
            deliveryAddress: pickingDoc.deliveryAddress,
            totalLines: pickingLines.length,
            completedLines: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          const newLines: ShipmentLine[] = pickingLines.map((pLine, index) => ({
            id: `SHIP-${Date.now()}-L${index + 1}`,
            documentId: newDoc.id,
            productId: pLine.productId,
            productName: pLine.productName,
            productSku: pLine.productSku,
            barcode: pLine.barcode,
            quantity: pLine.quantityFact,
            quantityPlan: pLine.quantityFact,
            quantityFact: 0,
            status: 'pending' as const,
          }));

          await db.shipmentDocuments.add(newDoc);
          await db.shipmentLines.bulkPut(newLines);

          setDocument(newDoc);
          setLines(newLines);
        }
      } else {
        // Load all documents
        const allDocs = await db.shipmentDocuments.toArray();
        setDocuments(allDocs);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (code: string) => {
    if (!document) return;

    const line = lines.find(l =>
      (l.barcode === code || l.productSku === code || l.packageId === code) &&
      l.status !== 'completed'
    );

    if (line) {
      const updatedLine: ShipmentLine = {
        ...line,
        quantityFact: line.quantityFact + 1,
        status: line.quantityFact + 1 >= line.quantityPlan ? 'completed' : 'partial',
        verifiedAt: Date.now(),
      };

      await db.shipmentLines.update(line.id, updatedLine);
      await addSyncAction('verify_package', updatedLine);

      setLines(prev => prev.map(l => l.id === line.id ? updatedLine : l));
      scanFeedback(true, `Проверено: ${line.productName}`);

      updateDocumentProgress();
    } else {
      scanFeedback(false, 'Упаковка не найдена');
    }
  };

  const { handleScan: onScanWithFeedback, lastScan } = useScanner({
    mode: 'keyboard',
    onScan: handleScan,
  });

  const updateDocumentProgress = async () => {
    if (!document) return;

    const completedLines = lines.filter(l => l.status === 'completed').length;
    const totalLines = lines.length;
    
    const updatedDoc = {
      ...document,
      completedLines,
      updatedAt: Date.now(),
    };

    await db.shipmentDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
    
    // Auto-complete when all lines are done
    if (totalLines > 0 && completedLines === totalLines && document.status !== 'completed') {
      // Automatically trigger completion
      await completeDocument();
    }
  };

  const completeDocument = async () => {
    if (!document) return;

    if (!document.ttn) {
      setShowTtnModal(true);
      return;
    }

    const updatedDoc: ShipmentDocument = {
      ...document,
      status: 'completed',
      shippedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.shipmentDocuments.update(document.id, updatedDoc);
    await addSyncAction('complete_shipment', updatedDoc);

    setDocument(updatedDoc);
    sync();

    feedback.success('Отгрузка завершена!');
    setTimeout(() => navigate('/shipment'), 500);
  };

  const saveTtn = async () => {
    if (!document) return;

    const updatedDoc = {
      ...document,
      ttn: ttnNumber.trim(),
      carrier: carrier.trim(),
      updatedAt: Date.now(),
    };

    await db.shipmentDocuments.update(document.id, updatedDoc);
    setDocument(updatedDoc);
    setShowTtnModal(false);
    setTtnNumber('');
    setCarrier('');

    completeDocument();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show document list if no id or source specified
  if (!id && !sourceId) {
    return (
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Нет документов отгрузки
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/shipment/${doc.id}`)}
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
                    {doc.ttnNumber && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ТТН: {doc.ttnNumber}
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
                       'Ожидает'}
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
    <div className="space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Заказ: {document.orderNumber || document.id}
            </p>
            {document.customer && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Клиент: {document.customer}
              </p>
            )}
            {document.ttn && (
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">
                📋 ТТН: {document.ttn}
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
              'bg-orange-100 text-orange-800'
            }`}>
              {STATUS_LABELS[document.status] || document.status}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Прогресс проверки</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {document.completedLines} / {document.totalLines}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scanner Input */}
      <ScannerInput 
        onScan={onScanWithFeedback}
        placeholder="Отсканируйте упаковку..."
      />

      {/* Lines */}
      <div className="space-y-2">
        {lines.map(line => {
          const statusColor =
            line.status === 'completed' ? 'bg-green-100 border-green-500 dark:bg-green-900' :
            line.status === 'partial' ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900' :
            'bg-gray-100 border-gray-300 dark:bg-gray-700';

          return (
            <div key={line.id} className={`card border-2 ${statusColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {line.productName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Артикул: {line.productSku}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {line.quantityFact} / {line.quantityPlan}
                  </div>
                  <div className="text-2xl">
                    {line.status === 'completed' ? '✅' :
                     line.status === 'partial' ? '🟡' : '⚪'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TTN Modal */}
      {showTtnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Параметры отгрузки
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Номер ТТН *</label>
              <input
                type="text"
                value={ttnNumber}
                onChange={(e) => setTtnNumber(e.target.value)}
                placeholder="TTH-123456"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Перевозчик</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Например: СДЭК"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveTtn}
                disabled={!ttnNumber.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-orange-700"
              >
                Сохранить и завершить
              </button>
              <button
                onClick={() => setShowTtnModal(false)}
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

export default Shipment;
