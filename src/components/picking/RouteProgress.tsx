import React from 'react';
import { MapPin, Check, ArrowRight } from 'lucide-react';

interface RouteStep {
  cellId: string;
  productName: string;
  quantity: number;
  completed: boolean;
}

interface RouteProgressProps {
  steps: RouteStep[];
  currentStepIndex: number;
}

/**
 * US III.1: Навигация по маршруту
 * Компонент для отображения оптимального маршрута подбора
 */
export const RouteProgress: React.FC<RouteProgressProps> = ({ steps, currentStepIndex }) => {
  if (steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="bg-surface-secondary p-4 rounded-lg space-y-4">
      {/* Прогресс маршрута */}
      <div>
        <div className="flex justify-between text-xs text-content-tertiary mb-2">
          <span>Прогресс маршрута</span>
          <span>
            {completedCount} / {steps.length}
          </span>
        </div>
        <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Текущая ячейка */}
      {currentStep && !currentStep.completed && (
        <div className="bg-brand-primary/10 border-2 border-brand-primary rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-brand-primary" size={20} />
            <span className="text-xs font-medium text-brand-primary">ТЕКУЩАЯ ЯЧЕЙКА</span>
          </div>
          <div className="text-4xl font-bold font-mono mb-2">{currentStep.cellId}</div>
          <div className="text-sm text-content-secondary">{currentStep.productName}</div>
          <div className="text-xs text-content-tertiary mt-1">
            Взять: {currentStep.quantity} шт.
          </div>
        </div>
      )}

      {/* Следующая ячейка */}
      {nextStep && (
        <div className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-lg">
          <ArrowRight className="text-content-tertiary" size={20} />
          <div className="flex-1">
            <div className="text-xs text-content-tertiary">Следующая</div>
            <div className="font-bold font-mono">{nextStep.cellId}</div>
          </div>
        </div>
      )}

      {/* Завершенные шаги */}
      {completedCount > 0 && (
        <div className="pt-3 border-t border-borders-default">
          <div className="text-xs text-content-tertiary mb-2">Выполнено:</div>
          <div className="flex flex-wrap gap-2">
            {steps
              .filter((s) => s.completed)
              .slice(-3)
              .map((step, i) => (
                <div
                  key={i}
                  className="px-2 py-1 bg-success/20 text-success-dark rounded text-xs font-mono flex items-center gap-1"
                >
                  <Check size={12} />
                  {step.cellId}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
