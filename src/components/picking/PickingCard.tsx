// === 📁 src/components/picking/PickingCard.tsx ===
// Product card for picking module

import React from 'react';
import { PickingLine } from '@/types/picking';

interface Props {
  line: PickingLine;
  isActive?: boolean;
  routeOrder?: number;
}

const PickingCard: React.FC<Props> = ({ line, isActive, routeOrder }) => {
  const statusClass =
    line.status === 'completed'
      ? 'border-success bg-success-light'
      : line.status === 'partial'
      ? 'border-warning bg-warning-light'
      : isActive
      ? 'border-info bg-info-light'
      : 'border-borders-default bg-surface-secondary';

  const statusIcon =
    line.status === 'completed' ? '✅' :
    line.status === 'partial' ? '🟡' :
    isActive ? '🔵' :
    '⚪';

  const remaining = line.quantityPlan - line.quantityFact;

  return (
    <div 
      className={`card border-2 ${statusClass} transition-all ${
        isActive ? 'ring-2 ring-brand-primary scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {routeOrder !== undefined && (
              <div className="flex-shrink-0 w-10 h-10 bg-info text-white rounded-full flex items-center justify-center font-bold">
                {routeOrder}
              </div>
            )}
            <span className="text-2xl">{statusIcon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-content-primary">
                {line.productName}
              </h3>
              <p className="text-sm text-content-secondary">
                Артикул: {line.productSku}
              </p>
            </div>
          </div>

          {/* Cell info */}
          <div className="mt-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-content-secondary">Ячейка:</span>
              <span className="font-bold text-lg text-info-dark bg-info-light px-3 py-1 rounded">
                📍 {line.cellName}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-surface-tertiary border border-borders-default rounded p-2">
              <div className="text-xs text-content-secondary">План</div>
              <div className="text-lg font-bold text-content-primary">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-surface-tertiary border border-borders-default rounded p-2">
              <div className="text-xs text-content-secondary">Подобрано</div>
              <div className="text-lg font-bold text-success">
                {line.quantityFact}
              </div>
            </div>
            <div className="bg-surface-tertiary border border-borders-default rounded p-2">
              <div className="text-xs text-content-secondary">Осталось</div>
              <div className="text-lg font-bold text-info">
                {remaining}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {line.quantityPlan > 0 && (
        <div className="mt-4">
          <div className="w-full bg-surface-tertiary rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{ width: `${(line.quantityFact / line.quantityPlan) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isActive && (
        <div className="mt-3 p-2 bg-info-light border border-info rounded text-center">
          <p className="text-sm font-semibold text-info-dark">
            👆 Отсканируйте товар из этой ячейки
          </p>
        </div>
      )}
    </div>
  );
};

export default PickingCard;

