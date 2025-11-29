/**
 * Interface Installer Component
 */

import { useState, useRef } from 'react';
import { X, QrCode, Upload, FileJson } from 'lucide-react';
import { SchemaLoader } from '../services/schemaLoader';
import { QRScanner } from './QRScanner';
import analytics from '@/lib/analytics';
import type { UISchema } from '../types/ui-schema';
import { validateSchema } from '../types/ui-schema';
import { Button, Input, TextArea } from '@/design/components';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle QR code scan
  const handleQRScan = (data: string) => {
    console.log('📱 QR data received:', data.substring(0, 100) + '...');
    setLoading(true);
    setError(null);

    try {
      const schema = SchemaLoader.loadFromCompressed(data);
      
      if (schema) {
        SchemaLoader.saveToLocalStorage(schema, 'active');
        window.dispatchEvent(new Event('interface-installed'));
        
        analytics.trackCustomInterfaceQRScan(true);
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: schema.version || schema.metadata?.version || '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'qr',
        });
        
        setShowScanner(false);
        
        if (onSuccess) onSuccess(schema);
        
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
        SchemaLoader.saveToLocalStorage(schema, 'active');
        window.dispatchEvent(new Event('interface-installed'));
        
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: schema.version || schema.metadata?.version || '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'file',
        });
        
        if (onSuccess) onSuccess(schema);
        
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

    setLoading(true);
    setError(null);

    try {
      let schema: UISchema | null = null;
      try {
        schema = JSON.parse(jsonText);
      } catch {
        schema = SchemaLoader.loadFromCompressed(jsonText);
      }
      
      if (schema) {
        if (!validateSchema(schema)) throw new Error('Schema validation failed');
        
        SchemaLoader.saveToLocalStorage(schema, 'active');
        window.dispatchEvent(new Event('interface-installed'));
        
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: schema.version || schema.metadata?.version || '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'qr',
        });
        
        if (onSuccess) onSuccess(schema);
        
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

  // Clear current interface
  const handleClearInterface = () => {
    if (confirm('Удалить текущий кастомный интерфейс и вернуться к стандартному?')) {
      SchemaLoader.deleteFromLocalStorage('active');
      SchemaLoader.deleteFromLocalStorage('default');
      alert('✅ Интерфейс сброшен!\nПерезагрузите страницу для применения.');
      onClose();
    }
  };

  if (showScanner) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black">
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Method tabs */}
        <div className="flex gap-2 p-4 px-6 border-b border-surface-tertiary overflow-x-auto">
          <Button 
            variant={activeMethod === 'qr' ? 'primary' : 'secondary'} 
            onClick={() => setActiveMethod('qr')}
            className="flex-1"
            startIcon={<QrCode size={18} />}
          >
            QR-код
          </Button>
          <Button 
            variant={activeMethod === 'file' ? 'primary' : 'secondary'} 
            onClick={() => setActiveMethod('file')}
            className="flex-1"
            startIcon={<Upload size={18} />}
          >
            Файл
          </Button>
          <Button 
            variant={activeMethod === 'text' ? 'primary' : 'secondary'} 
            onClick={() => setActiveMethod('text')}
            className="flex-1"
            startIcon={<FileJson size={18} />}
          >
            Текст
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* QR Code */}
          {activeMethod === 'qr' && (
            <div className="text-center py-10 px-5">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-lg font-bold text-content-primary mb-2">Сканирование QR-кода</h3>
              <p className="text-sm text-content-tertiary mb-6 leading-relaxed">
                Отсканируйте QR-код с конфигурацией интерфейса из приложения Constructor
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => setShowScanner(true)} 
                isLoading={loading}
              >
                Открыть сканер
              </Button>
            </div>
          )}

          {/* File */}
          {activeMethod === 'file' && (
            <div className="text-center py-10 px-5">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-bold text-content-primary mb-2">Загрузка JSON-файла</h3>
              <p className="text-sm text-content-tertiary mb-6 leading-relaxed">
                Выберите файл с конфигурацией интерфейса (.json)
              </p>
              <div className="flex flex-col items-center gap-3">
                <Button 
                  variant="primary" 
                  size="lg" 
                  isLoading={loading}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Выбрать файл
                </Button>
                <input
                  ref={fileInputRef}
                  id="interface-file-input"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Text */}
          {activeMethod === 'text' && (
            <div>
              <h3 className="text-base font-bold text-content-primary mb-3">
                Вставьте JSON-код или сжатую строку
              </h3>
              <p className="text-sm text-content-tertiary mb-4 leading-relaxed">
                Скопируйте JSON-конфигурацию или сжатую строку из приложения Constructor
              </p>
              <TextArea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"id":"my-interface","version":"1.0.0",...}'
                disabled={loading}
                rows={8}
                className="mb-4 font-mono text-sm"
              />
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleTextPaste} 
                disabled={!jsonText.trim()}
                isLoading={loading}
              >
                Установить интерфейс
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          {/* Reset */}
          <div className="mt-8 pt-6 border-t border-surface-tertiary">
            <Button 
              variant="danger" 
              fullWidth 
              className="border border-error/30 hover:bg-error/20"
              onClick={handleClearInterface}
            >
              Сбросить интерфейс (вернуться к стандартному)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
