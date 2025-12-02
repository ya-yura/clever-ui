import React from 'react';
import { CheckCircle, AlertTriangle, Package } from 'lucide-react';

interface CompletenessCheckProps {
  lines: Array<{
    id: string;
    productName: string;
    quantityPlan: number;
    quantityFact: number;
    status: string;
  }>;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * US IV.1: Проверка комплектности перед отгрузкой
 * Компонент для финальной проверки всех позиций заказа
 */
export const CompletenessCheck: React.FC<CompletenessCheckProps> = ({
  lines,
  onClose,
  onConfirm,
}) => {
  const completedLines = lines.filter(l => l.quantityFact >= l.quantityPlan);
  const incompleteLines = lines.filter(l => l.quantityFact < l.quantityPlan);
  const isComplete = incompleteLines.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-primary rounded-2xl max-w-md w-full shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-separator">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${
              isComplete ? 'bg-success-light' : 'bg-warning-light'
            }`}>
              {isComplete ? (
                <CheckCircle className="text-success" size={24} />
              ) : (
                <AlertTriangle className="text-warning" size={24} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Проверка комплектности</h2>
              <p className="text-sm text-content-secondary">
                {isComplete ? 'Заказ укомплектован' : 'Обнаружены расхождения'}
              </p>
            </div>
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Статистика */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success-light rounded-lg p-3">
              <div className="text-xs text-success-dark mb-1">Укомплектовано</div>
              <div className="text-2xl font-bold text-success">
                {completedLines.length}
              </div>
            </div>
            <div className="bg-warning-light rounded-lg p-3">
              <div className="text-xs text-warning-dark mb-1">Не хватает</div>
              <div className="text-2xl font-bold text-warning">
                {incompleteLines.length}
              </div>
            </div>
          </div>

          {/* Список всех позиций */}
          <div>
            <h3 className="font-bold text-sm text-content-tertiary uppercase mb-2">
              Все позиции ({lines.length})
            </h3>
            <div className="space-y-2">
              {lines.map((line) => {
                const isLineComplete = line.quantityFact >= line.quantityPlan;
                const difference = line.quantityFact - line.quantityPlan;

                return (
                  <div
                    key={line.id}
                    className={`p-3 rounded-lg border-2 ${
                      isLineComplete
                        ? 'border-success bg-success/10'
                        : 'border-warning bg-warning/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{line.productName}</div>
                      </div>
                      {isLineComplete ? (
                        <CheckCircle size={16} className="text-success flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-warning flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={
                        isLineComplete ? 'text-success-dark' : 'text-warning-dark'
                      }>
                        {line.quantityFact} / {line.quantityPlan} шт
                      </span>
                      {difference !== 0 && (
                        <span className={difference > 0 ? 'text-success-dark' : 'text-error-dark'}>
                          {difference > 0 ? '+' : ''}{difference}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Предупреждение если неполная комплектность */}
          {!isComplete && (
            <div className="bg-warning-light border border-warning rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warning flex-shrink-0" size={20} />
                <div className="text-sm text-warning-dark">
                  <p className="font-bold mb-1">Внимание!</p>
                  <p>
                    Не все позиции укомплектованы. Клиент получит неполный заказ.
                    Продолжить отгрузку?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator space-y-3">
          <button
            onClick={onConfirm}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isComplete
                ? 'bg-success hover:brightness-110 text-white'
                : 'bg-warning hover:brightness-110 text-white'
            }`}
          >
            {isComplete ? '✓ Подтвердить комплектность' : '⚠ Отгрузить частично'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg font-medium transition-colors"
          >
            Вернуться к проверке
          </button>
        </div>
      </div>
    </div>
  );
};



