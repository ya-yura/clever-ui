// === 📁 src/pages/DocumentsByType.tsx ===
// Documents list for a specific document type

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { odataCache } from '@/services/odataCache';
import { ODataDocument, ODataDocumentType } from '@/types/odata';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';
import { DocumentsByTypeSkeleton } from '@/components/documents/DocumentsByTypeSkeleton';
import { Badge } from '@/design/components';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'number' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  // Calculate filtered documents by status, search, and sort
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // 1. Filter by Status
    if (statusFilter !== 'all') {
      if (statusFilter === 'finished') filtered = filtered.filter((d: any) => d.finished === true);
      else if (statusFilter === 'in_process') filtered = filtered.filter((d: any) => d.inProcess === true);
      else filtered = filtered.filter((d: any) => !d.finished && !d.inProcess); // 'new'
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.id && d.id.toLowerCase().includes(q)) ||
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.barcode && d.barcode.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.warehouseId && d.warehouseId.toLowerCase().includes(q)) ||
        (d.userName && d.userName.toLowerCase().includes(q))
      );
    }

    // 3. Sort
    return filtered.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortField) {
        case 'date':
          valA = new Date(a.createDate || 0).getTime();
          valB = new Date(b.createDate || 0).getTime();
          break;
        case 'number':
          valA = a.id || '';
          valB = b.id || '';
          break;
        case 'status':
          valA = a.finished ? 2 : a.inProcess ? 1 : 0;
          valB = b.finished ? 2 : b.inProcess ? 1 : 0;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [documents, statusFilter, searchQuery, sortField, sortDirection]);

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
    // Compact badges: reduced height, smaller font, tighter padding
    const base = 'inline-flex items-center h-[18px] px-1.5 rounded text-[9px] font-bold uppercase tracking-wider border';
    if (doc.finished) {
      return <span className={`${base} bg-success-dark text-success-light border-transparent dark:bg-success-dark dark:text-success-light bg-success-light text-success-dark border-success-light`}>Завершён</span>;
    }
    if (doc.inProcess) {
      return <span className={`${base} bg-info-dark text-info-light border-transparent dark:bg-info-dark dark:text-info-light bg-info-light text-info-dark border-info-light`}>В работе</span>;
    }
    return <span className={`${base} bg-surface-tertiary text-content-secondary border-borders-default`}>Новый</span>;
  };

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(',', ''); // "DD.MM HH:MM"
    } catch {
      return '';
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
          <h2 className="text-2xl font-bold text-error mb-2">Ошибка загрузки</h2>
          <p className="text-content-secondary mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadDocuments}
              className="bg-brand-primary hover:bg-brand-primary text-white px-6 py-3 rounded-lg transition-colors"
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
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mt-1 items-center no-scrollbar">
          {allDocTypes.map((t) => {
            const short = SHORT_TITLES[t.uni] || toShortTitle(String(t.displayName || t.name || t.uni));
            const isActive = t.uni === docTypeUni;
            // Style matching status badges (Elements 2)
            // Added min-h-0 and min-w-0 to override global touch target styles
            // Added shrink-0 to prevent squashing in horizontal scroll container
            const baseStyle = "inline-flex items-center justify-center h-[18px] min-h-0 min-w-0 shrink-0 px-1.5 rounded text-[9px] leading-none font-bold uppercase tracking-wider border whitespace-nowrap transition-colors";
            
            // Theme-aware styles
            // Active: Dark Green (Custom for now, looks good in both modes or needs check)
            // Inactive: Surface Secondary (White/DarkGray) + Content Secondary text
            const activeStyle = "bg-[#1f3324] text-[#74ff9c] border-transparent dark:bg-[#1f3324] dark:text-[#74ff9c] bg-green-100 text-green-800 border-green-200"; 
            // Fix: Use hardcoded green for active to match user preference or use variables. 
            // User liked the specific look. Let's stick to variables for Structure but colors for Status need care.
            // Actually, the user complained about Light Theme being broken.
            // Let's use semantic status colors if possible, or stick to the user's colors but ensure they work on white.
            // Green text on Dark Green bg works on Dark.
            // Green text on Light Green bg works on Light.
            
            const activeStyleFixed = "bg-[#1f3324] text-[#74ff9c] border-transparent data-[theme=light]:bg-green-100 data-[theme=light]:text-green-800 data-[theme=light]:border-green-200";
            
            // Wait, Tailwind dark mode is class based or media based? Config says nothing, usually 'media'.
            // But index.css uses [data-theme='light'].
            // So I should use `bg-surface-secondary` etc.
            
            // UPDATED: Using theme-specific colors for tags to avoid eye strain in light mode
            const activeStyleFinal = "theme-chip-active-success shadow-sm";
            
            // Let's use the logic:
            // Inactive: bg-surface-secondary text-content-secondary border-borders-default hover:bg-surface-tertiary
            
            const inactiveStyle = "bg-surface-secondary text-content-secondary border-borders-default hover:bg-surface-tertiary";
            
            // For active, I'll keep the specific green request but maybe lighter in light mode?
            // Or just keep it high contrast. #1f3324 is very dark green.
            // Let's assume active chips should look like status badges.
            
            return (
              <button
                key={t.uni}
                onClick={() => navigate(`/docs/${t.uni}`)}
                className={`${baseStyle} ${isActive ? activeStyleFinal : inactiveStyle}`}
              >
                {short}
              </button>
            );
          })}
        </div>
      )}

      {/* Status filter badges */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all', label: 'Все' },
          { key: 'new', label: 'Новые' },
          { key: 'in_process', label: 'В работе' },
          { key: 'finished', label: 'Завершён' },
        ].map((s) => {
          const isActive = statusFilter === s.key;
           // Style matching status badges (Elements 2)
           // Added min-h-0 and min-w-0 to override global touch target styles
           const baseStyle = "inline-flex items-center justify-center h-[18px] min-h-0 min-w-0 px-1.5 rounded text-[9px] leading-none font-bold uppercase tracking-wider border transition-colors";
           
           // UPDATED: Theme-aware colors for active state (Dark: Blue-ish, Light: Light Blue)
           const activeStyle = "theme-chip-active-info";
           const inactiveStyle = "bg-surface-secondary text-content-secondary border-borders-default hover:bg-surface-tertiary";

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatusFilter(s.key as any)}
              className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Search and Sort */}
      <div className="flex gap-2 h-10 items-stretch">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full bg-surface-secondary text-content-primary border border-borders-default rounded-md px-3 text-sm focus:outline-none focus:border-brand-primary appearance-none m-0 placeholder:text-content-tertiary"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Compact Sort Group */}
        <div className="flex shrink-0 h-full border border-borders-default bg-surface-secondary rounded-md overflow-hidden">
          <div className="relative h-full">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="h-full appearance-none bg-transparent text-content-primary border-none pl-3 pr-6 text-sm focus:ring-0 focus:outline-none m-0"
            >
              <option value="date">Дата</option>
              <option value="number">Номер</option>
              <option value="status">Статус</option>
            </select>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-content-tertiary">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
          
          {/* Vertical Divider */}
          <div className="w-[1px] bg-border-default h-full" />
          
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="h-full w-9 flex items-center justify-center bg-transparent text-content-primary hover:bg-surface-tertiary transition-colors m-0 p-0 focus:outline-none"
          >
            <span className="text-base leading-none mb-0.5 font-normal opacity-80">{sortDirection === 'asc' ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      {/* Documents list */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-surface-secondary rounded-lg border border-borders-default">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-content-secondary mb-2">Нет документов</h3>
          <p className="text-sm text-content-tertiary opacity-80">
            Документы данного типа отсутствуют
          </p>
        </div>
      ) : (
        <div className="space-y-2">
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
                className="w-full bg-surface-secondary hover:bg-surface-tertiary rounded border-b border-borders-light last:border-0 px-3 py-2 text-left transition-colors"
              >
                <div className="flex gap-3">
                {/* Left Content Area: Title and Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  {/* Title Row */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-content-primary truncate leading-tight">
                      {doc.name || doc.id}
                    </span>
                  </div>
                  
                  {/* Secondary Info Row (Description & Barcode) */}
                  {(secondaryLine || doc.barcode) && (
                    <div className="text-xs text-content-secondary truncate leading-tight flex items-center">
                      {secondaryLine && <span className="truncate">{secondaryLine}</span>}
                      {secondaryLine && doc.barcode && <span className="mx-1.5 opacity-40 text-[10px] text-content-tertiary">|</span>}
                      {doc.barcode && <span className="font-mono text-[10px] text-content-tertiary opacity-90 shrink-0">{doc.barcode}</span>}
                    </div>
                  )}

                  {/* Tertiary Meta Row (Owner & Warehouse) */}
                  <div className="flex items-center gap-2 text-[10px] mt-1 leading-tight">
                    {owner && <span className="text-brand-primary font-medium">{owner}</span>}
                    {owner && doc.warehouseId && <span className="text-content-tertiary">•</span>}
                    {doc.warehouseId && <span className="text-content-tertiary">📦 {doc.warehouseId}</span>}
                  </div>
                </div>

                {/* Right Meta Area: Status and Date */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                  {getStatusBadge(doc)}
                  <span className="text-[10px] text-content-tertiary font-mono whitespace-nowrap">
                    {formatDateShort(doc.createDate)}
                  </span>
                </div>
              </div>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsByType;

