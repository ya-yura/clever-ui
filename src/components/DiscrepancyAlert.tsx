import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export interface Discrepancy {
  lineId: string;
  productName: string;
  planned: number;
  actual: number;
  type: 'shortage' | 'surplus' | 'ok';
}

interface DiscrepancyAlertProps {
  discrepancies: Discrepancy[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * US I.3: Отработка неполных поставок
 * Компонент для отображения расхождений план/факт перед завершением документа
 */
export const DiscrepancyAlert: React.FC<DiscrepancyAlertProps> = ({
  discrepancies,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const shortages = discrepancies.filter((d) => d.type === 'shortage');
  const surpluses = discrepancies.filter((d) => d.type === 'surplus');
  const hasDiscrepancies = shortages.length > 0 || surpluses.length > 0;

  if (!hasDiscrepancies) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-surface-primary rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-success" size={32} />
            <h2 className="text-xl font-bold">Приёмка выполнена</h2>
          </div>
          <p className="text-content-secondary mb-6">
            Все позиции соответствуют плану. Завершить документ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-success text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Завершение...' : 'Завершить'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-surface-primary rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-warning" size={32} />
          <h2 className="text-xl font-bold">Обнаружены расхождения</h2>
        </div>

        <p className="text-content-secondary mb-6">
          План не выполнен. Проверьте расхождения перед завершением документа.
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
          {/* US I.3: Недостача */}
          {shortages.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-error mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                Недостача ({shortages.length} поз.)
              </h3>
              <div className="space-y-2">
                {shortages.map((item) => (
                  <div
                    key={item.lineId}
                    className="p-3 bg-error/10 border border-error/30 rounded-lg"
                  >
                    <div className="font-medium text-error">{item.productName}</div>
                    <div className="text-sm text-content-secondary mt-1">
                      План: {item.planned} • Факт: {item.actual} •{' '}
                      <span className="font-bold text-error">
                        Недостача: {item.planned - item.actual}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* US I.3: Излишки */}
          {surpluses.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-warning mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                Излишки ({surpluses.length} поз.)
              </h3>
              <div className="space-y-2">
                {surpluses.map((item) => (
                  <div
                    key={item.lineId}
                    className="p-3 bg-warning/10 border border-warning/30 rounded-lg"
                  >
                    <div className="font-medium text-warning">{item.productName}</div>
                    <div className="text-sm text-content-secondary mt-1">
                      План: {item.planned} • Факт: {item.actual} •{' '}
                      <span className="font-bold text-warning">
                        Излишек: {item.actual - item.planned}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            Отменить
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-warning text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Завершение...' : 'Завершить с расхождениями'}
          </button>
        </div>
      </div>
    </div>
  );
};



