# Загрузка данных с сервера MobileSMARTS

Этот документ описывает, как загрузить данные с реального сервера MobileSMARTS и использовать их в демо-режиме приложения.

## Методы загрузки данных

### 1. Через веб-интерфейс (рекомендуется)

Самый простой способ - использовать встроенную страницу загрузки данных:

1. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

2. Войдите в систему (можно использовать демо-режим)

3. Откройте меню (☰) и выберите **"Загрузка данных"**

4. Настройте опции загрузки:
   - ✅ Загрузить товары
   - ✅ Загрузить ячейки
   - ✅ Загрузить контрагентов
   - ✅ Загрузить сотрудников
   - ✅ Загрузить склады

5. Нажмите **"Загрузить данные"**

6. Дождитесь завершения загрузки

7. JSON файлы автоматически скачаются в папку загрузок

8. Скопируйте скачанные файлы в `src/data/demo/`

9. Перезапустите приложение

### 2. Через Node.js скрипт

Для автоматизации или работы в командной строке:

```bash
# Загрузить данные с сервера по умолчанию (localhost:9000)
npm run fetch-data

# Загрузить данные с произвольного сервера
npm run fetch-data:custom http://your-server:9000/MobileSMARTS/api/v1 ./src/data/demo

# С указанием учетных данных
node scripts/fetchServerData.js http://localhost:9000/MobileSMARTS/api/v1 ./src/data/demo username password
```

**Параметры:**
- `serverUrl` - URL API сервера (по умолчанию: `http://localhost:9000/MobileSMARTS/api/v1`)
- `outputDir` - Директория для сохранения файлов (по умолчанию: `src/data/demo`)
- `username` - Имя пользователя (опционально)
- `password` - Пароль (опционально)

### 3. Через Swagger UI

Вы также можете использовать Swagger UI для изучения и тестирования API:

1. Откройте в браузере: `http://localhost:9000/MobileSMARTS/swagger/ui/index`

2. Изучите доступные endpoints:
   - `/api/v1/DocTypes` - Типы документов
   - `/api/v1/Docs` - Документы
   - `/api/v1/Products` - Товары
   - `/api/v1/Cells` - Ячейки
   - `/api/v1/Partners` - Контрагенты
   - `/api/v1/Employees` - Сотрудники
   - `/api/v1/Warehouses` - Склады

3. Используйте кнопку **"Try it out"** для тестирования запросов

## Структура данных

После загрузки в папке `src/data/demo/` будут созданы следующие файлы:

```
src/data/demo/
├── doctypes.json      # Типы документов (ПриходНаСклад, ОтборИзЯчеек и т.д.)
├── documents.json     # Документы, сгруппированные по типам
├── products.json      # Товары (необязательно)
├── cells.json         # Ячейки хранения (необязательно)
├── partners.json      # Контрагенты (необязательно)
├── employees.json     # Сотрудники (необязательно)
├── warehouses.json    # Склады (необязательно)
└── _stats.json        # Статистика загрузки
```

## Формат данных

### doctypes.json
```json
{
  "@odata.context": "http://localhost:9000/MobileSMARTS/api/v1/$metadata#DocTypes",
  "value": [
    {
      "uni": "PrihodNaSklad",
      "name": "ПриходНаСклад",
      "displayName": "ПриходНаСклад",
      "alias": "Приемка",
      "buttonColor": "Orange",
      ...
    }
  ]
}
```

### documents.json
```json
{
  "PrihodNaSklad": [
    {
      "id": "123",
      "number": "ПР-001",
      "date": "2024-01-01T10:00:00Z",
      ...
    }
  ],
  "OtborIzYacheek": [...],
  ...
}
```

### products.json
```json
{
  "value": [
    {
      "id": "P001",
      "name": "Товар 1",
      "barcode": "1234567890123",
      ...
    }
  ]
}
```

## Использование демо-данных

После загрузки данных они автоматически используются в демо-режиме:

1. **В веб-приложении:**
   - Войдите в демо-режим (без авторизации)
   - Данные загрузятся автоматически из `src/data/demo/`

2. **Программное использование:**
   ```typescript
   import { demoDataService } from '@/services/demoDataService';

   // Получить типы документов
   const docTypes = demoDataService.getDocTypes();

   // Получить документы по типу
   const docs = demoDataService.getDocuments('PrihodNaSklad');

   // Получить товары
   const products = demoDataService.getProducts();

   // Получить ячейки
   const cells = demoDataService.getCells();

   // Поиск товара по штрихкоду
   const product = demoDataService.findProductByBarcode('1234567890123');

   // Поиск ячейки по коду
   const cell = demoDataService.findCellByCode('A-01-01');
   ```

## Обновление данных

Для обновления данных повторите процедуру загрузки. Старые файлы будут перезаписаны.

## Устранение проблем

### Ошибка подключения к серверу

```
❌ Error fetching /DocTypes: connect ECONNREFUSED
```

**Решение:**
1. Убедитесь, что сервер MobileSMARTS запущен
2. Проверьте URL сервера
3. Проверьте настройки файрвола

### Ошибка авторизации

```
❌ Error fetching /DocTypes: 401 Unauthorized
```

**Решение:**
1. Укажите учетные данные при запуске скрипта
2. Проверьте правильность логина и пароля

### Пустые данные

```
⚠️ Found 0 documents
```

**Решение:**
1. Проверьте, что на сервере есть данные
2. Попробуйте загрузить данные через Swagger UI
3. Проверьте права доступа пользователя

## Дополнительная информация

- [Документация MobileSMARTS API](http://localhost:9000/MobileSMARTS/swagger/ui/index)
- [Структура проекта](../README.md)
- [Демо-режим](./DEMO_MODE.md)

## Примеры использования

### Загрузка только типов документов и документов

```bash
node scripts/fetchServerData.js
```

### Загрузка всех данных с кастомного сервера

```bash
node scripts/fetchServerData.js http://192.168.1.100:9000/MobileSMARTS/api/v1 ./src/data/demo
```

### Загрузка с авторизацией

```bash
node scripts/fetchServerData.js http://localhost:9000/MobileSMARTS/api/v1 ./src/data/demo admin password123
```


