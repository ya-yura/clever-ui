// === 📁 src/pages/DocumentsByType.tsx ===
// Documents list for a specific document type

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { odataCache } from '@/services/odataCache';
import { ODataDocument } from '@/types/odata';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

// Mapping of document type uni to display names (fallback)
const DOC_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'PrihodNaSklad': 'Приход на склад',
  'RazmeshhenieVYachejki': 'Размещение в ячейки',
  'PodborZakaza': 'Подбор заказа',
  'Otgruzka': 'Отгрузка',
  'Inventarizaciya': 'Инвентаризация',
  'Vozvrat': 'Возврат',
};

const DocumentsByType: React.FC = () => {
  const { docTypeUni } = useParams<{ docTypeUni: string }>();
  const navigate = useNavigate();
  const { setListInfo } = useDocumentHeader();
  
  const [documents, setDocuments] = useState<ODataDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docTypeName, setDocTypeName] = useState<string>('');

  useEffect(() => {
    if (docTypeUni) {
      loadDocuments();
    }
  }, [docTypeUni]);

  // Update header with list info
  useEffect(() => {
    if (docTypeName) {
      setListInfo({
        title: docTypeName,
        count: documents.length,
      });
    }
    
    return () => {
      setListInfo(null);
    };
  }, [docTypeName, documents.length, setListInfo]);

  const loadDocuments = async () => {
    if (!docTypeUni) return;

    console.log(`📄 [DOCS] Loading documents for type: ${docTypeUni}`);

    try {
      setLoading(true);
      setError(null);

      // Try to get display name from cached doc types
      let displayName = DOC_TYPE_DISPLAY_NAMES[docTypeUni] || docTypeUni;
      
      try {
        const docTypes = await odataCache.getDocTypes();
        const docType = docTypes.find(dt => dt.uni === docTypeUni);
        if (docType && docType.displayName) {
          displayName = docType.displayName;
        }
        console.log(`📄 [DOCS] Display name: ${displayName}`);
      } catch (err) {
        console.warn('⚠️ [DOCS] Could not load doc type info:', err);
      }

      setDocTypeName(displayName);

      // Fetch documents from cache/API
      console.log(`📄 [DOCS] Fetching documents for: ${docTypeUni}`);
      const docs = await odataCache.getDocsByType(docTypeUni);
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
    if (doc.finished) {
      return <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Завершён</span>;
    }
    if (doc.inProcess) {
      return <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">В работе</span>;
    }
    return <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">Новый</span>;
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <p className="text-xl text-[#a7a7a7]">Загрузка документов...</p>
        </div>
      </div>
    );
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
      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-[#474747] rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-[#a7a7a7] mb-2">Нет документов</h3>
          <p className="text-sm text-[#a7a7a7] opacity-80">
            Документы данного типа отсутствуют
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => navigate(`/docs/${docTypeUni}/${doc.id}`)}
              className="w-full bg-[#474747] hover:bg-[#525252] rounded-lg p-4 text-left transition-all border border-[#474747] hover:border-[#666]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#e3e3dd] mb-1">
                    {doc.name || doc.id}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-[#a7a7a7] mb-2">{doc.description}</p>
                  )}
                </div>
                <div className="ml-4">
                  {getStatusBadge(doc)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[#a7a7a7]">
                <div>
                  <span className="opacity-70">Создан:</span>
                  <span className="ml-2">{formatDate(doc.createDate)}</span>
                </div>
                <div>
                  <span className="opacity-70">Изменён:</span>
                  <span className="ml-2">{formatDate(doc.lastChangeDate)}</span>
                </div>
                {doc.userName && (
                  <div>
                    <span className="opacity-70">Пользователь:</span>
                    <span className="ml-2">{doc.userName}</span>
                  </div>
                )}
                {doc.warehouseId && (
                  <div>
                    <span className="opacity-70">Склад:</span>
                    <span className="ml-2">{doc.warehouseId}</span>
                  </div>
                )}
              </div>

              {doc.barcode && (
                <div className="mt-3 pt-3 border-t border-[#555]">
                  <span className="text-xs text-[#a7a7a7] opacity-70">Штрихкод:</span>
                  <span className="ml-2 text-sm text-[#e3e3dd] font-mono">{doc.barcode}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsByType;

