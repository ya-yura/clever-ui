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
  const statusColor = 
    line.status === 'completed' ? 'bg-green-100 border-green-500 dark:bg-green-900' :
    line.status === 'partial' ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900' :
    isActive ? 'bg-blue-100 border-blue-500 dark:bg-blue-900' :
    'bg-gray-100 border-gray-300 dark:bg-gray-700';

  const statusIcon =
    line.status === 'completed' ? '🟢' :
    line.status === 'partial' ? '🟡' :
    isActive ? '🔵' :
    '⚪';

  const remaining = line.quantityPlan - line.quantityFact;

  return (
    <div 
      className={`card border-2 ${statusColor} transition-all cursor-pointer ${
        isActive ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{statusIcon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {line.productName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Артикул: {line.productSku}
              </p>
            </div>
          </div>

          {/* Cell info */}
          <div className="mt-3 space-y-2">
            {line.suggestedCellName && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Рекомендуемая ячейка:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded">
                  📍 {line.suggestedCellName}
                </span>
              </div>
            )}
            {line.cellName && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Текущая ячейка:</span>
                <span className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 px-2 py-1 rounded">
                  ✓ {line.cellName}
                </span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Всего</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Размещено</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {line.quantityFact}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Осталось</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {remaining}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {line.quantityPlan > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${(line.quantityFact / line.quantityPlan) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementCard;

