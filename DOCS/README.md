# Cleverence Склад‑15 PWA — актуальная документация
_Обновлено: 1 декабря 2025. Этот файл заменяет все предыдущие материалы каталога `DOCS/`._

## 1. Что построено
- PWA‑клиент для Mobile SMARTS «Склад‑15» c полностью реализованными модулями **Приёмка, Размещение, Подбор, Отгрузка, Возврат/Списание и Инвентаризация**.
- Универсальная логика документов (`useDocumentLogic`, `SmartDocumentRouter`) + оффлайн‑first хранение в IndexedDB (Dexie) и очередь синхронизации.
- Расширенная система аналитики (`src/lib/analytics.ts`) с буферизацией, Supabase Edge Function `analytics-batch` и страницей статистики.
- Кастомизируемый главный экран (Creator) через JSON‑схему, установщик интерфейсов и автоматический маппинг цветов.
- Полноценная дизайн‑система (25+ компонентов, темизация, accessibility) и dark/light темы на базе токенов.
- Инструменты для загрузки реальных данных: страница `DataFetcher`, `demoDataService`, CLI‐скрипты `scripts/fetchServerData.*`.

## 2. Быстрый старт для разработчиков
**Требования:** Node.js ≥18, npm ≥10, Git, Supabase CLI (для аналитики), доступ к серверу Mobile SMARTS (обычно `http://localhost:9000`).

**Команды:**
- `npm install` — установка зависимостей.
- `npm run dev` — локальный сервер (Vite). Проект откроется на `http://localhost:5173` (`/setup` отображается при первом запуске).
- `npm run build` / `npm run preview` — production‑сборка и локальная проверка `/dist`.

**Переменные окружения (frontend):**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — публичный ключ Supabase для аналитики.
- `VITE_SUPABASE_ANALYTICS_URL` — конечная точка `analytics-batch` (если не задана, используется `/track`).

**Настройка сервера:**
1. Откройте `/setup`, укажите API URL (например, `http://localhost:9000/MobileSMARTS/api/v1`).
2. Нажмите «Проверить соединение» → «Сохранить». `configService` сохранит URL и автоматически переключит `api.ts` на Vite proxy (`/MobileSMARTS/...`) в dev.
3. Перейдите на `/login` и авторизуйтесь (OAuth2, временный токен `?tempuid=...` или «Войти без авторизации» для демо).

## 3. Архитектура и структура
| Каталог | Назначение |
| --- | --- |
| `src/pages` | Экранные компоненты (Receiving, Placement, Picking, Shipment, Return, Inventory, Documents*, Settings, DataFetcher, Statistics и пр.). |
| `src/components` | Переиспользуемые блоки (`LineCard`, `DocumentListFilter`, `RouteVisualization`, `InterfaceInstaller`, `SmartDocumentRouter` и др.). |
| `src/design` | Токены `tokens.ts`, JSON‑экспорт и библиотека UI‑компонентов (`src/design/components`). |
| `src/contexts` | `AuthContext`, `ThemeContext`, `DocumentHeaderContext`, `MenuContext` и т. д. |
| `src/hooks` | `useDocumentLogic`, `useScanner`, `useOfflineStorage`, `useSync`, `useODataSync`, `useAutoSave`, т. д. |
| `src/services` | `api.ts`, `configService`, `documentService`, `demoDataService`, `odata-api.ts`, `odataCache.ts`, `documentCounter.ts`, `db.ts`. |
| `src/lib/analytics.ts` | Класс Analytics + React‑хуки, отвечающие за события и отправку пачек. |
| `src/data/demo` | JSON заглушки для демо/офлайна (загружаются при `demo_mode`). |
| `scripts/` | CLI‑утилиты для выгрузки данных и работы с Figma (`fetchServerData.*`, `analyze_light_colors.cjs`, и т. д.). |
| `supabase/` | Миграции (`migrations/20240320_create_activity_events.sql`) и Edge Function `functions/analytics-batch`. |
| `DOCS/$metadata.xml` | Справочный контракт OData (DocTypes/Docs). | 

PWA настроен через `vite.config.ts` (proxy `/MobileSMARTS`, `vite-plugin-pwa`) и Tailwind с кастомными токенами (`tailwind.config.js`).

