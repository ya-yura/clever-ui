import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UISchema, ButtonConfig } from '../types/ui-schema';
import { ACTION_ROUTES, type ButtonAction } from '../types/ui-schema';
import { ActionRegistry } from '../services/actionRegistry';
import { SchemaLoader } from '../services/schemaLoader';
import { documentCounter } from '../services/documentCounter';
import { QRScanner } from './QRScanner';
import analytics from '../analytics';

interface DynamicGridInterfaceProps {
  schemaName?: string;
}

export const DynamicGridInterface: React.FC<DynamicGridInterfaceProps> = ({ schemaName = 'default' }) => {
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [documentCounts, setDocumentCounts] = useState<Map<ButtonAction, number>>(new Map());
  const navigate = useNavigate();
  const actionRegistry = new ActionRegistry(navigate);

  useEffect(() => {
    loadSchema();
  }, [schemaName]);

  // Загрузка количества документов
  useEffect(() => {
    if (!schema || schema.buttons.length === 0) {
      return;
    }

    const actions = schema.buttons
      .map(btn => btn.action as ButtonAction)
      .filter(action => action !== 'none');

    // Загружаем количества
    const loadCounts = async () => {
      const counts = await documentCounter.getAllCounts(actions);
      setDocumentCounts(counts);
    };

    loadCounts();

    // Запускаем автообновление каждую минуту
    documentCounter.startAutoUpdate(actions, 60000);

    return () => {
      documentCounter.stopAutoUpdate();
    };
  }, [schema]);

  const loadSchema = () => {
    setLoading(true);
    
    // Попытка загрузить схему из LocalStorage
    const loadedSchema = SchemaLoader.loadFromLocalStorage(schemaName);
    
    if (loadedSchema) {
      console.log(`✅ Loaded schema "${schemaName}" from localStorage:`, loadedSchema);
      setSchema(loadedSchema);
      
      // Track custom interface loaded
      analytics.trackCustomInterfaceLoaded({
        id: loadedSchema.metadata?.name || schemaName,
        version: '1.0.0',
        buttonsCount: loadedSchema.buttons?.length || 0,
        source: 'localStorage',
      });
    } else {
      console.log('ℹ️ No schema found, using default');
      setSchema(SchemaLoader.getDefaultSchema());
    }
    
    setLoading(false);
  };

  const handleScanComplete = (data: string) => {
    console.log('📱 Scanned data length:', data.length);
    
    try {
      const loadedSchema = SchemaLoader.loadFromCompressed(data);
      
      if (loadedSchema) {
        console.log('✅ Schema loaded from QR code:', loadedSchema);
        setSchema(loadedSchema);
        SchemaLoader.saveToLocalStorage(loadedSchema, 'default');
        setShowScanner(false);
        
        // Track successful QR scan
        analytics.trackCustomInterfaceQRScan(true);
        
        // Track custom interface loaded
        analytics.trackCustomInterfaceLoaded({
          id: loadedSchema.metadata?.name || 'unknown',
          version: '1.0.0',
          buttonsCount: loadedSchema.buttons?.length || 0,
          source: 'qr',
        });
        
        alert('✅ Интерфейс успешно загружен!');
      } else {
        console.error('❌ Invalid schema from QR code');
        
        // Track failed QR scan
        analytics.trackCustomInterfaceQRScan(false, 'Invalid schema');
        
        alert('❌ Неверный QR-код. Попробуйте ещё раз.');
      }
    } catch (error: any) {
      console.error('Failed to load schema from QR:', error);
      
      // Track failed QR scan
      analytics.trackCustomInterfaceQRScan(false, error.message);
      
      alert('❌ Ошибка загрузки схемы: ' + error.message);
    }
  };

  const handleButtonClick = (button: ButtonConfig, position?: { row: number; col: number }) => {
    console.log('🖱️ Button clicked:', button.label, button.action);
    
    // Track custom button click
    analytics.trackCustomButtonClick({
      label: button.label,
      action: button.action,
      params: button.params,
      position,
      color: button.color,
    });
    
    // Приоритет: button.route > ACTION_ROUTES > actionRegistry (legacy)
    if (button.route) {
      console.log('📍 Navigating to direct route:', button.route);
      navigate(button.route);
    } else if (button.action !== 'none' && button.action in ACTION_ROUTES) {
      const route = ACTION_ROUTES[button.action as keyof typeof ACTION_ROUTES];
      if (route) {
        console.log('📍 Navigating via ACTION_ROUTES:', route);
        navigate(route);
      }
    } else {
      // Fallback to legacy action registry
      actionRegistry.execute(button.action, button.params);
    }
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <p style={{ fontSize: '18px', color: '#a7a7a7' }}>
            Загрузка интерфейса...
          </p>
        </div>
      </div>
    );
  }

  if (!schema || schema.buttons.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>📱</div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#FFFFFF',
          marginBottom: '12px',
        }}>
          Интерфейс не настроен
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '32px',
          maxWidth: '400px',
        }}>
          Отсканируйте QR-код с настроенным интерфейсом из приложения Constructor
        </p>
        <button
          onClick={handleOpenScanner}
          style={{
            padding: '16px 32px',
            background: '#F3A36A',
            color: '#8B5931',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📷</span>
          <span>Сканировать QR-код</span>
        </button>
      </div>
    );
  }

  const { columns, rows } = schema.grid;

  return (
    <>
      <div style={{
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header with schema info and scan button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px 16px',
          background: '#4A4F54',
          borderRadius: '12px',
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: 700,
              color: '#FFFFFF',
            }}>
              {schema.metadata.name}
            </h2>
            {schema.metadata.description && (
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.7)',
              }}>
                {schema.metadata.description}
              </p>
            )}
          </div>
          <button
            onClick={handleOpenScanner}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Загрузить новый интерфейс"
          >
            <span>📷</span>
            <span>QR</span>
          </button>
        </div>

        {/* Grid */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${(rows / columns) * 100}%`,
          background: '#3D4247',
          borderRadius: '12px',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '8px',
            padding: '8px',
          }}>
            {schema.buttons.map((button) => {
              const isDark = button.style === 'dark';
              // Получаем количество документов из state или из самой кнопки
              const count = documentCounts.get(button.action as ButtonAction) ?? button.documentCount;
              
              return (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button, {
                    row: button.position.startRow,
                    col: button.position.startCol,
                  })}
                  style={{
                    gridColumn: `${button.position.startCol + 1} / ${button.position.endCol + 2}`,
                    gridRow: `${button.position.startRow + 1} / ${button.position.endRow + 2}`,
                    background: isDark ? '#3E515C' : '#F3A36A',
                    color: isDark ? '#FFFFFF' : '#8B5931',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                    borderRadius: '12px',
                    fontFamily: "'Atkinson Hyperlegible', sans-serif",
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '22px',
                    letterSpacing: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, opacity 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span style={{ flex: '0 0 auto' }}>
                    {button.label}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span style={{
                      alignSelf: 'flex-end',
                      color: '#FFFFFF',
                      fontFamily: "'Atkinson Hyperlegible', sans-serif",
                      fontWeight: 700,
                      fontSize: '20px',
                      lineHeight: '1',
                      marginTop: 'auto',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Debug info */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          <div>Интерфейс: {schema.metadata.name}</div>
          <div>Кнопок: {schema.buttons.length}</div>
          <div>Сетка: {columns}×{rows}</div>
        </div>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScanComplete}
          onClose={handleCloseScanner}
          onError={(error) => {
            console.error('Scanner error:', error);
            alert('Ошибка сканера: ' + error);
          }}
        />
      )}
    </>
  );
};

