// === 📁 src/pages/Documents.tsx ===
// Main documents page with filters and list

import React, { useState, useEffect, useMemo } from 'react';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentListSkeleton } from '@/components/documents/DocumentListSkeleton';
import { documentService } from '@/services/documentService';
import {
  UniversalDocument,
  DocumentFilter,
  DocumentSort,
} from '@/types/document';

const DEFAULT_FILTER: DocumentFilter = {
  searchQuery: '',
};

const DEFAULT_SORT: DocumentSort = {
  field: 'updatedAt',
  direction: 'desc',
};

const Documents: React.FC = () => {
  const [allDocuments, setAllDocuments] = useState<UniversalDocument[]>([]);
  const [filter, setFilter] = useState<DocumentFilter>(DEFAULT_FILTER);
  const [sort, setSort] = useState<DocumentSort>(DEFAULT_SORT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentService.getAllDocuments();
      setAllDocuments(docs);
      
      // Log for debugging
      console.log('📄 Loaded documents:', docs.length);
      
      // Don't set error if we just have no documents
      // That's a valid state, especially in demo mode with empty data
    } catch (err) {
      console.error('Error loading documents:', err);
      // Only set error for real errors (network, API, etc.)
      // Empty data is not an error
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      if (!errorMessage.includes('No data') && !errorMessage.includes('empty')) {
        setError('Не удалось загрузить документы с сервера');
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredAndSortedDocuments = useMemo(() => {
    let result = documentService.filterDocuments(allDocuments, filter);
    result = documentService.sortDocuments(result, sort);
    return result;
  }, [allDocuments, filter, sort]);

  const handleFilterChange = (newFilter: DocumentFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: DocumentSort) => {
    setSort(newSort);
  };

  const handleReset = () => {
    setFilter(DEFAULT_FILTER);
    setSort(DEFAULT_SORT);
  };

  const handleRefresh = () => {
    loadDocuments();
  };

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col">
      {/* Error Message - show only if there's a network/API error */}
      {error && (
        <div className="bg-warning/10 border-l-4 border-warning p-4 m-4 rounded-r">
          <div className="flex items-center">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <p className="text-warning font-medium">
                Не удалось загрузить данные с сервера
              </p>
              <p className="text-sm text-content-secondary mt-1">
                Используются локальные данные. Проверьте подключение к серверу.
              </p>
              <button
                onClick={handleRefresh}
                className="text-sm text-warning underline mt-2 hover:text-warning/80"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <DocumentFilters
        filter={filter}
        sort={sort}
        totalCount={allDocuments.length}
        filteredCount={filteredAndSortedDocuments.length}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onReset={handleReset}
      />

      {/* Document List */}
      <div className="flex-1 overflow-auto">
        <DocumentList
          documents={filteredAndSortedDocuments}
          loading={loading}
        />
      </div>

      {/* Quick Stats Footer (Optional) */}
      {!loading && allDocuments.length > 0 && (
        <div className="bg-surface-secondary border-t border-surface-tertiary px-4 py-3 sticky bottom-0 z-10 shadow-lg">
          <div className="flex items-center justify-around text-center text-xs">
            <div>
              <div className="text-content-tertiary">Всего</div>
              <div className="text-lg font-bold text-content-primary">
                {allDocuments.length}
              </div>
            </div>
            
            <div className="h-8 w-px bg-surface-tertiary"></div>
            
            <div>
              <div className="text-content-tertiary">В работе</div>
              <div className="text-lg font-bold text-brand-secondary">
                {allDocuments.filter(d => d.status === 'in_progress').length}
              </div>
            </div>
            
            <div className="h-8 w-px bg-surface-tertiary"></div>
            
            <div>
              <div className="text-content-tertiary">Завершено</div>
              <div className="text-lg font-bold text-success">
                {allDocuments.filter(d => d.status === 'completed').length}
              </div>
            </div>
            
            <div className="h-8 w-px bg-surface-tertiary"></div>
            
            <div>
              <div className="text-content-tertiary">Новые</div>
              <div className="text-lg font-bold text-content-secondary">
                {allDocuments.filter(d => d.status === 'draft').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
