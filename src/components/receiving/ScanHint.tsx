// === 📁 src/components/receiving/ScanHint.tsx ===
// Scan hint component

import React from 'react';

interface Props {
  lastScan?: string;
  hint?: string;
}

const ScanHint: React.FC<Props> = ({ lastScan, hint }) => {
  return (
    <div className="card bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">📱</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {hint || 'Сканируйте товар или документ'}
          </p>
          {lastScan && (
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Последний скан: {lastScan}
            </p>
          )}
        </div>
        <div className="animate-pulse">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ScanHint;

