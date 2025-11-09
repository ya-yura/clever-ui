import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UISchema, ButtonConfig } from '@cleverence/shared-schema';
import { ActionRegistry } from '../services/actionRegistry';
import { SchemaLoader } from '../services/schemaLoader';
import { QRScanner } from './QRScanner';

export const DynamicGridInterface: React.FC = () => {
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const actionRegistry = new ActionRegistry(navigate);

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = () => {
    setLoading(true);
    
    // Попытка загрузить схему из LocalStorage
    const loadedSchema = SchemaLoader.loadFromLocalStorage('default');
    
    if (loadedSchema) {
      console.log('✅ Loaded schema from localStorage:', loadedSchema);
      setSchema(loadedSchema);
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
        alert('✅ Интерфейс успешно загружен!');
      } else {
        console.error('❌ Invalid schema from QR code');
        alert('❌ Неверный QR-код. Попробуйте ещё раз.');
      }
    } catch (error: any) {
      console.error('Failed to load schema from QR:', error);
      alert('❌ Ошибка загрузки схемы: ' + error.message);
    }
  };

  const handleButtonClick = (button: ButtonConfig) => {
    console.log('🖱️ Button clicked:', button.label, button.action);
    actionRegistry.execute(button.action, button.params);
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
  const columnWidth = 100 / columns;

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
              
              return (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button)}
                  style={{
                    gridColumn: `${button.position.startCol + 1} / ${button.position.endCol + 1}`,
                    gridRow: `${button.position.startRow + 1} / ${button.position.endRow + 1}`,
                    background: isDark ? '#3E515C' : '#F3A36A',
                    color: isDark ? '#FFFFFF' : '#8B5931',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                    borderRadius: '12px',
                    fontFamily: "'Atkinson Hyperlegible', sans-serif",
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '22px',
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
                    e.currentTarget.style.transform = 'scale(0.97)';
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
                  {button.documentCount !== undefined && (
                    <span style={{
                      alignSelf: 'flex-end',
                      color: '#FFFFFF',
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: 1,
                      marginTop: 'auto',
                    }}>
                      {button.documentCount}
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
          <div>Кнопок: {schema.buttons.length}</div>
          <div>Сетка: {columns}×{rows}</div>
          <div>Версия: {schema.version}</div>
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

