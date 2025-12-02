import React from 'react';
import { Button } from '@/design/components';

interface Props {
  line: any;
  onAdjust: (delta: number) => void;
}

export const PlacementCard: React.FC<Props> = ({ line, onAdjust }) => {
  return (
    <div className={`card p-4 border-l-4 ${
        line.status === 'completed' ? 'border-success' : 'border-brand-primary'
    }`}>
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">{line.productName}</h3>
          <div className="text-sm text-content-secondary">
            {line.cellId ? (
                <span className="bg-surface-tertiary px-2 py-0.5 rounded mr-2">
                    📍 {line.cellId}
                </span>
            ) : (
                <span className="text-warning">Не размещено</span>
            )}
          </div>
        </div>
        <div className="text-right">
             <div className="text-xl font-bold">
                {line.quantityFact} / {line.quantityPlan}
             </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onAdjust(-1); }}>-1</Button>
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onAdjust(1); }}>+1</Button>
      </div>
    </div>
  );
};
