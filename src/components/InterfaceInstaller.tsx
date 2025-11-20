/**
 * Interface Installer Component
 * 
 * Позволяет загрузить кастомный интерфейс тремя способами:
 * 1. Сканирование QR-кода
 * 2. Загрузка JSON-файла
 * 3. Вставка JSON-кода (copy-paste)
 */

import { useState } from 'react';
import { X, QrCode, Upload, FileJson } from 'lucide-react';
import { SchemaLoader } from '../services/schemaLoader';
import { QRScanner } from './QRScanner';
import analytics from '../analytics';
import type { UISchema } from '../types/ui-schema';
import { validateSchema } from '../types/ui-schema';

interface InterfaceInstallerProps {
  onClose: () => void;
  onSuccess?: (schema: UISchema) => void;
}

type LoadMethod = 'qr' | 'file' | 'text';

export const InterfaceInstaller: React.FC<InterfaceInstallerProps> = ({ 
  onClose, 
  onSuccess 
}) => {
  const [activeMethod, setActiveMethod] = useState<LoadMethod>('qr');
  const [showScanner, setShowScanner] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle QR code scan
  const handleQRScan = (data: string) => {
    console.log('📱 QR data received:', data.substring(0, 100) + '...');
    setLoading(true);
    setError(null);

    try {
      const schema = SchemaLoader.loadFromCompressed(data);
      
      if (schema) {
        // Save to localStorage as 'active' schema
        SchemaLoader.saveToLocalStorage(schema, 'active');
        
        // Dispatch event to notify Home component
        window.dispatchEvent(new Event('interface-installed'));
        
        // Track successful load
        analytics.trackCustomInterfaceQRScan(true);
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: schema.version || schema.metadata?.version || '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'qr',
        });
        
        setShowScanner(false);
        
        if (onSuccess) {
          onSuccess(schema);
        }
        
        alert('✅ Интерфейс успешно загружен!');
        onClose();
      } else {
        throw new Error('Invalid schema format');
      }
    } catch (err: any) {
      console.error('QR scan error:', err);
      setError(`Ошибка: ${err.message}`);
      analytics.trackCustomInterfaceQRScan(false, err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', file.name);
    setLoading(true);
    setError(null);

    try {
      const schema = await SchemaLoader.loadFromFile(file);
      
      if (schema) {
        // Save to localStorage as 'active' schema
        SchemaLoader.saveToLocalStorage(schema, 'active');
        
        // Dispatch event to notify Home component
        window.dispatchEvent(new Event('interface-installed'));
        
        // Track successful load
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: schema.version || schema.metadata?.version || '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'file',
        });
        
        if (onSuccess) {
          onSuccess(schema);
        }
        
        alert('✅ Интерфейс успешно загружен!');
        onClose();
      } else {
        throw new Error('Invalid JSON schema');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(`Ошибка загрузки файла: ${err.message}`);
      analytics.trackError(err, { component: 'InterfaceInstaller', method: 'file' });
    } finally {
      setLoading(false);
    }
  };

  // Handle text paste
  const handleTextPaste = () => {
    if (!jsonText.trim()) {
      setError('Введите JSON-код интерфейса');
      return;
    }

    console.log('📝 Processing pasted JSON:', jsonText.substring(0, 100) + '...');
    setLoading(true);
    setError(null);

    try {
      // Try to parse as regular JSON
      let schema: UISchema | null = null;
      
      try {
        schema = JSON.parse(jsonText);
      } catch {
        // If failed, try as compressed
        schema = SchemaLoader.loadFromCompressed(jsonText);
      }
      
      if (schema) {
        // Validate schema
        if (!validateSchema(schema)) {
          throw new Error('Schema validation failed');
        }
        
        // Save to localStorage as 'active' schema
        SchemaLoader.saveToLocalStorage(schema, 'active');
        
        // Dispatch event to notify Home component
        window.dispatchEvent(new Event('interface-installed'));
        
        // Track successful load
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: schema.version || schema.metadata?.version || '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'qr', // Using 'qr' as it's compressed
        });
        
        if (onSuccess) {
          onSuccess(schema);
        }
        
        alert('✅ Интерфейс успешно загружен!');
        onClose();
      } else {
        throw new Error('Invalid schema format');
      }
    } catch (err: any) {
      console.error('Text paste error:', err);
      setError(`Ошибка: ${err.message}`);
      analytics.trackError(err, { component: 'InterfaceInstaller', method: 'text' });
    } finally {
      setLoading(false);
    }
  };

  // Clear current interface (reset to standard)
  const handleClearInterface = () => {
    if (confirm('Удалить текущий кастомный интерфейс и вернуться к стандартному?')) {
      SchemaLoader.deleteFromLocalStorage('active');
      SchemaLoader.deleteFromLocalStorage('default');
      
      alert('✅ Интерфейс сброшен!\nПерезагрузите страницу для применения.');
      onClose();
    }
  };

  // If scanner is active, show it
  if (showScanner) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black">
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-5 backdrop-blur-sm">
      <div className="bg-surface-secondary rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-auto relative border border-surface-tertiary shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-surface-tertiary flex justify-between items-center">
          <h2 className="text-2xl font-bold text-content-primary m-0">
            Установить интерфейс
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none p-2 cursor-pointer text-content-tertiary hover:text-content-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Method tabs */}
        <div className="flex gap-2 p-4 px-6 border-b border-surface-tertiary overflow-x-auto">
          <button
            onClick={() => setActiveMethod('qr')}
            className={`flex-1 py-3 px-4 border-none rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${
              activeMethod === 'qr' 
                ? 'bg-brand-primary text-brand-dark' 
                : 'bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80'
            }`}
          >
            <QrCode size={18} />
            QR-код
          </button>
          <button
            onClick={() => setActiveMethod('file')}
            className={`flex-1 py-3 px-4 border-none rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${
              activeMethod === 'file'
                ? 'bg-brand-primary text-brand-dark'
                : 'bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80'
            }`}
          >
            <Upload size={18} />
            Файл
          </button>
          <button
            onClick={() => setActiveMethod('text')}
            className={`flex-1 py-3 px-4 border-none rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap transition-colors ${
              activeMethod === 'text'
                ? 'bg-brand-primary text-brand-dark'
                : 'bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80'
            }`}
          >
            <FileJson size={18} />
            Текст
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Code method */}
          {activeMethod === 'qr' && (
            <div>
              <div className="text-center py-10 px-5">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-content-primary mb-2">
                  Сканирование QR-кода
                </h3>
                <p className="text-sm text-content-tertiary mb-6 leading-relaxed">
                  Отсканируйте QR-код с конфигурацией интерфейса из приложения Constructor
                </p>
                <button
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                  className={`py-4 px-8 bg-brand-primary text-brand-dark border-none rounded-xl text-base font-bold cursor-pointer transition-opacity ${
                    loading ? 'opacity-60 cursor-not-allowed' : 'opacity-100 hover:brightness-110'
                  }`}
                >
                  {loading ? 'Загрузка...' : 'Открыть сканер'}
                </button>
              </div>
            </div>
          )}

          {/* File upload method */}
          {activeMethod === 'file' && (
            <div>
              <div className="text-center py-10 px-5">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-bold text-content-primary mb-2">
                  Загрузка JSON-файла
                </h3>
                <p className="text-sm text-content-tertiary mb-6 leading-relaxed">
                  Выберите файл с конфигурацией интерфейса (.json)
                </p>
                <label className={`inline-block py-4 px-8 bg-brand-primary text-brand-dark rounded-xl text-base font-bold cursor-pointer transition-opacity ${
                  loading ? 'opacity-60 cursor-not-allowed' : 'opacity-100 hover:brightness-110'
                }`}>
                  {loading ? 'Загрузка...' : 'Выбрать файл'}
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Text paste method */}
          {activeMethod === 'text' && (
            <div>
              <h3 className="text-base font-bold text-content-primary mb-3">
                Вставьте JSON-код или сжатую строку
              </h3>
              <p className="text-sm text-content-tertiary mb-4 leading-relaxed">
                Скопируйте JSON-конфигурацию или сжатую строку из приложения Constructor и вставьте ниже
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"id":"my-interface","version":"1.0.0",...}'
                disabled={loading}
                className="w-full min-h-[200px] p-3 bg-surface-primary border border-surface-tertiary rounded-lg text-content-primary text-sm font-mono resize-y mb-4 focus:border-brand-secondary outline-none"
              />
              <button
                onClick={handleTextPaste}
                disabled={loading || !jsonText.trim()}
                className={`w-full py-3.5 bg-brand-primary text-brand-dark border-none rounded-lg text-base font-bold cursor-pointer transition-opacity ${
                  loading || !jsonText.trim() ? 'opacity-60 cursor-not-allowed' : 'opacity-100 hover:brightness-110'
                }`}
              >
                {loading ? 'Загрузка...' : 'Установить интерфейс'}
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          {/* Clear interface button */}
          <div className="mt-8 pt-6 border-t border-surface-tertiary">
            <button
              onClick={handleClearInterface}
              className="w-full p-3 bg-transparent border border-error/50 rounded-lg text-error text-sm font-semibold cursor-pointer hover:bg-error/10 transition-colors"
            >
              Сбросить интерфейс (вернуться к стандартному)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
