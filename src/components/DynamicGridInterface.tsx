import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UISchema, ButtonConfig } from '../types/ui-schema';
import { ACTION_ROUTES, type ButtonAction } from '../types/ui-schema';
import { ActionRegistry } from '../services/actionRegistry';
import { SchemaLoader } from '../services/schemaLoader';
import { documentCounter } from '../services/documentCounter';
import analytics from '@/lib/analytics';

interface DynamicGridInterfaceProps {
  schemaName?: string;
}

export const DynamicGridInterface: React.FC<DynamicGridInterfaceProps> = ({ 
  schemaName = 'default' 
}) => {
  const [schema, setSchema] = useState<UISchema | null>(() => {
    return SchemaLoader.loadFromLocalStorage(schemaName);
  });
  const [documentCounts, setDocumentCounts] = useState<Map<ButtonAction, number>>(new Map());
  const navigate = useNavigate();
  const actionRegistry = new ActionRegistry(navigate);

  useEffect(() => {
    if (!schema) {
      const loadedSchema = SchemaLoader.loadFromLocalStorage(schemaName);
      if (loadedSchema) {
        setSchema(loadedSchema);
      }
    } else {
      analytics.trackCustomInterfaceLoaded({
        id: schema.metadata?.name || schemaName,
        version: schema.version || schema.metadata?.version || '1.0.0',
        buttonsCount: schema.buttons?.length || 0,
        source: 'localStorage',
      });
    }
  }, [schemaName]);

  useEffect(() => {
    if (!schema || !schema.buttons || schema.buttons.length === 0) {
      return;
    }

    const actions = schema.buttons
      .map(btn => btn.action as ButtonAction)
      .filter(action => action !== 'none');

    const loadCounts = async () => {
      const counts = await documentCounter.getAllCounts(actions);
      
      if (counts.size === 0 || Array.from(counts.values()).every(c => c === 0)) {
        const mockCounts = new Map<ButtonAction, number>([
          ['RECEIVING', 58],
          ['ORDER_PICKING', 57],
          ['SHIPPING', 15],
          ['INVENTORY', 99],
          ['PLACEMENT', 91],
          ['RETURN', 85],
          ['TRANSFER', 32],
          ['MARKING', 14],
        ]);
        setDocumentCounts(mockCounts);
      } else {
        setDocumentCounts(counts);
      }
    };

    loadCounts();
    documentCounter.startAutoUpdate(actions, 60000);

    return () => {
      documentCounter.stopAutoUpdate();
    };
  }, [schema]);

  const handleButtonClick = (button: ButtonConfig) => {
    analytics.trackCustomButtonClick({
      label: button.label,
      action: button.action,
      params: button.params,
      position: {
        row: button.position.startRow,
        col: button.position.startCol,
      },
      color: button.color,
    });
    
    if (button.route) {
      navigate(button.route);
    } else if (button.action !== 'none' && button.action in ACTION_ROUTES) {
      const route = ACTION_ROUTES[button.action as keyof typeof ACTION_ROUTES];
      if (route) {
        navigate(route);
      }
    } else {
      actionRegistry.execute(button.action, button.params);
    }
  };

  if (!schema || !schema.buttons || schema.buttons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-5 text-center font-sans">
        <div className="text-6xl mb-6">📱</div>
        <h2 className="text-2xl font-bold text-content-primary mb-3">
          Интерфейс не настроен
        </h2>
        <p className="text-base text-content-secondary mb-8 max-w-md">
          Загрузите интерфейс через меню → Установить интерфейс
        </p>
      </div>
    );
  }

  const { columns, rows } = schema.grid;
  const gap = 2;
  const containerPadding = 32;
  const availableWidth = `100vw - ${containerPadding}px`;
  const cellSize = `calc((${availableWidth} - ${gap * (columns - 1)}px) / ${columns})`;
  
  return (
    <div style={{
      width: '100%',
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize})`,
      gap: `${gap}px`,
      padding: '0',
      margin: '0',
      boxSizing: 'border-box',
    }}>
      {schema.buttons.map((button) => {
        const isDark = button.style === 'dark';
        const count = documentCounts.get(button.action as ButtonAction) ?? button.documentCount;
        
        // Module color mapping based on action
        const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
          'RECEIVING': { bg: 'var(--color-module-receiving-bg)', text: 'var(--color-module-receiving-text)' },
          'ORDER_PICKING': { bg: 'var(--color-module-picking-bg)', text: 'var(--color-module-picking-text)' },
          'SHIPPING': { bg: 'var(--color-module-shipment-bg)', text: 'var(--color-module-shipment-text)' },
          'INVENTORY': { bg: 'var(--color-module-inventory-bg)', text: 'var(--color-module-inventory-text)' },
          'PLACEMENT': { bg: 'var(--color-module-placement-bg)', text: 'var(--color-module-placement-text)' },
          'RETURN': { bg: 'var(--color-module-return-bg)', text: 'var(--color-module-return-text)' },
          'TRANSFER': { bg: 'var(--color-module-transfer-bg)', text: 'var(--color-module-transfer-text)' },
          'MARKING': { bg: 'var(--color-module-marking-bg)', text: 'var(--color-module-marking-text)' },
        };

        // Accent colors for dark (secondary) tiles
        const accentColors = [
          'var(--color-accent-cyan)',
          'var(--color-accent-green)',
          'var(--color-accent-yellow)',
          'var(--color-brand-primary)',
          'var(--color-brand-tertiary)',
        ];
        
        // Inline style overrides if provided in schema
        const styleOverrides: React.CSSProperties = {
          gridColumn: `${button.position.startCol + 1} / ${button.position.endCol + 2}`,
          gridRow: `${button.position.startRow + 1} / ${button.position.endRow + 2}`,
        };

        // Determine colors
        let bgClass = '';
        let textClass = '';
        let borderClass = 'border-transparent';

        if (button.color) {
          // Explicit color override from schema
          styleOverrides.backgroundColor = button.color;
          textClass = isDark ? 'text-content-primary' : 'text-white';
        } else if (!isDark && MODULE_COLORS[button.action]) {
          // Light style (hero tiles) - use module-specific colors
          const moduleColor = MODULE_COLORS[button.action];
          styleOverrides.backgroundColor = moduleColor.bg;
          styleOverrides.color = moduleColor.text;
        } else if (isDark) {
          // Dark style (secondary tiles) - gray background with accent title
          bgClass = 'bg-surface-secondary';
          textClass = 'text-content-primary';
          borderClass = 'border-border-default';
        } else {
          // Fallback for light tiles without module mapping
          styleOverrides.backgroundColor = 'var(--color-brand-primary)';
          styleOverrides.color = 'var(--color-brand-dark)';
        }

        // Get button index for accent color cycling
        const buttonIndex = schema.buttons.indexOf(button);
        const accentColor = isDark ? accentColors[buttonIndex % accentColors.length] : undefined;

        return (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            className={`
              ${bgClass} ${textClass} border ${borderClass}
              rounded-xl font-semibold leading-tight
              flex flex-col items-start justify-between
              p-4 md:p-5 text-left min-h-full cursor-pointer
              transition-all duration-150 ease-out shadow-lg
              active:scale-[0.98] active:opacity-90 hover:brightness-110
            `}
            style={styleOverrides}
          >
            <span 
              className="tile-title-sm flex-none max-w-full font-sans"
              style={accentColor ? { color: accentColor } : {}}
            >
              {button.label}
            </span>
            {count !== undefined && count > 0 && (
              <span 
                className="self-end font-bold text-[28px] leading-none mt-auto drop-shadow-md font-sans"
                style={{ opacity: 0.9 }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
