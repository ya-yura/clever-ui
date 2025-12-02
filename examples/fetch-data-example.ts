// === 📁 examples/fetch-data-example.ts ===
// Примеры использования утилит загрузки данных

import { fetchServerData, downloadAllData, saveDemoData } from '@/utils/dataFetcher';
import { demoDataService } from '@/services/demoDataService';

/**
 * Пример 1: Базовая загрузка всех данных
 */
async function example1_BasicFetch() {
  console.log('=== Пример 1: Базовая загрузка ===');
  
  const result = await fetchServerData({
    onProgress: (message, progress) => {
      console.log(`${progress.toFixed(0)}% - ${message}`);
    },
  });

  if (result.success) {
    console.log('✅ Загрузка завершена!');
    console.log('Статистика:', result.stats);
    
    // Сохранить в localStorage
    saveDemoData(result.data);
  } else {
    console.error('❌ Ошибка:', result.error);
  }
}

/**
 * Пример 2: Выборочная загрузка данных
 */
async function example2_SelectiveFetch() {
  console.log('=== Пример 2: Выборочная загрузка ===');
  
  const result = await fetchServerData({
    includeProducts: true,
    includeCells: true,
    includePartners: false,  // Не загружать контрагентов
    includeEmployees: false, // Не загружать сотрудников
    includeWarehouses: false, // Не загружать склады
    onProgress: (message, progress) => {
      console.log(`${progress.toFixed(0)}% - ${message}`);
    },
  });

  if (result.success) {
    console.log('✅ Загрузка завершена!');
    console.log('Типов документов:', result.stats?.docTypes);
    console.log('Документов:', result.stats?.documents);
    console.log('Товаров:', result.stats?.products);
    console.log('Ячеек:', result.stats?.cells);
  }
}

/**
 * Пример 3: Загрузка и автоматическое сохранение файлов
 */
async function example3_DownloadFiles() {
  console.log('=== Пример 3: Загрузка файлов ===');
  
  try {
    const result = await downloadAllData({
      onProgress: (message, progress) => {
        console.log(`${progress.toFixed(0)}% - ${message}`);
      },
    });

    console.log('✅ Файлы скачаны!');
    console.log('Статистика:', result.stats);
  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
  }
}

/**
 * Пример 4: Использование загруженных демо-данных
 */
function example4_UseDemoData() {
  console.log('=== Пример 4: Использование демо-данных ===');
  
  // Получить типы документов
  const docTypes = demoDataService.getDocTypes();
  console.log('Типов документов:', docTypes.value.length);
  
  // Получить документы конкретного типа
  const receivingDocs = demoDataService.getDocuments('PrihodNaSklad');
  console.log('Документов приемки:', receivingDocs.value.length);
  
  // Получить товары
  const products = demoDataService.getProducts();
  console.log('Товаров:', products.value.length);
  
  // Поиск товара по штрихкоду
  const product = demoDataService.findProductByBarcode('1234567890123');
  if (product) {
    console.log('Найден товар:', product.name);
  }
  
  // Получить ячейки
  const cells = demoDataService.getCells();
  console.log('Ячеек:', cells.value.length);
  
  // Поиск ячейки по коду
  const cell = demoDataService.findCellByCode('A-01-01');
  if (cell) {
    console.log('Найдена ячейка:', cell.name);
  }
  
  // Статистика
  const stats = demoDataService.getStats();
  console.log('Полная статистика:', stats);
}

/**
 * Пример 5: Интеграция в React компонент
 */
/*
import React, { useState } from 'react';
import { fetchServerData } from '@/utils/dataFetcher';

export const DataFetcherComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<any>(null);

  const handleFetch = async () => {
    setIsLoading(true);
    
    const result = await fetchServerData({
      onProgress: (msg, prog) => {
        setMessage(msg);
        setProgress(prog);
      },
    });

    if (result.success) {
      setStats(result.stats);
    }
    
    setIsLoading(false);
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Загрузить данные'}
      </button>
      
      {isLoading && (
        <div>
          <progress value={progress} max={100} />
          <p>{message}</p>
        </div>
      )}
      
      {stats && (
        <div>
          <h3>Статистика:</h3>
          <ul>
            <li>Типов документов: {stats.docTypes}</li>
            <li>Документов: {stats.documents}</li>
            <li>Товаров: {stats.products}</li>
            <li>Ячеек: {stats.cells}</li>
          </ul>
        </div>
      )}
    </div>
  );
};
*/

/**
 * Запуск примеров
 */
async function runExamples() {
  // Раскомментируйте нужный пример
  
  // await example1_BasicFetch();
  // await example2_SelectiveFetch();
  // await example3_DownloadFiles();
  example4_UseDemoData();
}

// Запустить примеры
if (typeof window !== 'undefined') {
  // В браузере
  console.log('Примеры доступны в console:');
  console.log('- example1_BasicFetch()');
  console.log('- example2_SelectiveFetch()');
  console.log('- example3_DownloadFiles()');
  console.log('- example4_UseDemoData()');
  
  (window as any).example1_BasicFetch = example1_BasicFetch;
  (window as any).example2_SelectiveFetch = example2_SelectiveFetch;
  (window as any).example3_DownloadFiles = example3_DownloadFiles;
  (window as any).example4_UseDemoData = example4_UseDemoData;
} else {
  // В Node.js
  runExamples().catch(console.error);
}

export {
  example1_BasicFetch,
  example2_SelectiveFetch,
  example3_DownloadFiles,
  example4_UseDemoData,
};