## 4. API, данные и демо‑режим
### 4.1 Подключение MobileSMARTS
1. DEV: используем относительный путь `/MobileSMARTS/api/v1` (Vite proxy) → избегаем CORS.
2. PROD: сохраняем полный URL сервера (пример: `https://ms-cloud.example.ru/MobileSMARTS/api/v1`).
3. Минимальные заголовки: `Accept: application/json`, `Content-Type: application/json` (`text/plain` для `$count`).
4. Полезные проверки: 
   - `curl http://localhost:9000/MobileSMARTS/api/v1/DocTypes`
   - `curl http://localhost:9000/MobileSMARTS/api/v1/Docs/PrihodNaSklad/$count`

**Основные endpoints:**
| Endpoint | Описание |
| --- | --- |
| `/DocTypes` | Типы документов, кнопки главного меню. |
| `/Docs/{DocType.uni}` и `$count` | Документы каждого типа и количество. |
| `/Docs('{id}')?$expand=items` | Строки конкретного документа. |
| `/Products`, `/Cells`, `/Partners`, `/Employees`, `/Warehouses` | Справочники (используются при сканировании, подсказках, интерфейсах). |

`documentCounter.ts` сначала пытается `$count`, затем падает назад на `GET /Docs`. Кэш хранится в `localStorage` и обновляется каждые 60 с.

### 4.2 Загрузка данных и демо
**UI (рекомендуется):** `Меню → Загрузка данных` → выбрать справочники → «Загрузить». Файлы автоматически скачиваются, их нужно положить в `src/data/demo/`. 

**CLI:**
```bash
npm run fetch-data                       # localhost:9000 по умолчанию
npm run fetch-data:custom http://host:9000/MobileSMARTS/api/v1 ./src/data/demo user pass
node scripts/fetchServerData.js http://server:9000/MobileSMARTS/api/v1 ./output
```
Выходные файлы: `doctypes.json`, `documents.json`, `products.json`, `cells.json`, `partners.json`, `employees.json`, `warehouses.json`, `_stats.json`.

**Демо‑режим:** при выборе «Войти без авторизации» устанавливается `localStorage.demo_mode = true`. Сервисы (`demoDataService`, `odataCache`) автоматически переключаются на локальные JSON, а все операции (сканирование, завершение) продолжают работать в IndexedDB.

### 4.3 Metadata
`DOCS/$metadata.xml` содержит актуальный контракт Mobile SMARTS. Используйте его как источник типов и ключей при интеграции или генерации API‑клиента.

## 5. Аутентификация и доступ
- `AuthContext` поддерживает OAuth2 (`/.well-known/openid-configuration`, `POST /connect/token`), refresh‑токены и прослушивает `auth:unauthorized` для автоматического выхода.
- Временные токены (`?tempuid=<token>`) логинят пользователя под системным аккаунтом `__tempuid__`.
- «Войти без авторизации» включает демо‑режим (нет запросов к серверу, токены не сохраняются).
- `checkNoAuth()` на `/setup` определяет необходимость логина по HTTP‑кодам (404 → авторизация не нужна).
- `loginDemo()` создаёт фиктивного пользователя, настраивает аналитику (`analytics.setUserId`).
- Все токены и пользователь сохраняются в `localStorage` под ключом `auth_state`; `authService` отвечает за refresh.

## 6. Технические блоки
### Сервисы
| Сервис | Назначение |
| --- | --- |
| `api.ts` | Axios‑клиент с динамическим `baseURL`, авто‑refresh токена и трекингом `EventType.API_CALL`. |
| `configService` | Хранит URL сервера и настройки `setup`. |
| `documentService` | Универсальные CRUD‑операции по документам, объединяет OData и IndexedDB. |
| `demoDataService` | Чтение JSON из `src/data/demo`, поиск по штрихкодам/ячейкам. |
| `odata-api.ts` / `odataCache.ts` | Клиент OData и локальный кэш DocTypes/Docs с TTL. |
| `documentCounter.ts` | Получение количества документов (API → fallback на кэш). |
| `db.ts` | Dexie схемы (`receivingDocuments`, `pickingLines`, `inventoryLines`, `returnLines`, `syncActions`, `errorLogs`, `activityEvents`, и т. д.). |
| `supabase/integrations/client.ts` | Клиент Supabase JS (использует `VITE_SUPABASE_*`). |

### Хуки
`useDocumentLogic`, `useScanner` (клавиатура/камера/ручной ввод + аналитика), `useOfflineStorage`, `useSync`, `useODataSync`, `useAutoSave`, `useAnalytics`. Они скрывают состояние прогресса, очередь синхронизации, обработку ошибок и обратную связь.

### Утилиты
`feedback.ts` (звук/вибро/тосты), `sound.ts`, `vibration.ts`, `voice.ts`, `analytics.helpers.ts`.

