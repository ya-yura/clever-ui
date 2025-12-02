// === 📁 src/pages/DataFetcher.tsx ===
// Страница для загрузки данных с сервера

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Checkbox } from '@/design/components/Checkbox';
import { Alert } from '@/design/components/Alert';
import { ProgressBar } from '@/design/components/ProgressBar';
import { downloadAllData, saveDemoData, FetchDataOptions } from '@/utils/dataFetcher';

export const DataFetcher: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<FetchDataOptions>({
    includeProducts: true,
    includeCells: true,
    includePartners: true,
    includeEmployees: true,
    includeWarehouses: true,
  });

  const handleFetch = async () => {
    setIsLoading(true);
    setProgress(0);
    setProgressMessage('');
    setResult(null);
    setError(null);

    try {
      const fetchResult = await downloadAllData({
        ...options,
        onProgress: (message, progressValue) => {
          setProgressMessage(message);
          setProgress(progressValue);
        },
      });

      if (fetchResult.success) {
        setResult(fetchResult);
        
        // Сохранить в localStorage для демо-режима
        if (fetchResult.data) {
          saveDemoData(fetchResult.data);
        }
      } else {
        setError(fetchResult.error || 'Неизвестная ошибка');
      }
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '24px' }}>Загрузка данных с сервера</h1>

        <Card style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Настройки загрузки</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox
              checked={options.includeProducts ?? true}
              onChange={(checked) => setOptions({ ...options, includeProducts: checked })}
            >
              Загрузить товары
            </Checkbox>
            
            <Checkbox
              checked={options.includeCells ?? true}
              onChange={(checked) => setOptions({ ...options, includeCells: checked })}
            >
              Загрузить ячейки
            </Checkbox>
            
            <Checkbox
              checked={options.includePartners ?? true}
              onChange={(checked) => setOptions({ ...options, includePartners: checked })}
            >
              Загрузить контрагентов
            </Checkbox>
            
            <Checkbox
              checked={options.includeEmployees ?? true}
              onChange={(checked) => setOptions({ ...options, includeEmployees: checked })}
            >
              Загрузить сотрудников
            </Checkbox>
            
            <Checkbox
              checked={options.includeWarehouses ?? true}
              onChange={(checked) => setOptions({ ...options, includeWarehouses: checked })}
            >
              Загрузить склады
            </Checkbox>
          </div>

          <Button
            onClick={handleFetch}
            disabled={isLoading}
            style={{ marginTop: '24px', width: '100%' }}
          >
            {isLoading ? 'Загрузка...' : 'Загрузить данные'}
          </Button>
        </Card>

        {isLoading && (
          <Card style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Прогресс загрузки</h3>
            <ProgressBar value={progress} max={100} />
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              {progressMessage}
            </p>
          </Card>
        )}

        {error && (
          <Alert variant="error" style={{ marginBottom: '24px' }}>
            <strong>Ошибка:</strong> {error}
          </Alert>
        )}

        {result && result.success && (
          <Card>
            <h3 style={{ marginBottom: '16px' }}>✅ Данные успешно загружены!</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Статистика:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>📋 Типов документов: {result.stats?.docTypes || 0}</li>
                <li>📄 Документов: {result.stats?.documents || 0}</li>
                <li>📦 Товаров: {result.stats?.products || 0}</li>
                <li>🏪 Ячеек: {result.stats?.cells || 0}</li>
                <li>👥 Контрагентов: {result.stats?.partners || 0}</li>
                <li>👨‍💼 Сотрудников: {result.stats?.employees || 0}</li>
                <li>🏭 Складов: {result.stats?.warehouses || 0}</li>
              </ul>
            </div>

            <Alert variant="success">
              Данные сохранены в виде JSON файлов и в localStorage для демо-режима.
              <br />
              Скопируйте скачанные файлы в папку <code>src/data/demo/</code>
            </Alert>
          </Card>
        )}

        <Card style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5' }}>
          <h3 style={{ marginBottom: '12px' }}>ℹ️ Инструкция</h3>
          <ol style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <li>Убедитесь, что сервер MobileSMARTS запущен и доступен</li>
            <li>Выберите нужные опции загрузки</li>
            <li>Нажмите "Загрузить данные"</li>
            <li>Дождитесь завершения загрузки</li>
            <li>JSON файлы будут автоматически скачаны</li>
            <li>Скопируйте скачанные файлы в папку <code>src/data/demo/</code></li>
            <li>Перезапустите приложение для применения новых данных</li>
          </ol>
        </Card>
      </div>
    </Layout>
  );
};

export default DataFetcher;


