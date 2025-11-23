# 🎨 Дизайн-система: Модульные цвета

## Определение в системе

Цвета модулей определены в трёх местах для обеспечения системности:

### 1. Design System DNA (`src/theme/design-system.json`)

```json
{
  "dna": {
    "colors": {
      "modules": {
        "receiving": {
          "bg": "#d1ae00",
          "text": "#4a3b00",
          "light": "#f3d640",
          "dark": "#8a7300"
        },
        "picking": {
          "bg": "#f5ab61",
          "text": "#4d2900",
          "light": "#ffcda3",
          "dark": "#9e5700"
        },
        "shipment": {
          "bg": "#5fad05",
          "text": "#ffffff",
          "light": "#8cce5a",
          "dark": "#1f4d1f"
        },
        "placement": {
          "bg": "#86e0cb",
          "text": "#154038",
          "light": "#b3f0e3",
          "dark": "#1f5a4f"
        },
        "inventory": {
          "bg": "#fb9898",
          "text": "#4d1a1a",
          "light": "#fcd0d0",
          "dark": "#a33030"
        },
        "return": {
          "bg": "#e35454",
          "text": "#ffffff",
          "light": "#fb9898",
          "dark": "#4d2827"
        }
      }
    }
  }
}
```

### 2. CSS Variables (`src/index.css`)

```css
:root {
  /* Module colors */
  --color-module-receiving-bg: #d1ae00;
  --color-module-receiving-text: #4a3b00;
  --color-module-picking-bg: #f5ab61;
  --color-module-picking-text: #4d2900;
  --color-module-shipment-bg: #5fad05;
  --color-module-shipment-text: #ffffff;
  --color-module-placement-bg: #86e0cb;
  --color-module-placement-text: #154038;
  --color-module-inventory-bg: #fb9898;
  --color-module-inventory-text: #4d1a1a;
  --color-module-return-bg: #e35454;
  --color-module-return-text: #ffffff;
}
```

### 3. Tailwind Config (`tailwind.config.js`)

```js
colors: {
  'module-receiving-bg': 'var(--color-module-receiving-bg)',
  'module-receiving-text': 'var(--color-module-receiving-text)',
  'module-picking-bg': 'var(--color-module-picking-bg)',
  'module-picking-text': 'var(--color-module-picking-text)',
  'module-shipment-bg': 'var(--color-module-shipment-bg)',
  'module-shipment-text': 'var(--color-module-shipment-text)',
  // ... и т.д.
}
```

## Использование

### В React компонентах (рекомендуемый способ)

```tsx
<button className="bg-module-receiving-bg text-module-receiving-text">
  Приход
</button>
```

### В CSS/SCSS

```css
.module-tile {
  background-color: var(--color-module-receiving-bg);
  color: var(--color-module-receiving-text);
}
```

### Inline стили (альтернативный способ)

```tsx
<div style={{ 
  backgroundColor: 'var(--color-module-receiving-bg)', 
  color: 'var(--color-module-receiving-text)' 
}}>
  Приход
</div>
```

## Цветовая палитра модулей

| Модуль | Фон | Текст | Описание |
|--------|-----|-------|----------|
| **Приход** (receiving) | `#d1ae00` | `#4a3b00` | Горчично-желтый |
| **Подбор** (picking) | `#f5ab61` | `#4d2900` | Песочно-оранжевый |
| **Отгрузка** (shipment) | `#5fad05` | `#ffffff` | Яркий зеленый |
| **Размещение** (placement) | `#86e0cb` | `#154038` | Мятный |
| **Инвентаризация** (inventory) | `#fb9898` | `#4d1a1a` | Светло-красный |
| **Возврат** (return) | `#e35454` | `#ffffff` | Красный |

## Обновление цветов

Для изменения цвета модуля:

1. Обновите `src/theme/design-system.json`
2. Обновите соответствующую CSS-переменную в `src/index.css`
3. Перезапустите dev-сервер для применения изменений Tailwind

**Примечание:** CSS-переменные обновляются автоматически (HMR), но изменения в `tailwind.config.js` требуют полного перезапуска сервера.