### SmartDocumentRouter
`src/components/SmartDocumentRouter.tsx` маршрутизирует `/docs/:docTypeUni/:docId` к интерактивному UI (6 модулей) или к табличному `DocumentDetails`. Это устраняет дублирование маршрутов и проблемы с fallback.

## 7. Покрытие модулей
| Модуль | Статус / сценарии | Основные файлы |
| --- | --- | --- |
| Приёмка | 8/8 ✅ | `src/pages/Receiving.tsx`, `LineCard`, `QuantityControl`, `DiscrepancyAlert`, `AutoCompletePrompt`. |
| Размещение | 6/6 ✅ | `src/pages/Placement.tsx`, двухшаговый индикатор, история действий. |
| Подбор | 7/7 ✅ | `src/pages/Picking.tsx`, `RouteVisualization`, пропуск ячеек, автопереход. |
| Отгрузка | 7/7 ✅ | `src/pages/Shipment.tsx`, `CompletenessCheck`, `TTNInput`, печать. |
| Возврат/Списание | 6/6 ✅ | `src/pages/Return.tsx`, `OperationTypeSelector`, `ReasonSelector`, `PhotoCapture`. |
| Инвентаризация | 7/7 ✅ | `src/pages/Inventory.tsx`, `InventoryTypeSelector`, `DiscrepancyCard`, расчёт расхождений. |

Каждый модуль использует `useDocumentLogic`, регистрирует события (`EventType.SCAN_SUCCESS`, `DOC_COMPLETE`) и добавляет `syncActions` для последующей отправки. Dexie хранит как документы, так и строки, включая историю операций, текущую ячейку, фото и т. п.

## 8. Общие компоненты и страницы
- **Документы:** `src/pages/Documents.tsx`, `DocumentsByType.tsx`, `DocumentDetails.tsx` + `DocumentListFilter`, `DocTypeTabs`, `LineCard`.
- **Навигация:** `Header`, `MenuDrawer`, `NavigationTracker`, `ConnectionIndicator`, `SyncQueueIndicator`.
- **Данные:** `DataFetcher.tsx` (UI для загрузки), `PartnerManagement.tsx`, `Settings.tsx`, `Statistics.tsx`.
- **Компоненты:** `DocumentListFilter`, `LineCard`, `DiscrepancyAlert`, `QuantityControl`, `AutoCompletePrompt`, `RouteVisualization`, `CompletenessCheck`, `TTNInput`, `OperationTypeSelector`, `ReasonSelector`, `PhotoCapture`, `InventoryTypeSelector`, `DiscrepancyCard`, `SmartDocumentRouter`, `InterfaceInstaller`, `DynamicGridInterface`.

## 9. Пользовательские сценарии (операторы)
- **Главная / меню:** плитки DocTypes отображают количество документов, цвет и иконку. Меню (☰) содержит настройки, загрузку данных, установку интерфейса, напарника, синхронизацию.
- **Приёмка:** выбрать документ → сканировать товар (штрихкод) → +1 факт. Превышение плана требует подтверждения. После завершения предлагается перейти в Размещение. Расхождения показываются в `DiscrepancyAlert`.
- **Размещение:** шаг 1 — сканировать ячейку, шаг 2 — товар. `History` позволяет отменить последнее действие, `Reset cell` сбрасывает выбранную ячейку.
- **Подбор:** маршрут по ячейкам (`RouteVisualization`), индикатор прогресса, кнопка пропуска, автоматический переход к следующей ячейке.
- **Отгрузка:** проверка комплектности (`CompletenessCheck`), затем ввод ТТН/перевозчика (`TTNInput`). При частичной готовности отображается предупреждение.
- **Возврат/Списание:** выбор типа, сканирование товара, диалог причин (`ReasonSelector`), комментарии, опционально фото (`PhotoCapture`).
- **Инвентаризация:** выбор типа (полная/частичная/ячейка), сканирование ячейки (формат `A1-01`), затем товаров. Автоматический расчёт расхождений и карточка итогов.
- **Сканер:** аппаратный (keyboard wedge), камера (`html5-qrcode`) или ручной ввод. Ошибки/успех сопровождаются звуком, вибро и голосом (при включении).
- **Оффлайн:** индикатор статуса в шапке. Все действия пишутся в IndexedDB и очередь синхронизации. После восстановления сети `useSync` отправит пачки.

