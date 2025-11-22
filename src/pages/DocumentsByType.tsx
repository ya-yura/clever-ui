// === 📁 src/pages/DocumentsByType.tsx ===
// Documents list for a specific document type

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { odataCache } from '@/services/odataCache';
import { ODataDocument, ODataDocumentType } from '@/types/odata';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { DocumentsByTypeSkeleton } from '@/components/documents/DocumentsByTypeSkeleton';

// Short, human-friendly titles per document type
const SHORT_TITLES: Record<string, string> = {
  PrihodNaSklad: 'Приход',
  RazmeshhenieVYachejki: 'Размещение',
  PodborZakaza: 'Подбор',
  Otgruzka: 'Отгрузка',
  Inventarizaciya: 'Инвентаризация',
  Vozvrat: 'Возврат',
};

const toShortTitle = (raw: string): string => {
  if (!raw) return '';
  const spaced = raw
    .replace(/([A-Z])([a-z]+)/g, ' $1$2')
    .replace(/([А-ЯЁ])([а-яё]+)/g, ' $1$2')
    .trim();
  const first = spaced.split(/\s+/)[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : raw;
};

const DocumentsByType: React.FC = () => {
  const { docTypeUni } = useParams<{ docTypeUni: string }>();
  const navigate = useNavigate();
  const { setListInfo } = useDocumentHeader();
  
  const [documents, setDocuments] = useState<ODataDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docTypeName, setDocTypeName] = useState<string>('');
  const [allDocTypes, setAllDocTypes] = useState<ODataDocumentType[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_process' | 'finished'>('all');

  useEffect(() => {
    if (docTypeUni) {
      loadDocuments();
    }
  }, [docTypeUni]);

  // Load all doc types for quick switching chips
  useEffect(() => {
    (async () => {
      try {
        const types = await odataCache.getDocTypes();
        setAllDocTypes(types);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Calculate filtered documents by status
  const filteredDocuments = useMemo(() => {
    if (statusFilter === 'all') return documents;
    if (statusFilter === 'finished') return documents.filter((d: any) => d.finished === true);
    if (statusFilter === 'in_process') return documents.filter((d: any) => d.inProcess === true);
    // 'new'
    return documents.filter((d: any) => !d.finished && !d.inProcess);
  }, [documents, statusFilter]);

  // Update header with list info (short title)
  useEffect(() => {
    if (docTypeName) {
      setListInfo({
        title: docTypeName,
        count: filteredDocuments.length,
      });
    }
    
    return () => {
      setListInfo(null);
    };
  }, [docTypeName, filteredDocuments.length, setListInfo]);

  const loadDocuments = async () => {
    if (!docTypeUni) return;

    console.log(`📄 [DOCS] Loading documents for type: ${docTypeUni}`);

    try {
      setLoading(true);
      setError(null);

      // Try to resolve short title
      let displayName = SHORT_TITLES[docTypeUni] || toShortTitle(docTypeUni);
      
      try {
        const docTypes = await odataCache.getDocTypes();
        const docType = docTypes.find(dt => dt.uni === docTypeUni);
        if (docType) {
          const source = docType.displayName || docType.name || docType.uni;
          displayName = SHORT_TITLES[docType.uni] || toShortTitle(String(source));
        }
        console.log(`📄 [DOCS] Display name: ${displayName}`);
      } catch (err) {
        console.warn('⚠️ [DOCS] Could not load doc type info:', err);
      }

      setDocTypeName(displayName);

      // Fetch documents from cache/API and filter client-side using multiple names
      console.log(`📄 [DOCS] Fetching documents for: ${docTypeUni}`);
      let names: string[] | undefined;
      try {
        const types = await odataCache.getDocTypes();
        const t = types.find(dt => dt.uni === docTypeUni);
        if (t) names = [t.uni as any, (t as any).name, (t as any).displayName].filter(Boolean) as string[];
      } catch {}
      const docs = await odataCache.getDocsByType(docTypeUni, { names });
      console.log(`📄 [DOCS] Loaded ${docs.length} documents:`, docs);
      setDocuments(docs);
      
    } catch (error: any) {
      console.error('❌ [DOCS] Error loading documents:', error);
      setError('Ошибка загрузки документов. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (doc: ODataDocument) => {
    const base = 'inline-flex items-center h-[22px] px-2 rounded-full text-[10px] font-semibold uppercase tracking-wide border';
    if (doc.finished) {
      return <span className={`${base} bg-[#1f3324] text-[#74ff9c] border-transparent`}>Завершён</span>;
    }
    if (doc.inProcess) {
      return <span className={`${base} bg-[#1d2f3c] text-[#7ad4ff] border-transparent`}>В работе</span>;
    }
    return <span className={`${base} bg-[#353535] text-[#d7d7d7] border-[#4e4e4e]`}>Новый</span>;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return <DocumentsByTypeSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Ошибка загрузки</h2>
          <p className="text-[#a7a7a7] mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadDocuments}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Повторить
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick type chips */}
      {allDocTypes.length > 0 && (
        <div className="flex gap-[8px] overflow-x-auto pb-[4px] -mt-1 items-center">
          {allDocTypes.map((t) => {
            const short = SHORT_TITLES[t.uni] || toShortTitle(String(t.displayName || t.name || t.uni));
            const isActive = t.uni === docTypeUni;
            return (
              <button
                key={t.uni}
                onClick={() => navigate(`/docs/${t.uni}`)}
                className={`chip ${isActive ? 'chip-active' : ''}`}
              >
                {short}
              </button>
            );
          })}
        </div>
      )}

      {/* Status filter buttons */}
      <div className="grid grid-cols-4 gap-1 px-0.5">
        {[
          { key: 'all', label: 'Все' },
          { key: 'new', label: 'Новые' },
          { key: 'in_process', label: 'В работе' },
          { key: 'finished', label: 'Завершён' },
        ].map((s) => {
          const isActive = statusFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key as any)}
              className={`w-full px-2 py-2 rounded-md text-left text-[11px] transition-all ${
                isActive ? 'ring-2 ring-offset-2 ring-brand-primary bg-[#2f2f2f]' : 'bg-[#3d3d3d]'
              }`}
            >
              <div className="text-[9px] uppercase tracking-wide opacity-70">{s.label}</div>
            </button>
          );
        })}
      </div>
      {/* Documents list */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-[#474747] rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-[#a7a7a7] mb-2">Нет документов</h3>
          <p className="text-sm text-[#a7a7a7] opacity-80">
            Документы данного типа отсутствуют
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const appointment = (doc.appointment || '').trim();
            const owner = (doc.userName || '').trim();
            const secondaryLine = appointment || doc.description || '';

            return (
            <button
              key={doc.id}
              onClick={() => {
                console.log(`📄 [DOCS] Navigating to document details: /docs/${docTypeUni}/${doc.id}`);
                navigate(`/docs/${docTypeUni}/${doc.id}`);
              }}
              className="w-full bg-[#3c3c3c] hover:bg-[#444] rounded-md px-3 py-2.5 text-left transition-all border border-[#4c4c4c] hover:border-[#666]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#f0f0f0] leading-tight line-clamp-2">
                    {doc.name || doc.id}
                  </h3>
                  <div className="mt-1 flex flex-col gap-0.5 text-[11px] leading-tight">
                    {secondaryLine && (
                      <span className="text-[#8fe4a3] line-clamp-1">
                        {secondaryLine}
                      </span>
                    )}
                    {owner && (
                      <span className="text-[#a5c7ff] line-clamp-1">{owner}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">{getStatusBadge(doc)}</div>
              </div>
 
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] leading-tight text-[#b8b8b8]">
                <span className="flex items-center gap-1">
                  <span className="uppercase tracking-wide text-[10px] text-[#8f8f8f]">Создан</span>
                  <span className="text-[#e3e3e3]">{formatDate(doc.createDate)}</span>
                </span>
                {doc.warehouseId && (
                  <span className="flex items-center gap-1">
                    <span className="uppercase tracking-wide text-[10px] text-[#8f8f8f]">Склад</span>
                    <span className="text-[#d3d3d3]">{doc.warehouseId}</span>
                  </span>
                )}
              </div>
 
              {doc.barcode && (
                <div className="mt-2 pt-2 border-t border-[#4c4c4c] text-[11px] text-[#d8d8d8] font-mono truncate">
                  {doc.barcode}
                </div>
              )}
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsByType;

