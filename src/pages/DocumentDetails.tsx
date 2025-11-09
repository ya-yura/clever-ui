// === 📁 src/pages/DocumentDetails.tsx ===
// Document details page with items table

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ODataDocumentItem } from '@/types/odata';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

// Short titles for document types
const SHORT_TITLES: Record<string, string> = {
  PrihodNaSklad: 'Приход',
  RazmeshhenieVYachejki: 'Размещение',
  PodborZakaza: 'Подбор',
  Otgruzka: 'Отгрузка',
  Inventarizaciya: 'Инвентаризация',
  Vozvrat: 'Возврат',
};

interface DocumentData {
  id: string;
  name: string;
  documentTypeName: string;
  description?: string;
  finished: boolean;
  inProcess: boolean;
  declaredItems?: ODataDocumentItem[];
  currentItems?: ODataDocumentItem[];
  combinedItems?: ODataDocumentItem[];
}

const DocumentDetails: React.FC = () => {
  const { docTypeUni, docId } = useParams<{ docTypeUni: string; docId: string }>();
  const navigate = useNavigate();
  const { setListInfo } = useDocumentHeader();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (docId) {
      loadDocument();
    }
  }, [docId]);

  // Update header
  useEffect(() => {
    if (document) {
      const shortTitle = SHORT_TITLES[docTypeUni || ''] || docTypeUni || 'Документ';
      const mergedCount = document.combinedItems?.length
        ?? document.declaredItems?.length
        ?? document.currentItems?.length
        ?? 0;
      setListInfo({
        title: shortTitle,
        count: mergedCount,
      });
    }

    return () => {
      setListInfo(null);
    };
  }, [document, docTypeUni, setListInfo]);

  const extractDocument = (data: any): DocumentData | null => {
    if (!data) return null;
    if (Array.isArray(data?.value)) {
      return data.value[0] || null;
    }
    return data as DocumentData;
  };

  const fetchDocument = async (withProducts: boolean) => {
    const expandBase = ['declaredItems', 'currentItems', 'combinedItems'];
    const expand = withProducts
      ? expandBase.map((path) => `${path}($expand=product)`)
      : expandBase;

    const response = await api.getDocumentById(docId!, expand);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Не удалось загрузить документ');
    }

    const doc = extractDocument(response.data);
    if (!doc) {
      throw new Error('Документ не найден');
    }

    return doc;
  };

  const loadDocument = async () => {
    if (!docId) return;

    console.log(`📄 [DOC] Loading document: ${docId}`);

    try {
      setLoading(true);
      setError(null);
      try {
        const doc = await fetchDocument(true);
        console.log(`📄 [DOC] Loaded document with products`, doc);
        setDocument(doc);
      } catch (primaryError) {
        console.warn('⚠️ [DOC] Failed to load with product expand, retrying without product details', primaryError);
        const doc = await fetchDocument(false);
        console.log(`📄 [DOC] Loaded document without product expand`, doc);
        setDocument(doc);
      }
    } catch (error: any) {
      console.error('❌ [DOC] Error loading document:', error);
      setError('Ошибка загрузки документа. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!document) return null;
    if (document.finished) {
      return <span className="px-2 py-1 bg-green-600/80 text-white text-[10px] rounded-full uppercase tracking-wide">Завершён</span>;
    }
    if (document.inProcess) {
      return <span className="px-2 py-1 bg-blue-500/80 text-white text-[10px] rounded-full uppercase tracking-wide">В работе</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/80 text-white text-[10px] rounded-full uppercase tracking-wide">Новый</span>;
  };

  // Merge declared and current items for display
  const getMergedItems = (): ODataDocumentItem[] => {
    if (!document) return [];
    
    // Prefer combinedItems if available
    if (document.combinedItems && document.combinedItems.length > 0) {
      return document.combinedItems;
    }

    // Otherwise merge declaredItems and currentItems
    const declared = document.declaredItems || [];
    const current = document.currentItems || [];

    // Create a map of all items by productId
    const itemsMap = new Map<string, ODataDocumentItem>();

    // Add declared items
    declared.forEach((item) => {
      const key = item.productId || item.uid;
      itemsMap.set(key, { ...item });
    });

    // Merge current items
    current.forEach((item) => {
      const key = item.productId || item.uid;
      const existing = itemsMap.get(key);
      if (existing) {
        // Update current quantity
        existing.currentQuantity = item.currentQuantity;
        existing.currentQuantityWithBinding = item.currentQuantityWithBinding;
      } else {
        itemsMap.set(key, { ...item });
      }
    });

    return Array.from(itemsMap.values()).sort((a, b) => a.index - b.index);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <p className="text-xl text-[#a7a7a7]">Загрузка документа...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Ошибка загрузки</h2>
          <p className="text-[#a7a7a7] mb-6">{error || 'Документ не найден'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadDocument}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Повторить
            </button>
            <button
              onClick={() => navigate(`/docs/${docTypeUni}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Назад к списку
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = getMergedItems();

  const formatQuantity = (value: number | undefined | null) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return '0';
    }
    return Number(value).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div className="space-y-3">
      {/* Document header (compact) */}
      <div className="bg-[#3a3a3a] border border-[#575757] rounded-md px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#e3e3dd] truncate">{document.name || document.id}</p>
          {document.description && (
            <p className="text-xs text-[#a7a7a7] truncate">{document.description}</p>
          )}
        </div>
        <div className="shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* Items table */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-[#474747] rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-[#a7a7a7] mb-2">Нет строк</h3>
          <p className="text-sm text-[#a7a7a7] opacity-80">
            В документе пока нет товаров
          </p>
        </div>
      ) : (
        <div className="bg-[#3c3c3c] rounded-lg border border-[#4f4f4f] overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#333] border-b border-[#4f4f4f] text-[#cfcfcf] uppercase tracking-wide text-[10px]">
              <tr>
                <th className="px-3 py-2 font-semibold">Товар</th>
                <th className="px-3 py-2 font-semibold">Артикул</th>
                <th className="px-3 py-2 font-semibold">Место</th>
                <th className="px-3 py-2 font-semibold text-right">План</th>
                <th className="px-3 py-2 font-semibold text-right">Факт</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const productName = item.product?.name || item.productName || item.productMarking || item.productId || '—';
                const article = item.product?.marking || item.product?.barcode || item.productBarcode || item.productMarking || '—';
                const location = item.firstCellId || item.secondCellId || item.firstStorageBarcode || item.secondStorageBarcode || item.firstStorageId || item.secondStorageId || '—';

                const plannedRaw = typeof item.declaredQuantity === 'number' ? item.declaredQuantity : Number(item.quantityPlan ?? item.plan ?? 0);
                const actualRawCandidate = item.currentQuantity ?? item.currentQuantityWithBinding ?? item.quantityFact ?? item.factQuantity ?? 0;
                const actualRaw = typeof actualRawCandidate === 'number' ? actualRawCandidate : Number(actualRawCandidate || 0);

                const isDone = actualRaw >= plannedRaw && plannedRaw > 0;
                const isOverdone = actualRaw > plannedRaw && plannedRaw > 0;
                
                return (
                  <tr
                    key={item.uid || index}
                    className="border-b border-[#4f4f4f] hover:bg-[#484848] transition-colors"
                  >
                    {/* Product name */}
                    <td className="px-3 py-2 md:py-3 text-[#f0f0f0]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium leading-snug">{productName}</span>
                        {item.product?.packings?.[0]?.name && (
                          <span className="text-[10px] text-[#a7a7a7] uppercase tracking-wide">{item.product?.packings?.[0]?.name}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Product barcode (артикул) */}
                    <td className="px-3 py-2 md:py-3 text-[#b9b9b9] font-mono text-[11px]">
                      {article || '—'}
                    </td>
                    
                    {/* Storage location (ячейка) */}
                    <td className="px-3 py-2 md:py-3 text-[#b9b9b9]">
                      {location || '—'}
                    </td>
                    
                    {/* Declared quantity (план) */}
                    <td className="px-3 py-2 md:py-3 text-[#e3e3dd] text-right font-semibold">
                      {formatQuantity(plannedRaw)}
                    </td>
                    
                    {/* Current quantity (факт) */}
                    <td className="px-3 py-2 md:py-3 text-right font-semibold">
                      <span
                        className={
                          isOverdone
                            ? 'text-yellow-500'
                            : isDone
                            ? 'text-green-500'
                            : 'text-[#e3e3dd]'
                        }
                      >
                        {formatQuantity(actualRaw)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary stats */}
      {items.length > 0 && (
        <div className="bg-[#3c3c3c] rounded-lg p-3 border border-[#4f4f4f]">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-xl font-bold text-[#e3e3dd]">{items.length}</div>
              <div className="text-xs text-[#a7a7a7]">Строк</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#e3e3dd]">
                {formatQuantity(items.reduce((sum, item) => {
                  const planned = typeof item.declaredQuantity === 'number' ? item.declaredQuantity : Number(item.quantityPlan ?? item.plan ?? 0);
                  return sum + (Number.isFinite(planned) ? planned : 0);
                }, 0))}
              </div>
              <div className="text-xs text-[#a7a7a7]">План</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-500">
                {formatQuantity(items.reduce((sum, item) => {
                  const actual = item.currentQuantity ?? item.currentQuantityWithBinding ?? item.quantityFact ?? item.factQuantity ?? 0;
                  const val = typeof actual === 'number' ? actual : Number(actual || 0);
                  return sum + (Number.isFinite(val) ? val : 0);
                }, 0))}
              </div>
              <div className="text-xs text-[#a7a7a7]">Факт</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;