## 10. Кастомные интерфейсы (Creator)
- **JSON‑схема:**
  ```json
  {
    "metadata": {"name": "Склад", "description": "Hero layout", "version": "1.0"},
    "grid": {"columns": 4, "rows": 8},
    "buttons": [
      {
        "id": "btn-1",
        "label": "Приход",
        "action": "RECEIVING",
        "style": "light", 
        "position": {"startCol":0,"endCol":1,"startRow":0,"endRow":1},
        "documentCount": 54
      }
    ]
  }
  ```
- **Поля `buttons`:** `id`, `label`, `action` (см. таблицу ниже), `position` (`startCol/endCol/startRow/endRow`), `style` (`light` = бренд‑фон, `dark` = серые плитки), `route` (необязательно), `color` (необязательно), `documentCount` (fallback).
- **Actions → маршруты/цвета:**
  | Action | Route | Цвет |
  | --- | --- | --- |
  | `RECEIVING` | `/docs/PrihodNaSklad` | `#d89668` |
  | `PLACEMENT` | `/docs/RazmeshhenieVYachejki` | `#86e0cb` |
  | `ORDER_PICKING` | `/docs/PodborZakaza` | `#c9a636` |
  | `SHIPPING` | `/docs/Otgruzka` | `#a0d995` |
  | `RETURN` | `/docs/Vozvrat` | `#e35454` |
  | `INVENTORY` | `/docs/Inventarizaciya` | `#f0a58a` |
  | `TRANSFER` | `/docs/Peremeshenie` | `#4dd0e1` |
  | `MARKING` | `/docs/Markirovka` | `#7ed321` |
- **Установка:** `Меню → Установить интерфейс` (вкладки «Файл», «QR-код», «Текст»). Схема хранится в `localStorage` (`ui-schema-active`).
- **Сброс:** DevTools → `localStorage.removeItem('ui-schema-active')` и перезагрузить страницу.

## 11. Дизайн‑система
- **Философия:** контраст ≥WCAG AA/AAA, крупные touch targets (≥44px), industrial UI, dark‑first, семантические цвета (`bg-surface-*`, `text-content-*`).
- **Токены:** определены в `src/theme/design-system.json`, экспортируются в `src/design/tokens.ts` и Tailwind (`var(--color-...)`). Статусы: success `#91ed91`, warning `#f3a361`, error `#ba8f8e`, info `#86e0cb`. Бренд: primary `#daa420`, text на нём `#725a1e`.
- **Типографика:** Atkinson Hyperlegible, шкала от `text-3xl (36px)` до `text-xs (10px)`, `font-bold` для заголовков. Спейсинг — сетка 4px (`gap-4`, `p-4`, `p-6` на десктопе).
- **Motion:** `duration-100/200/300/500`, easing `ease-in-out` (стандарт), `ease-out` (вход), `ease-in` (выход). Поддержка `prefers-reduced-motion`.
- **Компоненты (`src/design/components`):** Buttons (primary/secondary/ghost/danger, sm/md/lg/icon), Card (base/elevated/interactive), Badge, Chip, Avatar, ProgressBar, Input/TextArea, Checkbox, Toggle, Skeleton, Drawer, Modal, Tabs и др. Showcase доступен на `/design-system`.
- **Темы:** `ThemeContext` переключает `data-theme=dark|light`. CSS‑переменные объявлены в `src/index.css`. Светлая тема использует цвета (`surface-primary: #f6f7fb`, `content-primary: #1f2933`, и т. д.).
- **Figma (опционально):**
  1. Сгенерируйте Figma Personal Access Token (`figd_...`).
  2. Установите MCP сервер: `npm install -g @modelcontextprotocol/server-figma` или запустите через `npx`.
  3. Добавьте в `%APPDATA%/Cursor/User/globalStorage/config.json`:
     ```json
     { "mcpServers": { "figma": { "command": "npx", "args": ["-y","@modelcontextprotocol/server-figma"], "env": { "FIGMA_PERSONAL_ACCESS_TOKEN": "figd_xxx" } } } }
     ```
  4. Перезапустите Cursor и используйте MCP инструменты для чтения макетов/токенов.

## 12. Аналитика и статистика
- **Рантайм:** `Analytics` буферизует события (по 10, flush каждые 30 с, при `navigator.onLine`). Сохраняет в IndexedDB (`activityEvents`) и в `localStorage` для восстановления после перезапуска. События: `doc.start`, `doc.complete`, `scan.success/error`, `item.add/edit/undo`, `nav.module`, `search.use`, `filter.use`, `sort.use`, `api.call`, `error.network`, `screen_view`, кастомные (`custom_interface.*`).
- **API контракт:**
  - `POST /api/v1/analytics/batch`
  - Заголовки: `Content-Type: application/json`, `X-API-Key: <секрет>`, `User-Agent: Cleverence-PWA/<версия>`.
  - Тело: `{ "events": [{ "id": "uuid", "eventType": "scan.success", "timestamp": 1732531200000, "userId": "user_123", "deviceId": "device_abc", "payload": { ... } }] }`.
  - Ответ 200: `{ "success": true, "processed": <n>, "failed": 0 }`. Сервер обязан дедуплицировать по `id`.
