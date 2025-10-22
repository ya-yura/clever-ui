// === 📁 src/components/picking/RouteProgress.tsx ===
// Route progress indicator for picking

import React from 'react';
import { PickingRoute } from '@/types/picking';

interface Props {
  route: PickingRoute[];
  currentCellId?: string;
}

const RouteProgress: React.FC<Props> = ({ route, currentCellId }) => {
  const completedCount = route.filter(r => r.completed).length;
  const progress = route.length > 0 ? (completedCount / route.length) * 100 : 0;

  return (
    <div className="card bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        🗺️ Маршрут подбора
      </h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Прогресс маршрута</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {completedCount} / {route.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-600 to-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Route steps */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {route.map((step, index) => {
          const isCurrent = step.cellId === currentCellId;
          const isNext = !step.completed && route.filter(r => !r.completed)[0]?.cellId === step.cellId;

          return (
            <div
              key={step.cellId}
              className={`flex items-center space-x-3 p-2 rounded transition-all ${
                isCurrent ? 'bg-blue-100 dark:bg-blue-800 ring-2 ring-blue-400' :
                step.completed ? 'bg-green-100 dark:bg-green-900' :
                isNext ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-white dark:bg-gray-800'
              }`}
            >
              {/* Order number */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step.completed ? 'bg-green-600 text-white' :
                isCurrent || isNext ? 'bg-blue-600 text-white' :
                'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>

              {/* Cell info */}
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {step.cellName}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {step.products.length} позиций
                </div>
              </div>

              {/* Status icon */}
              <div className="text-xl">
                {step.completed ? '✅' :
                 isCurrent ? '🔵' :
                 isNext ? '⏭️' :
                 '⚪'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteProgress;

