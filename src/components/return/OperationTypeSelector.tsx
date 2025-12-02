import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';

interface OperationTypeSelectorProps {
  selected: 'return' | 'writeoff' | null;
  onSelect: (type: 'return' | 'writeoff') => void;
}

/**
 * US V.1: Выбор типа операции (Возврат / Списание)
 */
export const OperationTypeSelector: React.FC<OperationTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
      <h3 className="font-bold">Тип операции</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Возврат */}
        <button
          onClick={() => onSelect('return')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selected === 'return'
              ? 'border-brand-primary bg-brand-primary/10 shadow-lg'
              : 'border-separator hover:border-brand-primary/50'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full ${
              selected === 'return' ? 'bg-brand-primary/20' : 'bg-surface-tertiary'
            }`}>
              <RotateCcw 
                size={24} 
                className={selected === 'return' ? 'text-brand-primary' : 'text-content-tertiary'}
              />
            </div>
            <div className={`font-bold ${selected === 'return' ? 'text-brand-primary' : ''}`}>
              Возврат
            </div>
            <p className="text-xs text-content-tertiary text-center">
              От клиента или поставщику
            </p>
          </div>
        </button>

        {/* Списание */}
        <button
          onClick={() => onSelect('writeoff')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selected === 'writeoff'
              ? 'border-error bg-error/10 shadow-lg'
              : 'border-separator hover:border-error/50'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full ${
              selected === 'writeoff' ? 'bg-error/20' : 'bg-surface-tertiary'
            }`}>
              <Trash2 
                size={24} 
                className={selected === 'writeoff' ? 'text-error' : 'text-content-tertiary'}
              />
            </div>
            <div className={`font-bold ${selected === 'writeoff' ? 'text-error' : ''}`}>
              Списание
            </div>
            <p className="text-xs text-content-tertiary text-center">
              Брак, утеря, повреждение
            </p>
          </div>
        </button>
      </div>

      {selected && (
        <div className={`p-3 rounded-lg text-center text-sm ${
          selected === 'return' 
            ? 'bg-brand-primary/10 text-brand-primary' 
            : 'bg-error/10 text-error'
        }`}>
          Выбран тип: <span className="font-bold">
            {selected === 'return' ? 'ВОЗВРАТ' : 'СПИСАНИЕ'}
          </span>
        </div>
      )}
    </div>
  );
};