- **Supabase:**
  - Таблица `activity_events` (см. миграцию `supabase/migrations/20240320_create_activity_events.sql`).
  - Edge Function `supabase/functions/analytics-batch/index.ts` (Deno + `@supabase/supabase-js`). Функция валидирует вход (Zod), пишет события с upsert, использует `SUPABASE_SERVICE_ROLE_KEY`.
  - Деплой:
    ```bash
    supabase db push
    supabase functions deploy analytics-batch
    supabase secrets set SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=...
    ```
  - Frontend должен знать `VITE_SUPABASE_ANALYTICS_URL=https://<PROJECT>.supabase.co/functions/v1/analytics-batch`.
- **Статистика:** `Statistics.tsx` пока отображает локальные KPI (подсчёт документов из Dexie, заглушки для средних значений/ошибок). План — связать с реальными событиями.

## 13. Тестирование и качество
- **Ручное тестирование (29 ноября 2025):** Все User Stories по модулям A–F прошли ✅. Проверены Home, Documents, фильтры, сканирование, завершение, демо‑режим, оффлайн, синхронизация.
- **Ранее найденные проблемы:**
  1. CORS при обращении напрямую к `http://localhost:9000` → решено динамическим `baseURL` (`/MobileSMARTS` через proxy).
  2. Дублирующие роуты DocType → решено `SmartDocumentRouter`.
  3. Несовпадение `docId` из OData и локальных документов → `useDocumentLogic` теперь маппит/создаёт локальные записи при загрузке OData.
- **Автотестов пока нет.** Перед релизом выполняйте: 
  - Проверку всех 6 модулей с реальным API.
  - Загрузку/отправку данных (DataFetcher + `useODataSync`).
  - Вход через OAuth2, tempuid и демо.
  - Переключение тем, кастомные интерфейсы, оффлайн сценарии.
  - Сбор и отправку аналитики (см. Supabase лог). 
- **Известные ограничения:** фотофиксация пока хранит Base64 в IndexedDB (нужна интеграция с сервером), раздел «Статистика» показывает примеры, нет автоматизированных UI/Unit тестов, security hardening (XSS/Rate limit) остаётся задачей сервера.

## 14. Roadmap и открытые задачи
1. **Автоматизированные тесты:** Vitest + Playwright (E2E) для основных сценариев.
2. **Интеграционное тестирование с реальным Mobile SMARTS** (performance, `$batch`).
3. **Виртуализация длинных списков и lazy loading** (особенно `/docs`).
4. **Сохранение фотографий и вложений на сервер** либо через Supabase Storage.
5. **Расширенная статистика:** графики, drill-down, экспорт.
6. **Security hardening:** sanitization, rate limiting, защита API ключей.
7. **Background Sync** (Service Worker) для очереди `syncActions`.
8. **Дополнительные UX‑улучшения:** skeleton loaders, подсказки, мультиязычность.

## 15. Полезные команды и скрипты
| Цель | Команда |
| --- | --- |
| Старт dev‑сервера | `npm run dev` |
| Production build / preview | `npm run build && npm run preview` |
| Загрузка демо‑данных (CLI) | `npm run fetch-data` или `node scripts/fetchServerData.js <url> <output> [user] [pass]` |
| Supabase миграция | `supabase db push` |
| Деплой функции аналитики | `supabase functions deploy analytics-batch` |
| Установка секретов Supabase | `supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...` |

## 16. Поддержка документации
- Этот README — единственный актуальный источник проектной документации. При изменениях архитектуры, API, модулей или процессов обновляйте соответствующие разделы.
- Дополнительные артефакты:
  - OData контракт: `DOCS/$metadata.xml`.
  - Скрипты и вспомогательные утилиты: каталог `scripts/`.
  - Supabase инфраструктура: `supabase/migrations`, `supabase/functions`.
- При необходимости повторного восстановления проекта используйте разделы «Быстрый старт», «API и данные», «Архитектура» как чек‑лист.

_Все остальные файлы в `DOCS/` удалены намеренно. Если требуется историческая информация (спеки, отчёты и т. д.), восстановите её из Git‑истории, но поддерживать в актуальном состоянии следует только данный документ._


