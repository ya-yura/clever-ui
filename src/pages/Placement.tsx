import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/services/db';
import { useScanner } from '@/hooks/useScanner';
import { useDocumentLogic } from '@/hooks/useDocumentLogic';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import ScannerInput from '@/components/ScannerInput';
import { QuantityControl } from '@/components/QuantityControl';
import { LineCard } from '@/components/LineCard';
import { AutoCompletePrompt } from '@/components/AutoCompletePrompt';
import { DiscrepancyAlert } from '@/components/DiscrepancyAlert';
import { ArrowLeft, Package, MapPin, CheckCircle, X, Undo2 } from 'lucide-react';
import { Button } from '@/design/components';
import { feedback } from '@/utils/feedback';

/**
 * МОДУЛЬ РАЗМЕЩЕНИЯ
 * 
 * Двухшаговое сканирование:
 * 1. Сканировать ячейку → запомнить
 * 2. Сканировать товар → разместить в ячейку
 * 
 * Сценарии:
 * - Правильная ячейка + товар = размещение
 * - Неправильная ячейка = ошибка
 * - Частичное размещение
 * - Отмена действия
 */
const Placement: React.FC = () => {
  const { id, docId } = useParams();
  const [searchParams] = useSearchParams();
  const documentId = docId || id;
  const sourceDocId = searchParams.get('source');
  const navigate = useNavigate();
  const { setDocumentInfo, setListInfo } = useDocumentHeader();

  // Состояние двухшагового сканирования
  const [currentStep, setCurrentStep] = useState<'cell' | 'product'>('cell');
  const [scannedCell, setScannedCell] = useState<string | null>(null);
  const [cellInfo, setCellInfo] = useState<any | null>(null);

  // UI состояния
  const [showLineCard, setShowLineCard] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [showAutoComplete, setShowAutoComplete] = useState(false);

  // История действий для отмены
  const [actionHistory, setActionHistory] = useState<Array<{
    lineId: string;
    cellId: string;
    quantity: number;
    timestamp: number;
  }>>([]);

  // Логика документа
  const {
    document,
    lines,
    activeLine,
    loading,
    handleScan,
    updateQuantity,
    finishDocument,
    getDiscrepancies,
    showDiscrepancyAlert,
    setShowDiscrepancyAlert,
    setActiveLine,
  } = useDocumentLogic({
    docType: 'placement',
    docId: documentId,
    onComplete: () => {
      feedback.success('✅ Размещение завершено');
      navigate('/docs/RazmeshhenieVYachejki');
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
      setListInfo({ title: 'Размещение', count: 0 });
    }
    return () => {
      setDocumentInfo(null);
      setListInfo(null);
    };
  }, [documentId, document, setDocumentInfo, setListInfo]);

  // US II.1: Загрузка ячейки из справочника
  const loadCellInfo = async (cellCode: string) => {
    try {
      // Поиск в справочнике ячеек
      const cell = await db.cells?.get(cellCode);
      if (cell) {
        return cell;
      }
      
      // Если не найдено, создаём временную запись
      return {
        id: cellCode,
        name: cellCode,
        zone: 'Неизвестная зона',
        type: 'storage',
      };
    } catch (err) {
      console.error('Failed to load cell:', err);
      return null;
    }
  };

  // US II.2: Обработка сканирования ячейки
  const handleCellScan = async (code: string) => {
    const cell = await loadCellInfo(code);
    
    if (cell) {
      setScannedCell(code);
      setCellInfo(cell);
      setCurrentStep('product');
      feedback.success(`Ячейка: ${cell.name}`);
    } else {
      feedback.error('Ячейка не найдена');
    }
  };

  // US II.3: Обработка сканирования товара
  const handleProductScan = async (code: string) => {
    if (!scannedCell) {
      feedback.error('Сначала отсканируйте ячейку');
      setCurrentStep('cell');
      return;
    }

    // Ищем товар в строках документа
    const line = lines.find(l => l.barcode === code || l.productSku === code);
    
    if (!line) {
      feedback.error('Товар не найден в документе');
      return;
    }

    // US II.3.1: Проверка правильности ячейки
    if (line.cellId && line.cellId !== scannedCell) {
      const wrongCell = await loadCellInfo(line.cellId);
      feedback.error(`⚠️ Неправильная ячейка!\nТребуется: ${wrongCell?.name || line.cellId}\nОтсканирована: ${cellInfo?.name}`);
      return;
    }

    // US II.3.2: Размещение товара
    // Обновляем ячейку для строки если ещё не задана
    if (!line.cellId) {
      const linesTable = db.placementLines;
      await linesTable.update(line.id, { cellId: scannedCell });
    }

    // Увеличиваем количество
    const newQuantity = line.quantityFact + 1;
    await updateQuantity(line.id, 1);

    // Сохраняем в историю для отмены
    setActionHistory(prev => [...prev, {
      lineId: line.id,
      cellId: scannedCell,
      quantity: 1,
      timestamp: Date.now(),
    }]);

    // Обратная связь
    feedback.success(`${line.productName} размещён в ${cellInfo?.name} (+1)`);

    // Если строка выполнена, переходим к следующей
    if (newQuantity >= line.quantityPlan) {
      feedback.success(`✅ ${line.productName} полностью размещён`);
      
      // Сбрасываем ячейку для следующего товара
      setScannedCell(null);
      setCellInfo(null);
      setCurrentStep('cell');

      // Проверка автозавершения
      const allCompleted = lines.every(l => 
        l.id === line.id ? newQuantity >= line.quantityPlan : l.status === 'completed'
      );
      
      if (allCompleted) {
        setTimeout(() => setShowAutoComplete(true), 500);
      }
    }
  };

  // US II.5: Отмена последнего действия
  const handleUndo = async () => {
    if (actionHistory.length === 0) {
      feedback.error('Нет действий для отмены');
      return;
    }

    const lastAction = actionHistory[actionHistory.length - 1];
    const line = lines.find(l => l.id === lastAction.lineId);
    
    if (line && line.quantityFact > 0) {
      await updateQuantity(line.id, -lastAction.quantity);
      setActionHistory(prev => prev.slice(0, -1));
      feedback.success(`↶ Отменено размещение ${line.productName}`);
    }
  };

  // US II.2: Обработчик сканера
  const { handleScan: onScanWithFeedback } = useScanner({
    mode: 'keyboard',
    onScan: async (code) => {
      if (currentStep === 'cell') {
        await handleCellScan(code);
      } else {
        await handleProductScan(code);
      }
    },
  });

  // US II.6: Завершение документа
  const handleFinish = async () => {
    const discrepancies = getDiscrepancies();
    
    if (discrepancies.length > 0) {
      setShowDiscrepancyAlert(true);
    } else {
      await finishDocument(true);
    }
  };

  const handleConfirmWithDiscrepancies = async () => {
    setShowDiscrepancyAlert(false);
    await finishDocument(true);
  };

  const handleLineClick = (line: any) => {
    setSelectedLine(line);
    setShowLineCard(true);
  };

  const handleAutoComplete = () => {
    setShowAutoComplete(false);
    handleFinish();
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
        <Button onClick={() => navigate('/docs/RazmeshhenieVYachejki')}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        {/* Главный экран */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {/* US II.2: Индикатор текущего шага */}
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Двухшаговое сканирование</h3>
              {actionHistory.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-2 px-3 py-1 bg-surface-tertiary hover:bg-warning-light rounded-lg text-sm transition-colors"
                >
                  <Undo2 size={16} />
                  Отменить
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Шаг 1: Ячейка */}
              <div className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                currentStep === 'cell'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : scannedCell
                  ? 'border-success bg-success/10'
                  : 'border-separator'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={20} className={currentStep === 'cell' ? 'text-brand-primary' : 'text-content-tertiary'} />
                  <span className="text-xs font-bold uppercase">Шаг 1: Ячейка</span>
                </div>
                {scannedCell ? (
                  <div>
                    <div className="font-bold">{cellInfo?.name || scannedCell}</div>
                    <div className="text-xs text-content-tertiary">{cellInfo?.zone}</div>
                  </div>
                ) : (
                  <div className="text-sm text-content-tertiary">Отсканируйте ячейку</div>
                )}
              </div>

              <div className="text-2xl text-content-tertiary">→</div>

              {/* Шаг 2: Товар */}
              <div className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                currentStep === 'product'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-separator'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Package size={20} className={currentStep === 'product' ? 'text-brand-primary' : 'text-content-tertiary'} />
                  <span className="text-xs font-bold uppercase">Шаг 2: Товар</span>
                </div>
                <div className="text-sm text-content-tertiary">
                  {currentStep === 'product' ? 'Отсканируйте товар' : 'Ожидает'}
                </div>
              </div>
            </div>

            {scannedCell && (
              <button
                onClick={() => {
                  setScannedCell(null);
                  setCellInfo(null);
                  setCurrentStep('cell');
                  feedback.info('Сканирование ячейки сброшено');
                }}
                className="mt-3 w-full py-2 bg-surface-tertiary hover:bg-surface-primary rounded-lg text-sm transition-colors"
              >
                <X size={16} className="inline mr-1" />
                Сбросить ячейку
              </button>
            )}
          </div>

          {/* Поле сканирования */}
          <ScannerInput
            onScan={onScanWithFeedback}
            placeholder={
              currentStep === 'cell'
                ? 'Шаг 1: Скан ячейки...'
                : `Шаг 2: Скан товара в ${cellInfo?.name || 'ячейку'}...`
            }
            className="sticky top-0 z-10 shadow-md"
          />

          {/* Статус и прогресс */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Прогресс размещения</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                document.status === 'completed'
                  ? 'bg-success-light text-success-dark'
                  : document.status === 'in_progress'
                  ? 'bg-warning-light text-warning-dark'
                  : 'bg-surface-tertiary text-content-secondary'
              }`}>
                {document.status === 'completed' ? 'ЗАВЕРШЁН' : document.status === 'in_progress' ? 'В РАБОТЕ' : 'НОВЫЙ'}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Размещено позиций</span>
                <span className="font-mono">{document.completedLines} / {document.totalLines}</span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${document.totalLines > 0 ? (document.completedLines / document.totalLines) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Список строк */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-content-tertiary uppercase">Товары к размещению</h3>
            {lines.map((line) => (
              <div
                key={line.id}
                onClick={() => handleLineClick(line)}
                className="card p-4 cursor-pointer hover:border-brand-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold">{line.productName}</h4>
                    <p className="text-xs text-content-tertiary font-mono">{line.barcode}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    line.status === 'completed'
                      ? 'bg-success-light text-success-dark'
                      : line.status === 'partial'
                      ? 'bg-warning-light text-warning-dark'
                      : 'bg-surface-tertiary text-content-secondary'
                  }`}>
                    {line.quantityFact} / {line.quantityPlan}
                  </div>
                </div>

                {line.cellId && (
                  <div className="flex items-center gap-2 text-sm text-content-secondary">
                    <MapPin size={14} />
                    <span>Ячейка: {line.cellId}</span>
                  </div>
                )}

                <div className="mt-2 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      line.status === 'completed' ? 'bg-success' : 'bg-warning'
                    }`}
                    style={{ width: `${line.quantityPlan > 0 ? (line.quantityFact / line.quantityPlan) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка завершения */}
        <div className="p-4 border-t border-separator bg-surface-primary fixed bottom-0 w-full max-w-3xl">
          <Button
            variant={document.status === 'completed' ? 'secondary' : 'primary'}
            className="w-full"
            onClick={handleFinish}
            disabled={document.status === 'completed'}
          >
            {document.status === 'completed' ? '✅ Документ завершён' : 'Завершить размещение'}
          </Button>
        </div>
      </div>

      {/* Диалоги */}
      {showDiscrepancyAlert && (
        <DiscrepancyAlert
          discrepancies={getDiscrepancies()}
          onConfirm={handleConfirmWithDiscrepancies}
          onCancel={() => setShowDiscrepancyAlert(false)}
        />
      )}

      {showLineCard && selectedLine && (
        <LineCard
          line={selectedLine}
          onClose={() => {
            setShowLineCard(false);
            setSelectedLine(null);
          }}
          onQuantityChange={(lineId, delta) => {
            updateQuantity(lineId, delta);
            const updatedLine = lines.find(l => l.id === lineId);
            if (updatedLine) setSelectedLine(updatedLine);
          }}
        />
      )}

      {showAutoComplete && document && (
        <AutoCompletePrompt
          totalLines={document.totalLines}
          completedLines={document.completedLines}
          onComplete={handleAutoComplete}
          onContinue={() => setShowAutoComplete(false)}
        />
      )}
    </>
  );
};

export default Placement;
