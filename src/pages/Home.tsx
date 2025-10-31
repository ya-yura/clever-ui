// === 📁 src/pages/Home.tsx ===
// Home page with module selection

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { odataCache } from '@/services/odataCache';
import { ODataDocumentType } from '@/types/odata';
import { MOCK_DOC_TYPES } from '@/data/mockDocTypes';

interface DocTypeCard {
  uni: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  docsCount: number;
}

// Icon mapping based on document type name
const getIconForDocType = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('прих') || lowerName.includes('receiving')) return '📦';
  if (lowerName.includes('инвентар') || lowerName.includes('inventory')) return '📊';
  if (lowerName.includes('подбор') || lowerName.includes('pick')) return '🚚';
  if (lowerName.includes('размещ') || lowerName.includes('placement')) return '📝';
  if (lowerName.includes('отгруз') || lowerName.includes('shipment')) return '📄';
  if (lowerName.includes('возврат') || lowerName.includes('return')) return '📷';
  if (lowerName.includes('перемещ') || lowerName.includes('move')) return '🔄';
  if (lowerName.includes('маркир') || lowerName.includes('label')) return '🏷️';
  return '📋';
};

// Color mapping based on index
const getColorForIndex = (index: number): string => {
  const colors = [
    'bg-[#daa420]', // yellow
    'bg-[#fea079]', // orange
    'bg-[#f3a361]', // light orange
    'bg-[#86e0cb]', // mint
    'bg-[#91ed91]', // green
    'bg-[#ba8f8e]', // rose
    'bg-[#f0e78d]', // pale yellow
    'bg-[burlywood]', // burlywood
  ];
  return colors[index % colors.length];
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [docTypes, setDocTypes] = useState<DocTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadDocTypes();
  }, []);

  // Debug: log docTypes whenever it changes
  useEffect(() => {
    console.log('🔄 [RENDER] docTypes changed:', docTypes);
    console.log('🔄 [RENDER] docTypes.length:', docTypes.length);
    console.log('🔄 [RENDER] usingMockData:', usingMockData);
  }, [docTypes, usingMockData]);

  const loadDocTypes = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);

    try {
      // Try to fetch doc types from cache/API
      let types: ODataDocumentType[] = [];
      let isMockData = false;
      
      try {
        types = await odataCache.getDocTypes();
        console.log('✅ [API] Loaded', types.length, 'doc types');
        console.log('📋 [API] DocTypes:', types);
      } catch (apiError: any) {
        console.warn('⚠️ [API] DocTypes failed:', apiError.message);
        types = [];
      }

      // If no types available, use mock data
      if (!types || types.length === 0) {
        console.warn('⚠️ [FALLBACK] No types from /DocTypes, using mock data');
        types = MOCK_DOC_TYPES;
        isMockData = true;
      }

      // Load document counts for each type
      const typesWithCounts = await Promise.all(
        types.map(async (type, index) => {
          let docsCount = 0;
          
          if (!isMockData) {
            try {
              const docs = await odataCache.getDocsByType(type.uni);
              docsCount = docs.length;
              console.log(`✅ [API] Type "${type.uni}": ${docsCount} documents`);
            } catch (err: any) {
              console.error(`❌ [API] Failed to load docs for "${type.uni}":`, err.message);
              docsCount = 0;
            }
          }

          // Fix color format: if buttonColor is hex, wrap it in bg-[...]
          let color = type.buttonColor || getColorForIndex(index);
          if (color && !color.startsWith('bg-')) {
            color = `bg-[${color}]`;
          }

          return {
            uni: type.uni,
            displayName: type.displayName || type.name,
            description: `Работа с документами типа "${type.displayName || type.name}"`,
            color: color,
            icon: getIconForDocType(type.name),
            docsCount,
          };
        })
      );

      setUsingMockData(isMockData);

      console.log('📊 [STATE] Setting docTypes:', typesWithCounts);
      console.log('📊 [STATE] docTypes.length:', typesWithCounts.length);
      
      setDocTypes(typesWithCounts);
      setTotalDocs(typesWithCounts.reduce((sum, type) => sum + type.docsCount, 0));
      setError(null);  // Clear error if we successfully got data
      
      console.log('✅ [FINAL] Loaded', typesWithCounts.length, 'types with', 
                  typesWithCounts.reduce((sum, t) => sum + t.docsCount, 0), 'total documents');
      console.log('📊 [FINAL] docTypes state should now have', typesWithCounts.length, 'items');
      
    } catch (error: any) {
      console.error('❌ [CRITICAL] Error loading doc types:', error);
      // Even if everything fails, use mock data
      console.warn('⚠️ [FALLBACK] Using mock data due to critical error');
      const mockTypes = MOCK_DOC_TYPES.map((type, index) => {
        // Fix color format: if buttonColor is hex, wrap it in bg-[...]
        let color = type.buttonColor || getColorForIndex(index);
        if (color && !color.startsWith('bg-')) {
          color = `bg-[${color}]`;
        }

        return {
          uni: type.uni,
          displayName: type.displayName || type.name,
          description: `Работа с документами типа "${type.displayName || type.name}"`,
          color: color,
          icon: getIconForDocType(type.name),
          docsCount: 0,
        };
      });
      
      console.log('📊 [FALLBACK] Setting mock types:', mockTypes);
      console.log('📊 [FALLBACK] mockTypes.length:', mockTypes.length);
      
      setDocTypes(mockTypes);
      setTotalDocs(0);
      setUsingMockData(true);
      setError(null); // Don't show error, just use mock data
    } finally {
      setLoading(false);
    }
  };

  console.log('🎯 [RENDER] Home render - loading:', loading, 'error:', error, 'docTypes.length:', docTypes.length);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <p className="text-xl text-[#a7a7a7]">Загрузка типов документов...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-2xl px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Ошибка загрузки</h2>
          <pre className="text-[#a7a7a7] mb-6 text-left bg-[#2a2a2c] p-4 rounded-lg whitespace-pre-wrap text-sm">{error}</pre>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={loadDocTypes}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Повторить попытку
            </button>
            <button
              onClick={() => window.open('http://localhost:9000/MobileSMARTS/api/v1/DocTypes', '_blank')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Проверить API в браузере
            </button>
            <button
              onClick={() => navigate('/diagnostics')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Диагностика
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Warning banner if using mock data */}
      {usingMockData && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1">
                Демо-режим
              </h3>
              <p className="text-sm text-yellow-200/90 mb-2">
                API сервер недоступен. Показаны демонстрационные типы документов.
              </p>
              <p className="text-xs text-yellow-200/70">
                Для работы с реальными данными запустите API сервер: <br />
                <code className="bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                  http://localhost:9000/MobileSMARTS/api/v1/
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Карточка всех документов */}
      <button
        onClick={() => navigate('/documents')}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-left hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Все документы
            </h2>
            <p className="text-sm text-blue-100 opacity-90">
              Просмотр, поиск и фильтрация всех документов склада
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white">
              {totalDocs}
            </div>
            <div className="text-xs text-blue-100 opacity-80 mt-1">
              документов
            </div>
          </div>
        </div>
      </button>

      {/* Карточка напарника */}
      <button
        onClick={() => navigate('/partner')}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-left hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              Работа с напарником
            </h2>
            <p className="text-sm text-green-100 opacity-90">
              Выберите напарника для совместной работы
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">
              ✓
            </div>
          </div>
        </div>
      </button>

      {/* Dynamic Document Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {console.log('🎨 [RENDER] Rendering docTypes grid, count:', docTypes.length)}
        {docTypes.map((docType, index) => {
          console.log(`🎨 [MAP] Rendering docType [${index}]:`, docType);
          return (
          <button
            key={docType.uni}
            onClick={() => navigate(`/docs/${docType.uni}`)}
            className={`${docType.color} rounded-lg p-6 text-left hover:opacity-90 transition-all relative overflow-hidden flex flex-col justify-between min-h-[180px]`}
          >
            <div>
              <h2 className="text-2xl font-bold text-[#343436] mb-2 flex items-center gap-2">
                <span className="text-3xl">{docType.icon}</span>
                {docType.displayName}
              </h2>
              <p className="text-xs text-[#343436] opacity-80 leading-relaxed">
                {docType.description}
              </p>
            </div>
            <div className="flex justify-between items-end mt-4">
              <p className="text-xs text-[#343436] opacity-70">Документов:</p>
              <p className="text-4xl font-normal text-white tracking-tight">
                {docType.docsCount}
              </p>
            </div>
          </button>
          );
        })}
      </div>

      {/* Empty state */}
      {docTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-[#a7a7a7] mb-2">Нет доступных типов документов</h3>
          <p className="text-sm text-[#a7a7a7] opacity-80">
            Проверьте настройки подключения к серверу
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;

