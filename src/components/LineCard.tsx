import React from 'react';
import { Package, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { DocLine } from '@/hooks/useDocumentLogic';

interface LineCardProps {
  line: DocLine;
  onClose: () => void;
  onQuantityChange?: (lineId: string, delta: number) => void;
}

/**
 * Карточка строки документа - детальная информация
 * US I.2.5: Просмотр карточки строки
 */
export const LineCard: React.FC<LineCardProps> = ({ line, onClose, onQuantityChange }) => {
  const progress = line.quantityPlan > 0 ? (line.quantityFact / line.quantityPlan) * 100 : 0;
  const isCompleted = line.status === 'completed';
  const isOver = line.status === 'over' || line.quantityFact > line.quantityPlan;
  const isPartial = line.status === 'partial';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface-primary rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-separator">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isCompleted
                  ? 'bg-success-light'
                  : isOver
                  ? 'bg-error-light'
                  : isPartial
                  ? 'bg-warning-light'
                  : 'bg-surface-tertiary'
              }`}
            >
              <Package
                className={
                  isCompleted
                    ? 'text-success'
                    : isOver
                    ? 'text-error'
                    : isPartial
                    ? 'text-warning'
                    : 'text-content-tertiary'
                }
                size={24}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{line.productName}</h3>
              <p className="text-sm text-content-tertiary">Артикул: {line.productSku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-content-tertiary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Штрихкод */}
          <div>
            <p className="text-xs text-content-tertiary uppercase tracking-wide mb-1">Штрихкод</p>
            <p className="font-mono text-lg">{line.barcode}</p>
          </div>

          {/* Количество */}
          <div>
            <p className="text-xs text-content-tertiary uppercase tracking-wide mb-2">Количество</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-content-secondary mb-1">План</div>
                <div className="text-2xl font-bold">{line.quantityPlan}</div>
              </div>
              <div className="text-3xl text-content-tertiary">→</div>
              <div className="flex-1">
                <div className="text-sm text-content-secondary mb-1">Факт</div>
                <div
                  className={`text-2xl font-bold ${
                    isCompleted
                      ? 'text-success'
                      : isOver
                      ? 'text-error'
                      : isPartial
                      ? 'text-warning'
                      : ''
                  }`}
                >
                  {line.quantityFact}
                </div>
              </div>
            </div>

            {/* Прогресс */}
            <div className="mt-3">
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-success'
                      : isOver
                      ? 'bg-error'
                      : isPartial
                      ? 'bg-warning'
                      : 'bg-brand-primary'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-content-tertiary mt-1 text-right">
                {progress.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Статус */}
          <div>
            <p className="text-xs text-content-tertiary uppercase tracking-wide mb-2">Статус</p>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <>
                  <CheckCircle className="text-success" size={20} />
                  <span className="text-success font-medium">Выполнено</span>
                </>
              )}
              {isOver && (
                <>
                  <AlertTriangle className="text-error" size={20} />
                  <span className="text-error font-medium">Превышение плана (+{line.quantityFact - line.quantityPlan})</span>
                </>
              )}
              {isPartial && !isOver && (
                <>
                  <AlertTriangle className="text-warning" size={20} />
                  <span className="text-warning font-medium">Частично выполнено</span>
                </>
              )}
              {!isCompleted && !isOver && !isPartial && (
                <>
                  <Package className="text-content-tertiary" size={20} />
                  <span className="text-content-tertiary font-medium">Ожидает</span>
                </>
              )}
            </div>
          </div>

          {/* Быстрые действия */}
          {onQuantityChange && (
            <div>
              <p className="text-xs text-content-tertiary uppercase tracking-wide mb-2">
                Быстрые действия
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onQuantityChange(line.id, -1)}
                  className="flex-1 py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg font-medium transition-colors"
                  disabled={line.quantityFact <= 0}
                >
                  -1
                </button>
                <button
                  onClick={() => onQuantityChange(line.id, 1)}
                  className="flex-1 py-3 bg-brand-primary hover:brightness-110 text-white rounded-lg font-medium transition-all"
                >
                  +1
                </button>
                <button
                  onClick={() => onQuantityChange(line.id, 5)}
                  className="flex-1 py-3 bg-brand-primary hover:brightness-110 text-white rounded-lg font-medium transition-all"
                >
                  +5
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator">
          <button
            onClick={onClose}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};



