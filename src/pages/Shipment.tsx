import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { useDocumentLogic } from '@/hooks/useDocumentLogic';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { LineCard } from '@/components/LineCard';
import { CompletenessCheck } from '@/components/shipment/CompletenessCheck';
import { TTNInput } from '@/components/shipment/TTNInput';
import { Package, Truck, FileText, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { Button } from '@/design/components';
import { feedback } from '@/utils/feedback';

/**
 * МОДУЛЬ ОТГРУЗКИ
 * 
 * Процесс:
 * 1. Открытие документа отгрузки
 * 2. Проверка позиций (все ли подобрано)
 * 3. Ввод данных ТТН и перевозчика
 * 4. Финальная проверка комплектности
 * 5. Предложение печати документов
 * 6. Завершение отгрузки
 */
const Shipment: React.FC = () => {
  const { id, docId } = useParams();
  const documentId = docId || id;
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  // Состояния UI
  const [showCompletenessCheck, setShowCompletenessCheck] = useState(false);
  const [showTTNInput, setShowTTNInput] = useState(false);
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);

  // Данные отгрузки
  const [ttnNumber, setTTNNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [readyToShip, setReadyToShip] = useState(false);

  // Логика документа
  const {
    document,
    lines,
    loading,
    finishDocument,
    setActiveLine,
  } = useDocumentLogic({
    docType: 'shipment',
    docId: documentId,
    onComplete: () => {
      feedback.success('✅ Отгрузка завершена');
      navigate('/docs/Otgruzka');
    },
  });

  // Заголовок
  useEffect(() => {
    if (documentId && document) {
      setDocumentInfo({
        documentId: document.id,
        completed: document.completedLines || 0,
        total: document.totalLines || 0,
      });
    } else {
      setDocumentInfo(null);
      setListInfo({ title: 'Отгрузка', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, setDocumentInfo, setListInfo]);

  // Загрузка сохранённых данных ТТН
  useEffect(() => {
    if (document) {
      setTTNNumber(document.ttnNumber || '');
      setCarrier(document.carrier || '');
    }
  }, [document]);

  // US IV.1: Проверка комплектности
  const checkCompleteness = () => {
    setShowCompletenessCheck(true);
  };

  // US IV.2: Подтверждение комплектности → запрос ТТН
  const handleCompletenessConfirm = () => {
    setShowCompletenessCheck(false);
    
    // Если данные уже введены, пропускаем ввод
    if (ttnNumber && carrier) {
      setReadyToShip(true);
      feedback.success('Готово к отгрузке');
    } else {
      setShowTTNInput(true);
    }
  };

  // US IV.3: Сохранение ТТН и перевозчика
  const handleTTNSubmit = async (data: { ttnNumber: string; carrier: string }) => {
    setTTNNumber(data.ttnNumber);
    setCarrier(data.carrier);
    setShowTTNInput(false);

    // Сохраняем в документ
    if (document) {
      await db.shipmentDocuments.update(document.id, {
        ttnNumber: data.ttnNumber,
        carrier: data.carrier,
        updatedAt: Date.now(),
      });
    }

    setReadyToShip(true);
    feedback.success(`✓ ТТН ${data.ttnNumber} (${data.carrier})`);
  };

  // US IV.4: Завершение отгрузки
  const handleShip = async () => {
    if (!ttnNumber || !carrier) {
      feedback.error('Сначала введите данные ТТН');
      setShowTTNInput(true);
      return;
    }

    // Финальная проверка
    const incompleteLines = lines.filter(l => l.quantityFact < l.quantityPlan);
    if (incompleteLines.length > 0) {
      if (!confirm(`Неполная комплектность (${incompleteLines.length} позиций).\n\nОтгрузить всё равно?`)) {
        return;
      }
    }

    // US IV.5: Предложение печати
    setShowPrintPrompt(true);
  };

  // US IV.6: Печать и завершение
  const handlePrintAndFinish = async (print: boolean) => {
    setShowPrintPrompt(false);

    if (print) {
      // Симуляция печати
      feedback.info('📄 Отправка на печать...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      feedback.success('✓ Документы распечатаны');
    }

    // Завершаем документ
    await finishDocument(true);
  };

  const handleLineClick = (line: any) => {
    setSelectedLine(line);
    setShowLineCard(true);
  };

  // Рендер загрузки
  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-10 text-center">
        <div className="text-error mb-4">Документ не найден</div>
        <Button onClick={() => navigate('/docs/Otgruzka')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const completedLines = lines.filter(l => l.quantityFact >= l.quantityPlan);
  const incompleteLines = lines.filter(l => l.quantityFact < l.quantityPlan);
  const isComplete = incompleteLines.length === 0;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        {/* Главный экран */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* Заголовок документа */}
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Truck size={32} className="text-brand-primary" />
              <div>
                <h2 className="text-xl font-bold">{document.id}</h2>
                {document.customer && (
                  <p className="text-sm text-content-secondary">
                    Клиент: {document.customer}
                  </p>
                )}
              </div>
            </div>

            {/* Статус */}
            <div className={`px-3 py-2 rounded-lg text-center font-bold ${
              document.status === 'completed'
                ? 'bg-success-light text-success-dark'
                : document.status === 'in_progress'
                ? 'bg-warning-light text-warning-dark'
                : 'bg-surface-tertiary text-content-secondary'
            }`}>
              {document.status === 'completed' ? '✓ ОТГРУЖЕНО' : 
               document.status === 'in_progress' ? '⏳ В РАБОТЕ' : '📋 НОВЫЙ'}
            </div>
          </div>

          {/* US IV.1: Проверка комплектности */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <h3 className="font-bold">Комплектность заказа</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success-light rounded-lg p-3">
                <div className="text-xs text-success-dark mb-1">Готово</div>
                <div className="text-2xl font-bold text-success">{completedLines.length}</div>
              </div>
              <div className="bg-warning-light rounded-lg p-3">
                <div className="text-xs text-warning-dark mb-1">Не хватает</div>
                <div className="text-2xl font-bold text-warning">{incompleteLines.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {isComplete ? (
                <>
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-success font-medium">Заказ полностью укомплектован</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-warning" />
                  <span className="text-warning font-medium">
                    Не хватает {incompleteLines.length} {incompleteLines.length === 1 ? 'позиции' : 'позиций'}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={checkCompleteness}
              className="w-full py-2 bg-brand-primary hover:brightness-110 text-white rounded-lg font-medium transition-all"
            >
              Проверить подробно
            </button>
          </div>

          {/* US IV.2: Данные отгрузки */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <h3 className="font-bold">Данные отгрузки</h3>

            {ttnNumber && carrier ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-success-light rounded-lg">
                  <Truck size={20} className="text-success" />
                  <div className="flex-1">
                    <div className="text-xs text-success-dark">Перевозчик</div>
                    <div className="font-bold text-success-dark">{carrier}</div>
                  </div>
                  <CheckCircle size={20} className="text-success" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-success-light rounded-lg">
                  <FileText size={20} className="text-success" />
                  <div className="flex-1">
                    <div className="text-xs text-success-dark">ТТН</div>
                    <div className="font-bold text-success-dark">{ttnNumber}</div>
                  </div>
                  <CheckCircle size={20} className="text-success" />
                </div>

                <button
                  onClick={() => setShowTTNInput(true)}
                  className="w-full py-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg text-sm transition-colors"
                >
                  Изменить данные
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTTNInput(true)}
                className="w-full py-3 bg-warning-light hover:bg-warning text-warning-dark rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Ввести ТТН и перевозчика
              </button>
            )}
          </div>

          {/* Список позиций */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-content-tertiary uppercase flex items-center gap-2">
              <Package size={16} />
              Позиции к отгрузке ({lines.length})
            </h3>
            {lines.map((line) => {
              const isLineComplete = line.quantityFact >= line.quantityPlan;
              
              return (
                <div
                  key={line.id}
                  onClick={() => handleLineClick(line)}
                  className={`card p-4 cursor-pointer hover:border-brand-primary transition-colors border-2 ${
                    isLineComplete ? 'border-success' : 'border-warning'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold">{line.productName}</h4>
                      <p className="text-xs text-content-tertiary font-mono">{line.barcode}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      isLineComplete
                        ? 'bg-success-light text-success-dark'
                        : 'bg-warning-light text-warning-dark'
                    }`}>
                      {isLineComplete && <CheckCircle size={12} />}
                      {!isLineComplete && <AlertTriangle size={12} />}
                      {line.quantityFact} / {line.quantityPlan}
                    </div>
                  </div>

                  <div className="mt-2 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isLineComplete ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${(line.quantityFact / line.quantityPlan) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Кнопка отгрузки */}
        <div className="p-4 border-t border-separator bg-surface-primary fixed bottom-0 w-full max-w-3xl">
          <Button
            variant={document.status === 'completed' ? 'secondary' : 'primary'}
            className="w-full"
            onClick={handleShip}
            disabled={document.status === 'completed'}
          >
            {document.status === 'completed' ? '✓ Отгружено' : '🚚 Отгрузить'}
          </Button>
        </div>
      </div>

      {/* Диалоги */}
      {showCompletenessCheck && (
        <CompletenessCheck
          lines={lines}
          onClose={() => setShowCompletenessCheck(false)}
          onConfirm={handleCompletenessConfirm}
        />
      )}

      {showTTNInput && (
        <TTNInput
          onSubmit={handleTTNSubmit}
          onCancel={() => setShowTTNInput(false)}
        />
      )}

      {showLineCard && selectedLine && (
        <LineCard
          line={selectedLine}
          onClose={() => {
            setShowLineCard(false);
            setSelectedLine(null);
          }}
        />
      )}

      {/* US IV.5: Предложение печати */}
      {showPrintPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-primary rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl">
                <Printer className="text-brand-primary" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Печать документов</h2>
                <p className="text-sm text-content-secondary">
                  Распечатать накладную и ТТН?
                </p>
              </div>
            </div>

            <div className="bg-surface-secondary rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-content-secondary">Документ:</span>
                <span className="font-medium">{document.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">ТТН:</span>
                <span className="font-medium">{ttnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Перевозчик:</span>
                <span className="font-medium">{carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Позиций:</span>
                <span className="font-medium">{lines.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePrintAndFinish(true)}
                className="w-full py-3 bg-brand-primary hover:brightness-110 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Печать и завершение
              </button>
              <button
                onClick={() => handlePrintAndFinish(false)}
                className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg font-medium transition-colors"
              >
                Пропустить печать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Shipment;
