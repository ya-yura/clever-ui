import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { useScanner } from '@/hooks/useScanner';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import ScannerInput from '@/components/ScannerInput';
import { OperationTypeSelector } from '@/components/return/OperationTypeSelector';
import { ReasonSelector } from '@/components/return/ReasonSelector';
import { PhotoCapture } from '@/components/return/PhotoCapture';
import { Button } from '@/design/components';
import { 
  RotateCcw, 
  Trash2, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Minus,
  Package,
  FileText
} from 'lucide-react';
import { feedback } from '@/utils/feedback';
import analytics, { EventType } from '@/lib/analytics';

/**
 * МОДУЛЬ ВОЗВРАТА/СПИСАНИЯ
 * 
 * Процесс:
 * 1. Выбор типа операции (Возврат/Списание)
 * 2. Сканирование товара
 * 3. Указание причины
 * 4. Добавление фото (опционально)
 * 5. Проверка списка
 * 6. Подтверждение операции
 */

interface ReturnLine {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  reason: string;
  comment?: string;
  photo?: string;
  timestamp: number;
}

const Return: React.FC = () => {
  const { id, docId } = useParams();
  const documentId = docId || id;
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();
  const { addSyncAction } = useOfflineStorage('return');

  // US V.1: Тип операции
  const [operationType, setOperationType] = useState<'return' | 'writeoff' | null>(null);
  
  // Документ и строки
  const [document, setDocument] = useState<any | null>(null);
  const [lines, setLines] = useState<ReturnLine[]>([]);
  const [loading, setLoading] = useState(false);

  // UI состояния
  const [showReasonSelector, setShowReasonSelector] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [selectedLineForPhoto, setSelectedLineForPhoto] = useState<ReturnLine | null>(null);

  // Сканер
  const { handleScan: onScan } = useScanner({
    mode: 'keyboard',
    continuous: true,
    onScan: handleProductScan,
  });

  // Заголовок
  useEffect(() => {
    if (documentId && document) {
      setDocumentInfo({
        documentId: document.id,
        completed: lines.length,
        total: lines.length, // Dynamic
      });
    } else if (!documentId) {
      setListInfo({ title: 'Возврат/Списание', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, lines, setDocumentInfo, setListInfo]);

  // Загрузка документа
  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const doc = await db.returnDocuments.get(documentId!);
      const docLines = doc ? await db.returnLines.where('documentId').equals(documentId!).toArray() : [];
      
      if (doc) {
        setDocument(doc);
        setOperationType(doc.operationType || null);
        setLines(docLines);
      }
    } catch (err: any) {
      console.error(err);
      feedback.error(`Ошибка загрузки: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // US V.1: Создание нового документа после выбора типа
  const handleTypeSelect = async (type: 'return' | 'writeoff') => {
    setOperationType(type);

    if (!document) {
      // Создаём новый документ
      const newDocId = `${type.toUpperCase()}-${crypto.randomUUID().substring(0, 8)}`;
      const newDoc = {
        id: newDocId,
        operationType: type,
        status: 'new',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalLines: 0,
      };

      try {
        await db.returnDocuments.add(newDoc);
        setDocument(newDoc);
        feedback.success(`Создан документ ${type === 'return' ? 'возврата' : 'списания'}`);
        
        // Обновляем URL
        navigate(`/docs/Vozvrat/${newDocId}`, { replace: true });
      } catch (err: any) {
        feedback.error(`Ошибка создания документа: ${err.message}`);
      }
    } else {
      // Обновляем существующий
      await db.returnDocuments.update(document.id, {
        operationType: type,
        updatedAt: Date.now(),
      });
      setDocument({ ...document, operationType: type });
    }
  };

  // US V.2: Сканирование товара
  async function handleProductScan(barcode: string) {
    if (!operationType) {
      feedback.error('Сначала выберите тип операции');
      return;
    }

    analytics.track(EventType.SCAN_SUCCESS, { barcode, module: 'return' });

    // Поиск товара в справочнике
    const products = await db.products.where('barcode').equals(barcode).toArray();
    const product = products[0];

    if (!product) {
      feedback.error(`Товар не найден: ${barcode}`);
      return;
    }

    // Сохраняем товар для следующего шага
    setCurrentProduct(product);
    setShowReasonSelector(true);
  }

  // US V.3: Добавление товара с причиной
  const handleReasonSubmit = async (reason: string, comment?: string) => {
    setShowReasonSelector(false);

    if (!currentProduct || !document) return;

    // Создаём новую строку
    const newLine: ReturnLine = {
      id: crypto.randomUUID(),
      productId: currentProduct.id,
      productName: currentProduct.name,
      barcode: currentProduct.barcode,
      quantity: 1,
      reason,
      comment,
      timestamp: Date.now(),
    };

    try {
      // Сохраняем в БД
      await db.returnLines.add({
        ...newLine,
        documentId: document.id,
      });

      // Обновляем локальное состояние
      setLines((prev) => [...prev, newLine]);

      // Обновляем документ
      await db.returnDocuments.update(document.id, {
        totalLines: lines.length + 1,
        updatedAt: Date.now(),
      });

      // Очищаем текущий товар
      setCurrentProduct(null);

      feedback.success(`Добавлен товар: ${currentProduct.name}`);

      // US V.4: Предложение добавить фото
      if (confirm('Добавить фото для этого товара?')) {
        setSelectedLineForPhoto(newLine);
        setShowPhotoCapture(true);
      }
    } catch (err: any) {
      feedback.error(`Ошибка добавления: ${err.message}`);
    }
  };

  // US V.4: Добавление фото к строке
  const handlePhotoTaken = async (photoData: string) => {
    setShowPhotoCapture(false);

    if (!selectedLineForPhoto) return;

    try {
      // Обновляем строку с фото
      await db.returnLines
        .where('id')
        .equals(selectedLineForPhoto.id)
        .modify({ photo: photoData });

      // Обновляем локальное состояние
      setLines((prev) =>
        prev.map((line) =>
          line.id === selectedLineForPhoto.id ? { ...line, photo: photoData } : line
        )
      );

      feedback.success('✓ Фото добавлено');
      setSelectedLineForPhoto(null);
    } catch (err: any) {
      feedback.error(`Ошибка сохранения фото: ${err.message}`);
    }
  };

  // Изменение количества
  const handleQuantityChange = async (lineId: string, delta: number) => {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return;

    const newQuantity = Math.max(1, line.quantity + delta);

    try {
      await db.returnLines
        .where('id')
        .equals(lineId)
        .modify({ quantity: newQuantity });

      setLines((prev) =>
        prev.map((l) => (l.id === lineId ? { ...l, quantity: newQuantity } : l))
      );

      feedback.info(`Количество: ${newQuantity}`);
    } catch (err: any) {
      feedback.error(`Ошибка обновления: ${err.message}`);
    }
  };

  // Удаление строки
  const handleRemoveLine = async (lineId: string) => {
    if (!confirm('Удалить эту позицию?')) return;

    try {
      await db.returnLines.where('id').equals(lineId).delete();
      setLines((prev) => prev.filter((l) => l.id !== lineId));

      await db.returnDocuments.update(document!.id, {
        totalLines: lines.length - 1,
        updatedAt: Date.now(),
      });

      feedback.success('✓ Удалено');
    } catch (err: any) {
      feedback.error(`Ошибка удаления: ${err.message}`);
    }
  };

  // US V.5 + V.6: Завершение документа
  const handleFinish = async () => {
    if (lines.length === 0) {
      feedback.error('Добавьте хотя бы один товар');
      return;
    }

    const opName = operationType === 'return' ? 'возврата' : 'списания';

    if (!confirm(`Подтвердить ${opName}?\n\nПозиций: ${lines.length}\nОбщее количество: ${lines.reduce((sum, l) => sum + l.quantity, 0)}`)) {
      return;
    }

    try {
      await db.returnDocuments.update(document!.id, {
        status: 'completed',
        updatedAt: Date.now(),
      });

      await addSyncAction('complete', { documentId: document!.id });

      feedback.success(`✅ Документ ${opName} завершён`);
      analytics.track(EventType.DOC_COMPLETE, { 
        module: 'return', 
        type: operationType,
        linesCount: lines.length 
      });

      navigate('/docs/Vozvrat');
    } catch (err: any) {
      feedback.error(`Ошибка завершения: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }

  const TypeIcon = operationType === 'return' ? RotateCcw : Trash2;
  const typeColor = operationType === 'return' ? 'brand-primary' : 'error';

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* US V.1: Выбор типа операции */}
          <OperationTypeSelector selected={operationType} onSelect={handleTypeSelect} />

          {operationType && (
            <>
              {/* Заголовок документа */}
              {document && (
                <div className={`bg-surface-secondary rounded-lg p-4 border-2 border-${typeColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <TypeIcon size={28} className={`text-${typeColor}`} />
                    <div>
                      <h2 className="text-lg font-bold">{document.id}</h2>
                      <p className="text-sm text-content-secondary">
                        {operationType === 'return' ? 'Возврат' : 'Списание'}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-center font-bold ${
                    document.status === 'completed'
                      ? 'bg-success-light text-success-dark'
                      : 'bg-warning-light text-warning-dark'
                  }`}>
                    {document.status === 'completed' ? '✓ ЗАВЕРШЁН' : '⏳ В РАБОТЕ'}
                  </div>
                </div>
              )}

              {/* US V.2: Сканирование */}
              {document?.status !== 'completed' && (
                <div className="bg-surface-secondary rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Package size={20} />
                    Добавить товар
                  </h3>
                  <ScannerInput
                    onScan={handleProductScan}
                    placeholder="Отсканируйте товар..."
                    autoFocus
                  />
                </div>
              )}

              {/* Список добавленных товаров */}
              {lines.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-content-tertiary uppercase flex items-center gap-2">
                    <FileText size={16} />
                    Список позиций ({lines.length})
                  </h3>

                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className="bg-surface-secondary rounded-lg p-4 space-y-3"
                    >
                      {/* Заголовок */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold">{line.productName}</h4>
                          <p className="text-xs text-content-tertiary font-mono">
                            {line.barcode}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors"
                          disabled={document?.status === 'completed'}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>

                      {/* Причина */}
                      <div className="bg-warning-light rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={16} className="text-warning-dark flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-warning-dark font-bold mb-1">
                              Причина:
                            </div>
                            <div className="text-sm font-medium">{line.reason}</div>
                            {line.comment && (
                              <div className="text-xs text-content-secondary mt-1">
                                {line.comment}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Количество */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Количество:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(line.id, -1)}
                            disabled={line.quantity <= 1 || document?.status === 'completed'}
                            className="p-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-xl font-bold min-w-[3ch] text-center">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(line.id, 1)}
                            disabled={document?.status === 'completed'}
                            className="p-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Фото */}
                      {line.photo ? (
                        <div className="relative">
                          <img
                            src={line.photo}
                            alt="Product"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-success rounded-full p-2">
                            <Camera size={16} className="text-white" />
                          </div>
                        </div>
                      ) : document?.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedLineForPhoto(line);
                            setShowPhotoCapture(true);
                          }}
                          className="w-full py-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Camera size={16} />
                          Добавить фото
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Итоги */}
              {lines.length > 0 && (
                <div className="bg-brand-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Всего позиций:</span>
                    <span className="text-xl font-bold">{lines.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Общее количество:</span>
                    <span className="text-xl font-bold">
                      {lines.reduce((sum, l) => sum + l.quantity, 0)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Кнопка завершения */}
        {operationType && document && document.status !== 'completed' && lines.length > 0 && (
          <div className="p-4 border-t border-separator bg-surface-primary fixed bottom-0 w-full max-w-3xl">
            <Button onClick={handleFinish} className="w-full" size="lg">
              <CheckCircle className="mr-2" />
              Завершить {operationType === 'return' ? 'возврат' : 'списание'}
            </Button>
          </div>
        )}
      </div>

      {/* Диалоги */}
      {showReasonSelector && (
        <ReasonSelector
          operationType={operationType!}
          onSubmit={handleReasonSubmit}
          onCancel={() => {
            setShowReasonSelector(false);
            setCurrentProduct(null);
          }}
        />
      )}

      {showPhotoCapture && (
        <PhotoCapture
          onPhotoTaken={handlePhotoTaken}
          onCancel={() => {
            setShowPhotoCapture(false);
            setSelectedLineForPhoto(null);
          }}
          existingPhoto={selectedLineForPhoto?.photo}
        />
      )}
    </>
  );
};

export default Return;
