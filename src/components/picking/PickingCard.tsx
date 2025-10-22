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
  const statusColor = 
    line.status === 'completed' ? 'bg-green-100 border-green-500 dark:bg-green-900' :
    line.status === 'partial' ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900' :
    isActive ? 'bg-blue-100 border-blue-500 dark:bg-blue-900' :
    'bg-gray-100 border-gray-300 dark:bg-gray-700';

  const statusIcon =
    line.status === 'completed' ? '✅' :
    line.status === 'partial' ? '🟡' :
    isActive ? '🔵' :
    '⚪';

  const remaining = line.quantityPlan - line.quantityFact;

  return (
    <div 
      className={`card border-2 ${statusColor} transition-all ${
        isActive ? 'ring-2 ring-blue-400 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {routeOrder !== undefined && (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {routeOrder}
              </div>
            )}
            <span className="text-2xl">{statusIcon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {line.productName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Артикул: {line.productSku}
              </p>
            </div>
          </div>

          {/* Cell info */}
          <div className="mt-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ячейка:</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded">
                📍 {line.cellName}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">План</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Подобрано</div>
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

      {isActive && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded text-center">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            👆 Отсканируйте товар из этой ячейки
          </p>
        </div>
      )}
    </div>
  );
};

export default PickingCard;

