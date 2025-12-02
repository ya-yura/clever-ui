import React, { useState, useEffect } from 'react';
import { Button } from '@/design/components';
import { X, ExternalLink, FileText, User, Calendar, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { UniversalDocument, DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS, STATUS_LABELS } from '@/types/document';
import { documentService } from '@/services/documentService';
import { formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

interface QuickViewModalProps {
  document: UniversalDocument;
  onClose: () => void;
}

/**
 * US VII.3: Быстрый просмотр документа
 * Модальное окно с основной информацией без перехода на страницу
 */
export const QuickViewModal: React.FC<QuickViewModalProps> = ({ document, onClose }) => {
  const navigate = useNavigate();
  const [lines, setLines] = useState<any[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);

  const completionPercentage = documentService.getCompletionPercentage(document);
  const isCompleted = document.status === 'completed';
  const isInProgress = document.status === 'in_progress';

  // Загрузка строк документа
  useEffect(() => {
    loadLines();
  }, [document.id]);

  const loadLines = async () => {
    setLoadingLines(true);
    try {
      // Динамическая загрузка строк в зависимости от типа
      const { db } = await import('@/services/db');
      const tableName = `${document.type}Lines` as any;
      const table = (db as any)[tableName];
      
      if (table) {
        const docLines = await table.where('documentId').equals(document.id).toArray();
        setLines(docLines.slice(0, 5)); // Показываем только первые 5 строк
      }
    } catch (err) {
      console.error('Error loading lines:', err);
    } finally {
      setLoadingLines(false);
    }
  };

  const handleOpenFull = () => {
    const url = documentService.getDocumentUrl(document);
    navigate(url);
    onClose();
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div 
        className="bg-surface-primary rounded-2xl max-w-2xl w-full shadow-2xl animate-slide-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-separator flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{DOCUMENT_TYPE_ICONS[document.type]}</span>
            <div>
              <h2 className="text-xl font-bold">{document.number || document.id.slice(0, 8)}</h2>
              <p className="text-sm text-content-secondary">{DOCUMENT_TYPE_LABELS[document.type]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-content-tertiary">Статус:</span>
            <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
              isCompleted 
                ? 'bg-success-light text-success-dark'
                : isInProgress
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'bg-surface-tertiary text-content-secondary'
            }`}>
              {isCompleted && <CheckCircle size={16} />}
              {STATUS_LABELS[document.status]}
            </div>
          </div>

          {/* Progress */}
          {document.totalQuantity && document.totalQuantity > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-content-tertiary">Прогресс выполнения:</span>
                <span className="font-bold text-lg">{completionPercentage}%</span>
              </div>
              <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    completionPercentage === 100 ? 'bg-success' : 'bg-brand-primary'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Partner */}
          {document.partnerName && (
            <div className="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
              <User size={20} className="text-brand-primary" />
              <div className="flex-1">
                <div className="text-xs text-content-tertiary">Контрагент</div>
                <div className="font-medium">{document.partnerName}</div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-surface-secondary rounded-lg">
              <Calendar size={16} className="text-content-tertiary" />
              <div className="flex-1">
                <div className="text-xs text-content-tertiary">Создан</div>
                <div className="text-sm font-medium">{formatDate(document.createdAt)}</div>
              </div>
            </div>
            {document.updatedAt && (
              <div className="flex items-center gap-2 p-3 bg-surface-secondary rounded-lg">
                <Calendar size={16} className="text-content-tertiary" />
                <div className="flex-1">
                  <div className="text-xs text-content-tertiary">Обновлён</div>
                  <div className="text-sm font-medium">{formatDate(document.updatedAt)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {document.totalLines !== undefined && (
              <div className="flex items-center gap-2 p-3 bg-brand-primary/5 rounded-lg">
                <FileText size={16} className="text-brand-primary" />
                <div className="flex-1">
                  <div className="text-xs text-content-tertiary">Строк</div>
                  <div className="text-sm font-bold">
                    {document.completedLines || 0} / {document.totalLines}
                  </div>
                </div>
              </div>
            )}
            {document.totalQuantity !== undefined && (
              <div className="flex items-center gap-2 p-3 bg-success/5 rounded-lg">
                <Package size={16} className="text-success" />
                <div className="flex-1">
                  <div className="text-xs text-content-tertiary">Количество</div>
                  <div className="text-sm font-bold">
                    {document.completedQuantity || 0} / {document.totalQuantity}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {document.notes && (
            <div className="p-3 bg-warning-light rounded-lg border border-warning">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-warning-dark flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-warning-dark font-bold mb-1">Примечание:</div>
                  <div className="text-sm">{document.notes}</div>
                </div>
              </div>
            </div>
          )}

          {/* Lines Preview */}
          {lines.length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-content-tertiary uppercase mb-2 flex items-center gap-2">
                <FileText size={16} />
                Первые строки ({lines.length} из {document.totalLines})
              </h3>
              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={line.id || idx} className="p-3 bg-surface-secondary rounded-lg text-sm">
                    <div className="font-medium">{line.productName || 'Товар'}</div>
                    {line.barcode && (
                      <div className="text-xs text-content-tertiary font-mono">{line.barcode}</div>
                    )}
                    {(line.quantityPlan !== undefined || line.quantityFact !== undefined) && (
                      <div className="text-xs text-content-secondary mt-1">
                        {line.quantityFact || line.quantityActual || 0} / {line.quantityPlan || line.quantityExpected || 0}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {document.totalLines && document.totalLines > 5 && (
                <p className="text-xs text-content-tertiary mt-2 text-center">
                  ... и ещё {document.totalLines - 5} {document.totalLines - 5 === 1 ? 'строка' : 'строк'}
                </p>
              )}
            </div>
          )}

          {loadingLines && (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-4 border-brand-primary rounded-full border-t-transparent mx-auto"></div>
              <p className="text-sm text-content-tertiary mt-2">Загрузка строк...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-separator space-y-3">
          <Button onClick={handleOpenFull} className="w-full">
            <ExternalLink size={20} className="mr-2" />
            Открыть полностью
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};



