import React from 'react';
import { MapPin, CheckCircle, ArrowRight, Circle } from 'lucide-react';

interface RouteStep {
  cellId: string;
  cellName: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    picked: number;
  }>;
  status: 'pending' | 'current' | 'completed' | 'skipped';
}

interface RouteVisualizationProps {
  route: RouteStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
}

/**
 * Визуализация маршрута подбора
 * US III.1: Показ маршрута с индикатором прогресса
 */
export const RouteVisualization: React.FC<RouteVisualizationProps> = ({
  route,
  currentStepIndex,
  onStepClick,
}) => {
  const progress = route.length > 0 ? ((currentStepIndex + 1) / route.length) * 100 : 0;

  return (
    <div className="bg-surface-secondary rounded-lg p-4 space-y-4">
      {/* Заголовок и прогресс */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Маршрут подбора</h3>
          <span className="text-sm font-mono">
            {currentStepIndex + 1} / {route.length}
          </span>
        </div>
        <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Список ячеек (скроллируемый) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {route.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = step.status === 'completed';
          const isSkipped = step.status === 'skipped';
          const isPast = index < currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div
              key={step.cellId}
              onClick={() => onStepClick?.(index)}
              className={`flex-shrink-0 w-32 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-brand-primary bg-brand-primary/10 shadow-lg scale-105'
                  : isCompleted
                  ? 'border-success bg-success/10'
                  : isSkipped
                  ? 'border-warning bg-warning/10'
                  : isPast
                  ? 'border-separator bg-surface-tertiary opacity-60'
                  : 'border-separator hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <MapPin
                  size={16}
                  className={
                    isCurrent
                      ? 'text-brand-primary'
                      : isCompleted
                      ? 'text-success'
                      : isSkipped
                      ? 'text-warning'
                      : 'text-content-tertiary'
                  }
                />
                {isCompleted && <CheckCircle size={16} className="text-success" />}
                {isSkipped && <Circle size={16} className="text-warning" />}
              </div>

              <div className="font-bold text-sm mb-1">{step.cellName}</div>
              <div className="text-xs text-content-tertiary">
                {step.products.length} {step.products.length === 1 ? 'товар' : 'товаров'}
              </div>

              {isCurrent && (
                <div className="mt-2 pt-2 border-t border-separator">
                  <div className="text-xs font-bold text-brand-primary">ТЕКУЩАЯ</div>
                </div>
              )}

              {isCompleted && (
                <div className="mt-2 pt-2 border-t border-separator">
                  <div className="text-xs font-bold text-success">ГОТОВО</div>
                </div>
              )}

              {isSkipped && (
                <div className="mt-2 pt-2 border-t border-separator">
                  <div className="text-xs font-bold text-warning">ПРОПУЩЕНО</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Текущая и следующая ячейка */}
      <div className="flex items-center gap-3 pt-2 border-t border-separator">
        <div className="flex-1">
          <div className="text-xs text-content-tertiary mb-1">Текущая ячейка</div>
          <div className="font-bold text-brand-primary">
            {route[currentStepIndex]?.cellName || '—'}
          </div>
        </div>

        {currentStepIndex < route.length - 1 && (
          <>
            <ArrowRight size={20} className="text-content-tertiary" />
            <div className="flex-1">
              <div className="text-xs text-content-tertiary mb-1">Следующая</div>
              <div className="font-bold">{route[currentStepIndex + 1]?.cellName || '—'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};



