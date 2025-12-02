import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface AutoCompletePromptProps {
  totalLines: number;
  completedLines: number;
  onComplete: () => void;
  onContinue: () => void;
}

/**
 * Prompt для автозавершения документа
 * US I.3.1: Автозавершение если все строки выполнены
 */
export const AutoCompletePrompt: React.FC<AutoCompletePromptProps> = ({
  totalLines,
  completedLines,
  onComplete,
  onContinue,
}) => {
  const isFullyCompleted = completedLines === totalLines;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface-primary rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-6 text-center border-b border-separator">
          <div className="flex justify-center mb-4">
            {isFullyCompleted ? (
              <div className="p-4 bg-success-light rounded-full">
                <CheckCircle className="text-success" size={48} />
              </div>
            ) : (
              <div className="p-4 bg-warning-light rounded-full">
                <AlertTriangle className="text-warning" size={48} />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isFullyCompleted ? 'Все строки выполнены!' : 'Приёмка почти завершена'}
          </h2>
          <p className="text-content-secondary">
            {isFullyCompleted
              ? 'Все товары получены согласно плану'
              : `Выполнено ${completedLines} из ${totalLines} строк`}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-content-secondary">Прогресс</span>
              <span className="font-bold">
                {completedLines} / {totalLines}
              </span>
            </div>
            <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isFullyCompleted ? 'bg-success' : 'bg-warning'
                }`}
                style={{ width: `${(completedLines / totalLines) * 100}%` }}
              ></div>
            </div>
          </div>

          {!isFullyCompleted && (
            <div className="bg-warning-light border border-warning rounded-lg p-4">
              <p className="text-sm text-warning-dark">
                ⚠️ Остались невыполненные строки. При завершении они будут отмечены как
                недополучены.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator space-y-3">
          <button
            onClick={onComplete}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isFullyCompleted
                ? 'bg-success hover:brightness-110 text-white'
                : 'bg-warning hover:brightness-110 text-white'
            }`}
          >
            {isFullyCompleted ? 'Завершить документ' : 'Завершить с расхождениями'}
          </button>
          <button
            onClick={onContinue}
            className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg font-medium transition-colors"
          >
            Продолжить работу
          </button>
        </div>
      </div>
    </div>
  );
};



