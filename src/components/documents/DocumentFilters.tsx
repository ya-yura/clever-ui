// === 📁 src/components/documents/DocumentFilters.tsx ===
// Document filters and search component

import React, { useState } from 'react';
import {
  DocumentFilter,
  DocumentType,
  DocumentSort,
  DocumentSortField,
  DOCUMENT_TYPE_LABELS,
  STATUS_LABELS,
} from '@/types/document';
import { DocumentStatus } from '@/types/common';
import { Chip, Badge, Button } from '@/design/components';
import analytics, { EventType } from '@/lib/analytics';

interface DocumentFiltersProps {
  filter: DocumentFilter;
  sort: DocumentSort;
  totalCount: number;
  filteredCount: number;
  onFilterChange: (filter: DocumentFilter) => void;
  onSortChange: (sort: DocumentSort) => void;
  onReset: () => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filter,
  sort,
  totalCount,
  filteredCount,
  onFilterChange,
  onSortChange,
  onReset,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      searchQuery: e.target.value,
    });
    
    // Debounce tracking would be better, but tracking on change for now
    if (e.target.value.length > 2) {
      analytics.track(EventType.SEARCH_USE, {
        query: e.target.value,
        module: 'documents',
      });
    }
  };

  const handleTypeToggle = (type: DocumentType) => {
    const types = filter.types || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    onFilterChange({
      ...filter,
      types: newTypes.length > 0 ? newTypes : undefined,
    });

    analytics.track(EventType.FILTER_USE, {
      filterType: 'type',
      value: type,
      action: types.includes(type) ? 'remove' : 'add'
    });
  };

  const handleStatusToggle = (status: DocumentStatus) => {
    const statuses = filter.statuses || [];
    const newStatuses = statuses.includes(status)
      ? statuses.filter(s => s !== status)
      : [...statuses, status];
    
    onFilterChange({
      ...filter,
      statuses: newStatuses.length > 0 ? newStatuses : undefined,
    });

    analytics.track(EventType.FILTER_USE, {
      filterType: 'status',
      value: status,
      action: statuses.includes(status) ? 'remove' : 'add'
    });
  };

  const handleSortChange = (field: DocumentSortField) => {
    if (sort.field === field) {
      // Toggle direction
      const newDirection = sort.direction === 'asc' ? 'desc' : 'asc';
      onSortChange({
        field,
        direction: newDirection,
      });
      
      analytics.track(EventType.SORT_USE, {
        sortBy: field,
        order: newDirection,
        module: 'documents'
      });
    } else {
      onSortChange({
        field,
        direction: 'desc',
      });

      analytics.track(EventType.SORT_USE, {
        sortBy: field,
        order: 'desc',
        module: 'documents'
      });
    }
  };

  const hasActiveFilters = Boolean(
    filter.types?.length ||
    filter.statuses?.length ||
    filter.searchQuery?.trim()
  );

  return (
    <div className="bg-surface-secondary border-b border-surface-tertiary sticky top-0 z-10 shadow-soft">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Найти"
            value={filter.searchQuery || ''}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-10 text-base border border-surface-tertiary rounded-lg bg-surface-primary text-content-primary focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary placeholder-content-tertiary transition-all outline-none"
          />
          {!filter.searchQuery && (
            <span className="absolute left-3 top-3.5 text-xl pointer-events-none opacity-50">🔍</span>
          )}
          
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-3 text-content-tertiary hover:text-content-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle & Stats */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <Button
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          startIcon={<span>🎚️</span>}
        >
          Фильтры
          {hasActiveFilters && (
            <Badge 
              label={String((filter.types?.length || 0) + (filter.statuses?.length || 0))} 
              variant="neutral"
              className="ml-2 bg-brand-dark/20 text-brand-dark border-brand-dark/30"
            />
          )}
        </Button>

        <div className="text-sm text-content-tertiary">
          Показано: <strong className="text-content-primary">{filteredCount}</strong> из <strong className="text-content-primary">{totalCount}</strong>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-surface-tertiary pt-4 space-y-4 bg-surface-secondary">
          {/* Document Types */}
          <div>
            <div className="text-sm font-medium text-content-tertiary mb-2">Тип документа</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(type => (
                <Chip
                  key={type}
                  label={DOCUMENT_TYPE_LABELS[type]}
                  variant="primary"
                  active={filter.types?.includes(type)}
                  onClick={() => handleTypeToggle(type)}
                />
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <div className="text-sm font-medium text-content-tertiary mb-2">Статус</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as DocumentStatus[]).map(status => {
                // Map status to chip variant
                const variantMap: Record<DocumentStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
                  pending: 'neutral',
                  draft: 'neutral',
                  in_progress: 'warning',
                  completed: 'success',
                  cancelled: 'error',
                  synced: 'success',
                  error: 'error',
                };
                
                return (
                  <Chip
                    key={status}
                    label={STATUS_LABELS[status]}
                    variant={variantMap[status]}
                    active={filter.statuses?.includes(status)}
                    onClick={() => handleStatusToggle(status)}
                  />
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="text-sm font-medium text-content-tertiary mb-2">Сортировка</div>
            <div className="flex flex-wrap gap-2">
              {[
                { field: 'createdAt' as DocumentSortField, label: 'Дата создания' },
                { field: 'updatedAt' as DocumentSortField, label: 'Обновлено' },
                { field: 'number' as DocumentSortField, label: 'Номер' },
                { field: 'status' as DocumentSortField, label: 'Статус' },
              ].map(({ field, label }) => (
                <Chip
                  key={field}
                  label={`${label}${sort.field === field ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}`}
                  variant="info"
                  active={sort.field === field}
                  onClick={() => handleSortChange(field)}
                />
              ))}
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={onReset}
                startIcon={<span>↻</span>}
              >
                Сбросить все фильтры
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
