import React, { useState } from 'react';
import { Button } from '@/design/components';
import { AlertTriangle, PackageX, TrendingDown, Trash, HelpCircle, MessageSquare } from 'lucide-react';

interface ReasonSelectorProps {
  operationType: 'return' | 'writeoff';
  onSubmit: (reason: string, comment?: string) => void;
  onCancel: () => void;
}

/**
 * US V.2: Выбор причины возврата/списания
 * + дополнительный комментарий
 */
export const ReasonSelector: React.FC<ReasonSelectorProps> = ({
  operationType,
  onSubmit,
  onCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const returnReasons = [
    { id: 'damaged_in_delivery', label: 'Повреждено при доставке', icon: PackageX, color: 'orange' },
    { id: 'wrong_item', label: 'Не тот товар', icon: AlertTriangle, color: 'yellow' },
    { id: 'defective', label: 'Заводской брак', icon: TrendingDown, color: 'red' },
    { id: 'client_refusal', label: 'Отказ клиента', icon: HelpCircle, color: 'blue' },
    { id: 'other', label: 'Другое...', icon: MessageSquare, color: 'gray' },
  ];

  const writeoffReasons = [
    { id: 'defect', label: 'Брак', icon: AlertTriangle, color: 'red' },
    { id: 'loss', label: 'Утеря', icon: HelpCircle, color: 'orange' },
    { id: 'damage', label: 'Повреждение', icon: PackageX, color: 'yellow' },
    { id: 'expired', label: 'Просрочка', icon: TrendingDown, color: 'purple' },
    { id: 'write_off', label: 'Списание', icon: Trash, color: 'gray' },
    { id: 'other', label: 'Другое...', icon: MessageSquare, color: 'gray' },
  ];

  const reasons = operationType === 'return' ? returnReasons : writeoffReasons;

  const handleReasonClick = (reasonId: string) => {
    setSelectedReason(reasonId);
    setShowCustomInput(reasonId === 'other');
    if (reasonId !== 'other') {
      setComment(''); // Reset comment if not "other"
    }
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      alert('Выберите причину');
      return;
    }

    if (selectedReason === 'other' && !comment.trim()) {
      alert('Введите причину');
      return;
    }

    const reasonLabel = reasons.find(r => r.id === selectedReason)?.label || selectedReason;
    const finalReason = selectedReason === 'other' ? comment.trim() : reasonLabel;
    
    onSubmit(finalReason, comment.trim() || undefined);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { border: string; bg: string; text: string }> = {
      red: { 
        border: 'border-error', 
        bg: 'bg-error/10', 
        text: 'text-error' 
      },
      orange: { 
        border: 'border-warning', 
        bg: 'bg-warning/10', 
        text: 'text-warning' 
      },
      yellow: { 
        border: 'border-warning', 
        bg: 'bg-warning-light', 
        text: 'text-warning-dark' 
      },
      blue: { 
        border: 'border-brand-primary', 
        bg: 'bg-brand-primary/10', 
        text: 'text-brand-primary' 
      },
      purple: { 
        border: 'border-purple-500', 
        bg: 'bg-purple-100', 
        text: 'text-purple-700' 
      },
      gray: { 
        border: 'border-separator', 
        bg: 'bg-surface-tertiary', 
        text: 'text-content-secondary' 
      },
    };

    const colors = colorMap[color] || colorMap.gray;
    
    if (isSelected) {
      return `border-2 ${colors.border} ${colors.bg}`;
    }
    return 'border-2 border-separator hover:border-content-tertiary';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-primary rounded-2xl max-w-md w-full shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-separator">
          <h2 className="text-xl font-bold">Выберите причину</h2>
          <p className="text-sm text-content-secondary">
            {operationType === 'return' ? 'Причина возврата' : 'Причина списания'}
          </p>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            const isSelected = selectedReason === reason.id;

            return (
              <button
                key={reason.id}
                onClick={() => handleReasonClick(reason.id)}
                className={`w-full p-4 rounded-lg transition-all ${getColorClasses(reason.color, isSelected)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? `bg-${reason.color}-500/20` 
                      : 'bg-surface-secondary'
                  }`}>
                    <Icon size={20} className={
                      isSelected 
                        ? reason.color === 'red' ? 'text-error' :
                          reason.color === 'orange' ? 'text-warning' :
                          reason.color === 'yellow' ? 'text-warning-dark' :
                          reason.color === 'blue' ? 'text-brand-primary' :
                          reason.color === 'purple' ? 'text-purple-600' :
                          'text-content-secondary'
                        : 'text-content-tertiary'
                    } />
                  </div>
                  <span className={`font-medium ${isSelected ? 'font-bold' : ''}`}>
                    {reason.label}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-success">✓</span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Custom input for "Other" */}
          {showCustomInput && (
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">
                Укажите причину:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Опишите причину..."
                className="w-full p-3 border border-borders-default rounded-lg bg-surface-secondary resize-none"
                rows={3}
                autoFocus
              />
            </div>
          )}

          {/* Optional comment for predefined reasons */}
          {selectedReason && selectedReason !== 'other' && (
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">
                Дополнительный комментарий (опционально):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Добавьте подробности..."
                className="w-full p-3 border border-borders-default rounded-lg bg-surface-secondary resize-none"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="w-full"
          >
            Подтвердить
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            className="w-full"
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};



