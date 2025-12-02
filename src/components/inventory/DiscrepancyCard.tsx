import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { Button } from '@/design/components';

interface DiscrepancyItem {
  productName: string;
  barcode: string;
  cell: string;
  expected: number;
  actual: number;
  difference: number;
}

interface DiscrepancyCardProps {
  discrepancies: DiscrepancyItem[];
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * US VI.6: Карточка расхождений
 * Детальный просмотр всех расхождений план/факт
 */
export const DiscrepancyCard: React.FC<DiscrepancyCardProps> = ({
  discrepancies,
  onClose,
  onConfirm,
}) => {
  const shortages = discrepancies.filter((d) => d.difference < 0);
  const surpluses = discrepancies.filter((d) => d.difference > 0);
  const matches = discrepancies.filter((d) => d.difference === 0);

  const totalDifference = discrepancies.reduce((sum, d) => sum + Math.abs(d.difference), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-primary rounded-2xl max-w-2xl w-full shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-separator">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-warning-light rounded-xl">
              <AlertTriangle className="text-warning" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Расхождения инвентаризации</h2>
              <p className="text-sm text-content-secondary">
                Обнаружено {discrepancies.length} позиций
              </p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-error-light rounded-lg p-3 text-center">
              <TrendingDown size={20} className="text-error mx-auto mb-1" />
              <div className="text-xs text-error-dark mb-1">Недостача</div>
              <div className="text-xl font-bold text-error">{shortages.length}</div>
            </div>
            <div className="bg-success-light rounded-lg p-3 text-center">
              <TrendingUp size={20} className="text-success mx-auto mb-1" />
              <div className="text-xs text-success-dark mb-1">Излишки</div>
              <div className="text-xl font-bold text-success">{surpluses.length}</div>
            </div>
            <div className="bg-brand-primary/10 rounded-lg p-3 text-center">
              <CheckCircle size={20} className="text-brand-primary mx-auto mb-1" />
              <div className="text-xs text-brand-primary mb-1">Совпадения</div>
              <div className="text-xl font-bold text-brand-primary">{matches.length}</div>
            </div>
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Недостачи */}
          {shortages.length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-error uppercase mb-2 flex items-center gap-2">
                <TrendingDown size={16} />
                Недостача ({shortages.length})
              </h3>
              <div className="space-y-2">
                {shortages.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-error-light border-2 border-error rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.productName}</div>
                        <div className="text-xs text-content-tertiary font-mono">
                          {item.barcode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-content-tertiary">Ячейка</div>
                        <div className="font-bold text-sm">{item.cell}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-content-secondary">План: {item.expected}</span>
                      <span className="text-content-secondary">Факт: {item.actual}</span>
                      <span className="font-bold text-error">{item.difference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Излишки */}
          {surpluses.length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-success uppercase mb-2 flex items-center gap-2">
                <TrendingUp size={16} />
                Излишки ({surpluses.length})
              </h3>
              <div className="space-y-2">
                {surpluses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-success-light border-2 border-success rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.productName}</div>
                        <div className="text-xs text-content-tertiary font-mono">
                          {item.barcode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-content-tertiary">Ячейка</div>
                        <div className="font-bold text-sm">{item.cell}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-content-secondary">План: {item.expected}</span>
                      <span className="text-content-secondary">Факт: {item.actual}</span>
                      <span className="font-bold text-success">+{item.difference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Совпадения (скрыты по умолчанию) */}
          {matches.length > 0 && (
            <details className="bg-surface-secondary rounded-lg p-3">
              <summary className="font-bold text-sm cursor-pointer flex items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                Совпадения ({matches.length})
              </summary>
              <div className="space-y-2 mt-2">
                {matches.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-tertiary rounded-lg p-2 text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span>{item.productName}</span>
                      <span className="text-success font-bold">✓ {item.actual}</span>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Итоги */}
          <div className="bg-warning-light border-2 border-warning rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Всего расхождений:</span>
              <span className="text-2xl font-bold text-warning">{discrepancies.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Суммарная разница:</span>
              <span className="text-xl font-bold text-warning-dark">{totalDifference} шт</span>
            </div>
          </div>

          {/* Предупреждение */}
          <div className="bg-surface-secondary rounded-lg p-4 text-sm text-content-secondary">
            <AlertTriangle size={16} className="inline mr-2 text-warning" />
            После подтверждения данные будут отправлены на согласование.
            Убедитесь в правильности инвентаризации.
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator space-y-3">
          <Button onClick={onConfirm} className="w-full">
            Подтвердить расхождения
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Вернуться к проверке
          </Button>
        </div>
      </div>
    </div>
  );
};



