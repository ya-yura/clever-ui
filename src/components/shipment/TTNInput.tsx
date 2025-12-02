import React, { useState } from 'react';
import { Button } from '@/design/components';
import { Truck, FileText } from 'lucide-react';

interface TTNInputProps {
  onSubmit: (data: { ttnNumber: string; carrier: string }) => void;
  onCancel: () => void;
}

/**
 * US IV.2: Ввод ТТН/перевозчика
 * Компонент для быстрого ввода данных перевозчика и номера ТТН
 */
export const TTNInput: React.FC<TTNInputProps> = ({ onSubmit, onCancel }) => {
  const [ttnNumber, setTTNNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const carriers = [
    'СДЭК',
    'Почта России',
    'DHL',
    'FedEx',
    'ПЭК',
    'Деловые Линии',
    'Другое',
  ];

  const handleSubmit = () => {
    if (!ttnNumber.trim() || !carrier.trim()) {
      alert('Заполните все поля');
      return;
    }
    onSubmit({ ttnNumber: ttnNumber.trim(), carrier: carrier.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-primary rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="text-brand-primary" size={32} />
          <h2 className="text-xl font-bold">Данные отгрузки</h2>
        </div>

        <div className="space-y-4">
          {/* Перевозчик */}
          <div>
            <label className="block text-sm font-medium mb-2">Перевозчик</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full p-3 border border-borders-default rounded-lg bg-surface-secondary"
            >
              <option value="">Выберите...</option>
              {carriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* ТТН */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FileText size={16} />
              Номер ТТН
            </label>
            <input
              type="text"
              value={ttnNumber}
              onChange={(e) => setTTNNumber(e.target.value)}
              placeholder="Введите номер накладной..."
              className="w-full p-3 border border-borders-default rounded-lg bg-surface-secondary"
              autoFocus
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onCancel} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Готово
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};



