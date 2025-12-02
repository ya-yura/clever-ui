import React, { useState } from 'react';
import { Button } from '@/design/components';
import { Warehouse, Grid3x3, MapPin } from 'lucide-react';

interface InventoryTypeSelectorProps {
  onSelect: (type: 'full' | 'partial' | 'cell', zones?: string[], cells?: string[]) => void;
  onCancel: () => void;
}

/**
 * US VI.1: Выбор типа инвентаризации
 * - Полная (весь склад)
 * - Частичная (выбранные зоны/ячейки)
 * - По конкретной ячейке
 */
export const InventoryTypeSelector: React.FC<InventoryTypeSelectorProps> = ({
  onSelect,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState<'full' | 'partial' | 'cell' | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [cellInput, setCellInput] = useState('');

  const zones = ['Зона А', 'Зона Б', 'Зона В', 'Зона Г'];

  const handleTypeClick = (type: 'full' | 'partial' | 'cell') => {
    setSelectedType(type);
    if (type === 'full') {
      setSelectedZones([]);
      setSelectedCells([]);
    }
  };

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const addCell = () => {
    if (cellInput.trim() && !selectedCells.includes(cellInput.trim())) {
      setSelectedCells((prev) => [...prev, cellInput.trim()]);
      setCellInput('');
    }
  };

  const removeCell = (cell: string) => {
    setSelectedCells((prev) => prev.filter((c) => c !== cell));
  };

  const handleSubmit = () => {
    if (!selectedType) {
      alert('Выберите тип инвентаризации');
      return;
    }

    if (selectedType === 'partial' && selectedZones.length === 0 && selectedCells.length === 0) {
      alert('Выберите хотя бы одну зону или ячейку');
      return;
    }

    if (selectedType === 'cell' && selectedCells.length === 0) {
      alert('Укажите хотя бы одну ячейку');
      return;
    }

    onSelect(
      selectedType,
      selectedZones.length > 0 ? selectedZones : undefined,
      selectedCells.length > 0 ? selectedCells : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-primary rounded-2xl max-w-lg w-full shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-separator">
          <h2 className="text-xl font-bold">Тип инвентаризации</h2>
          <p className="text-sm text-content-secondary">Выберите область проверки</p>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Полная */}
          <button
            onClick={() => handleTypeClick('full')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedType === 'full'
                ? 'border-brand-primary bg-brand-primary/10 shadow-lg'
                : 'border-separator hover:border-brand-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  selectedType === 'full' ? 'bg-brand-primary/20' : 'bg-surface-tertiary'
                }`}
              >
                <Warehouse
                  size={24}
                  className={selectedType === 'full' ? 'text-brand-primary' : 'text-content-tertiary'}
                />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-bold ${selectedType === 'full' ? 'text-brand-primary' : ''}`}>
                  Полная инвентаризация
                </div>
                <p className="text-xs text-content-tertiary">Весь склад</p>
              </div>
              {selectedType === 'full' && <span className="text-success text-xl">✓</span>}
            </div>
          </button>

          {/* Частичная */}
          <button
            onClick={() => handleTypeClick('partial')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedType === 'partial'
                ? 'border-warning bg-warning/10 shadow-lg'
                : 'border-separator hover:border-warning/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  selectedType === 'partial' ? 'bg-warning/20' : 'bg-surface-tertiary'
                }`}
              >
                <Grid3x3
                  size={24}
                  className={selectedType === 'partial' ? 'text-warning' : 'text-content-tertiary'}
                />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-bold ${selectedType === 'partial' ? 'text-warning' : ''}`}>
                  Частичная инвентаризация
                </div>
                <p className="text-xs text-content-tertiary">Выбранные зоны/ячейки</p>
              </div>
              {selectedType === 'partial' && <span className="text-success text-xl">✓</span>}
            </div>
          </button>

          {/* Зоны (для частичной) */}
          {selectedType === 'partial' && (
            <div className="ml-4 pl-4 border-l-2 border-warning space-y-2">
              <label className="block text-sm font-medium">Зоны:</label>
              <div className="grid grid-cols-2 gap-2">
                {zones.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => toggleZone(zone)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedZones.includes(zone)
                        ? 'border-warning bg-warning/20 text-warning-dark'
                        : 'border-separator hover:border-warning/30'
                    }`}
                  >
                    {selectedZones.includes(zone) && '✓ '}
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* По ячейке */}
          <button
            onClick={() => handleTypeClick('cell')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedType === 'cell'
                ? 'border-info bg-info/10 shadow-lg'
                : 'border-separator hover:border-info/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  selectedType === 'cell' ? 'bg-info/20' : 'bg-surface-tertiary'
                }`}
              >
                <MapPin
                  size={24}
                  className={selectedType === 'cell' ? 'text-info' : 'text-content-tertiary'}
                />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-bold ${selectedType === 'cell' ? 'text-info' : ''}`}>
                  По конкретной ячейке
                </div>
                <p className="text-xs text-content-tertiary">Одна или несколько ячеек</p>
              </div>
              {selectedType === 'cell' && <span className="text-success text-xl">✓</span>}
            </div>
          </button>

          {/* Ввод ячеек (для частичной и по ячейке) */}
          {(selectedType === 'partial' || selectedType === 'cell') && (
            <div className={`ml-4 pl-4 border-l-2 ${selectedType === 'cell' ? 'border-info' : 'border-warning'} space-y-2`}>
              <label className="block text-sm font-medium">Ячейки:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cellInput}
                  onChange={(e) => setCellInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && addCell()}
                  placeholder="Например: A1-01"
                  className="flex-1 p-2 border border-borders-default rounded-lg bg-surface-secondary"
                />
                <Button onClick={addCell} size="sm">
                  Добавить
                </Button>
              </div>

              {selectedCells.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCells.map((cell) => (
                    <div
                      key={cell}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                        selectedType === 'cell'
                          ? 'bg-info/20 text-info-dark'
                          : 'bg-warning/20 text-warning-dark'
                      }`}
                    >
                      {cell}
                      <button onClick={() => removeCell(cell)} className="hover:scale-110">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Итоги выбора */}
          {selectedType && (
            <div className="bg-surface-secondary rounded-lg p-4 text-sm space-y-1">
              <div className="font-bold">Выбрано:</div>
              {selectedType === 'full' && <div>• Весь склад</div>}
              {selectedType === 'partial' && (
                <>
                  {selectedZones.length > 0 && <div>• Зоны: {selectedZones.join(', ')}</div>}
                  {selectedCells.length > 0 && <div>• Ячейки: {selectedCells.length} шт</div>}
                </>
              )}
              {selectedType === 'cell' && <div>• Ячейки: {selectedCells.length} шт</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator space-y-3">
          <Button onClick={handleSubmit} disabled={!selectedType} className="w-full">
            Начать инвентаризацию
          </Button>
          <Button variant="secondary" onClick={onCancel} className="w-full">
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};



