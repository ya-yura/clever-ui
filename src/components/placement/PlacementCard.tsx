// === 📁 src/components/placement/PlacementCard.tsx ===
// Product card for placement module

import React from 'react';
import { PlacementLine } from '@/types/placement';

interface Props {
  line: PlacementLine;
  isActive?: boolean;
  onSelect?: () => void;
}

const PlacementCard: React.FC<Props> = ({ line, isActive, onSelect }) => {
  const statusClass =
    line.status === 'completed'
      ? 'border-success bg-success-light'
      : line.status === 'partial'
      ? 'border-warning bg-warning-light'
      : isActive
      ? 'border-info bg-info-light'
      : 'border-borders-default bg-surface-secondary';

  const statusIcon =
    line.status === 'completed' ? '🟢' :
    line.status === 'partial' ? '🟡' :
    isActive ? '🔵' :
    '⚪';

  const remaining = line.quantityPlan - line.quantityFact;

  return (
    <div 
      className={`card border-2 ${statusClass} transition-all cursor-pointer ${
        isActive ? 'ring-2 ring-brand-primary' : ''
      }`}
      onClick={onSelect}
    >
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
            </div>
          </div>

          {/* Cell info */}
          <div className="mt-3 space-y-2">
            {line.suggestedCellName && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-content-secondary">Рекомендуемая ячейка:</span>
                <span className="font-semibold text-info-dark bg-info-light px-2 py-1 rounded">
                  📍 {line.suggestedCellName}
                </span>
              </div>
            )}
            {line.cellName && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-content-secondary">Текущая ячейка:</span>
                <span className="font-semibold text-success-dark bg-success-light px-2 py-1 rounded">
                  ✓ {line.cellName}
                </span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-surface-tertiary border border-borders-default rounded p-2">
              <div className="text-xs text-content-secondary">Всего</div>
              <div className="text-lg font-bold text-content-primary">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-surface-tertiary border border-borders-default rounded p-2">
              <div className="text-xs text-content-secondary">Размещено</div>
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
    </div>
  );
};

export default PlacementCard;

