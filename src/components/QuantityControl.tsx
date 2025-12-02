import React, { useState, useEffect } from 'react';
import { Button } from '@/design/components';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  current: number;
  plan?: number;
  onChange: (newVal: number) => void;
  readonly?: boolean;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  current,
  plan,
  onChange,
  readonly = false,
}) => {
  const [value, setValue] = useState(current.toString());

  useEffect(() => {
    setValue(current.toString());
  }, [current]);

  const handleChange = (val: string) => {
    setValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const adjust = (delta: number) => {
    const newVal = Math.max(0, (parseInt(value, 10) || 0) + delta);
    onChange(newVal);
  };

  if (readonly) {
    return <div className="text-2xl font-bold">{current} шт.</div>;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => adjust(-1)}
          disabled={current <= 0}
        >
          <Minus size={20} />
        </Button>

        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 text-center text-2xl font-bold border border-borders-default rounded-lg py-2 bg-surface-primary text-content-primary focus:ring-2 focus:ring-brand-primary outline-none"
        />

        <Button
          variant="secondary"
          size="icon"
          onClick={() => adjust(1)}
        >
          <Plus size={20} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={() => adjust(1)}>+1</Button>
        <Button variant="secondary" size="sm" onClick={() => adjust(5)}>+5</Button>
        <Button variant="secondary" size="sm" onClick={() => adjust(10)}>+10</Button>
      </div>
      
      {plan !== undefined && (
        <div className="text-center text-xs text-content-tertiary">
          План: {plan} | Осталось: {Math.max(0, plan - current)}
        </div>
      )}
    </div>
  );
};





