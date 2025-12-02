# Cleverence Склад‑15 PWA

> Progressive Web App прототип мобильного клиента Cleverence для работы с документами Mobile SMARTS. Приложение полностью охватывает складские операции (приёмка, размещение, подбор, отгрузка, возврат/списание, инвентаризация) и работает в режиме offline‑first.

## Основные возможности
- **6 интерактивных модулей** с поддержкой сканера, undo и проверок прогресса.
- **SmartDocumentRouter** — единая логика перехода между табличными и интерактивными представлениями документов.
- **IndexedDB + Dexie** — оффлайн‑хранилище документов, очереди синхронизации и логов.
- **Analytics + Supabase Edge Function** — сбор событий пользователя, API/ошибок и отправка пачек.
- **Кастомные интерфейсы** из Creator (JSON‑схема, установка через файл/QR/текст, автоматический маппинг цветов по типам документов).
- **Дизайн‑система** с 25+ компонентов, семантическими токенами и поддержкой dark/light тем.

## Быстрый старт
```bash
npm install              # Установка зависимостей
npm run dev              # Dev-сервер (http://localhost:5173)
npm run build            # Production сборка
yarn run preview         # Проверка dist
```
1. Запустите `npm run dev` и откройте `/setup` — укажите URL сервера Mobile SMARTS (обычно `http://localhost:9000/MobileSMARTS/api/v1`).
2. Пройдите проверку соединения, сохраните настройки и авторизуйтесь на `/login` (OAuth2, `?tempuid=` или демо‑режим).
3. Для демо-режима загрузите JSON в `src/data/demo/` через страницу **Загрузка данных** или скрипт `scripts/fetchServerData.*`.

## Архитектура
| Каталог/файл | Описание |
| --- | --- |
| `src/pages/*` | Экранные модули (Receiving, Placement, Picking, Shipment, Return, Inventory, Documents, Settings и др.). |
| `src/components/*` | Переиспользуемые блоки (`LineCard`, `DocumentListFilter`, `RouteVisualization`, `InterfaceInstaller`, `SmartDocumentRouter`). |
| `src/lib/analytics.ts` | Класс `Analytics` + React-хуки для событий, буферизации и отправки на Supabase. |
| `src/services/*` | API, конфиг, работа с OData, демо-данные, счётчики документов, IndexedDB (`db.ts`). |
| `src/hooks/*` | `useDocumentLogic`, `useScanner`, `useOfflineStorage`, `useSync`, `useODataSync`, `useAnalytics`. |
| `src/design/*` | Токены и дизайн-система (Tailwind + компоненты). |
| `scripts/` | CLI-утилиты (выгрузка Mobile SMARTS, анализ токенов/цветов). |
| `supabase/` | Миграции и Edge Function `analytics-batch`. |

## Документация
Подробная, актуальная документация перенесена в `DOCS/README.md`. Именно там описаны все модули, API, процесс настройки и roadmap. Любые дополнительные инструкции или отчёты следует добавлять исключительно в этот файл.

## Лицензия
Лицензирование не указано — уточните требования компании или добавьте нужный LICENSE.


