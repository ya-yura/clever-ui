import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/design/components';

interface FilterOptions {
  search: string;
  status: 'all' | 'new' | 'in_progress' | 'completed';
  dateFrom?: string;
  dateTo?: string;
  supplier?: string;
}

interface DocumentListFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  supplierOptions?: string[];
  showSupplier?: boolean;
}

export const DocumentListFilter: React.FC<DocumentListFilterProps> = ({
  onFilterChange,
  supplierOptions = [],
  showSupplier = true,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FilterOptions = {
      search: '',
      status: 'all',
    };
    setFilters(cleared);
    onFilterChange(cleared);
    setShowAdvanced(false);
  };

  return (
    <div className="space-y-3">
      {/* US VII.1: Поиск документа */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-tertiary" size={20} />
        <input
          type="text"
          placeholder="Поиск по номеру, партнеру..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-borders-default rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
        />
        {filters.search && (
          <button
            onClick={() => handleChange('search', '')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X size={20} className="text-content-tertiary" />
          </button>
        )}
      </div>

      {/* US VII.2: Фильтрация по статусу */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'new', 'in_progress', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleChange('status', status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filters.status === status
                ? 'bg-brand-primary text-white'
                : 'bg-surface-secondary text-content-secondary hover:bg-surface-tertiary'
            }`}
          >
            {status === 'all' && 'Все'}
            {status === 'new' && 'Новые'}
            {status === 'in_progress' && 'В работе'}
            {status === 'completed' && 'Завершены'}
          </button>
        ))}
      </div>

      {/* Расширенные фильтры */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-brand-primary hover:underline"
        >
          <Filter size={16} />
          {showAdvanced ? 'Скрыть фильтры' : 'Расширенные фильтры'}
        </button>
        {(filters.dateFrom || filters.dateTo || filters.supplier) && (
          <button onClick={clearFilters} className="text-content-tertiary hover:text-error text-sm">
            Сбросить все
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="space-y-3 p-4 bg-surface-secondary rounded-lg">
          {/* US VII.2: Фильтрация по дате */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-content-secondary mb-1">Дата с</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="w-full p-2 bg-surface-primary border border-borders-default rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-content-secondary mb-1">Дата по</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="w-full p-2 bg-surface-primary border border-borders-default rounded"
              />
            </div>
          </div>

          {/* US VII.2: Фильтрация по поставщику */}
          {showSupplier && supplierOptions.length > 0 && (
            <div>
              <label className="block text-xs text-content-secondary mb-1">Поставщик</label>
              <select
                value={filters.supplier || ''}
                onChange={(e) => handleChange('supplier', e.target.value)}
                className="w-full p-2 bg-surface-primary border border-borders-default rounded"
              >
                <option value="">Все</option>
                {supplierOptions.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



