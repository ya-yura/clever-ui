// === 📁 src/components/receiving/ReceivingCard.tsx ===
// Product card for receiving module

import React from 'react';
import { ReceivingLine } from '@/types/receiving';

interface Props {
  line: ReceivingLine;
  onAdjust: (delta: number) => void;
}

const ReceivingCard: React.FC<Props> = ({ line, onAdjust }) => {
  const statusColor =
    line.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-500/50' :
    line.status === 'partial' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-500/50' :
    line.status === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-500/50' :
    'bg-surface-secondary border-border-default';

  const statusIcon =
    line.status === 'completed' ? '🟢' :
    line.status === 'partial' ? '🟡' :
    line.status === 'error' ? '🔴' :
    '⚪';

  const difference = line.quantityFact - line.quantityPlan;
  const showDifference = difference !== 0;

  return (
    <div className={`card border-2 ${statusColor} transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{statusIcon}</span>
            <div>
              <h3 className="font-semibold text-content-primary">
                {line.productName}
              </h3>
              <p className="text-sm text-content-secondary">
                Артикул: {line.productSku}
              </p>
              {line.barcode && (
                <p className="text-xs text-content-tertiary">
                  ШК: {line.barcode}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-surface-tertiary border border-border-default rounded p-2">
              <div className="text-xs text-content-secondary">План</div>
              <div className="text-lg font-bold text-content-primary">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-surface-tertiary border border-border-default rounded p-2">
              <div className="text-xs text-content-secondary">Факт</div>
              <div className="text-lg font-bold text-brand-primary">
                {line.quantityFact}
              </div>
            </div>
            <div className="bg-surface-tertiary border border-border-default rounded p-2">
              <div className="text-xs text-content-secondary">Остаток</div>
              <div className={`text-lg font-bold ${
                showDifference 
                  ? difference > 0 
                    ? 'text-warning' 
                    : 'text-error'
                  : 'text-success'
              }`}>
                {Math.abs(line.quantityPlan - line.quantityFact)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={(e) => { e.stopPropagation(); onAdjust(-1); }}
          className="btn-secondary flex-1 border border-border-default"
          disabled={line.quantityFact === 0}
        >
          −1
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAdjust(1); }}
          className="btn-primary flex-1"
        >
          +1
        </button>
      </div>

      {showDifference && (
        <div className={`mt-2 p-2 rounded text-sm text-center ${
          difference > 0 
            ? 'bg-warning/20 text-warning-dark'
            : 'bg-error/20 text-error-dark'
        }`}>
          {difference > 0 ? '⚠️ Излишки' : '⚠️ Недостача'}: {Math.abs(difference)} шт.
        </div>
      )}
    </div>
  );
};

export default ReceivingCard;

