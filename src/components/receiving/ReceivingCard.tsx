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
    line.status === 'completed' ? 'bg-green-100 border-green-500 dark:bg-green-900' :
    line.status === 'partial' ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900' :
    line.status === 'error' ? 'bg-red-100 border-red-500 dark:bg-red-900' :
    'bg-gray-100 border-gray-300 dark:bg-gray-700';

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
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {line.productName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Артикул: {line.productSku}
              </p>
              {line.barcode && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  ШК: {line.barcode}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">План</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {line.quantityPlan}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Факт</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {line.quantityFact}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Остаток</div>
              <div className={`text-lg font-bold ${
                showDifference 
                  ? difference > 0 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
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
          onClick={() => onAdjust(-1)}
          className="btn-secondary flex-1"
          disabled={line.quantityFact === 0}
        >
          −1
        </button>
        <button
          onClick={() => onAdjust(1)}
          className="btn-primary flex-1"
        >
          +1
        </button>
      </div>

      {showDifference && (
        <div className={`mt-2 p-2 rounded text-sm text-center ${
          difference > 0 
            ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {difference > 0 ? '⚠️ Излишки' : '⚠️ Недостача'}: {Math.abs(difference)} шт.
        </div>
      )}
    </div>
  );
};

export default ReceivingCard;

