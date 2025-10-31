# 🍔 Hamburger Menu Module

Профессиональное адаптивное гамбургер-меню для PWA "Склад-15".

## 🚀 Быстрый старт

```tsx
import { MenuProvider, useMenu, HamburgerMenu } from '@/modules/menu';

// 1. Оберните приложение в MenuProvider
<MenuProvider>
  <App />
</MenuProvider>

// 2. Добавьте HamburgerMenu в Layout
<Layout>
  <HamburgerMenu 
    onSync={handleSync}
    onUpdateReferences={handleUpdate}
    onLogout={handleLogout}
  />
</Layout>

// 3. Используйте useMenu в компонентах
function MyButton() {
  const { openMenu } = useMenu();
  return <button onClick={openMenu}>☰</button>;
}
```

## 📦 Компоненты

### HamburgerMenu
Основной компонент меню с анимациями и overlay.

**Props:**
- `onSync?: () => void` - callback для синхронизации
- `onUpdateReferences?: () => void` - callback обновления справочников
- `onLogout?: () => void` - callback выхода

### MenuItem
Универсальный элемент меню с поддержкой подменю.

**Props:**
- `item: MenuItemType` - конфигурация пункта
- `isOnline: boolean` - статус онлайн
- `onAction: (action, value) => void` - обработчик действий
- `level?: number` - уровень вложенности

### MenuOverlay
Затемнение фона при открытом меню.

**Props:**
- `isOpen: boolean` - статус открытия
- `onClose: () => void` - callback закрытия

### MenuProvider
Context provider для состояния меню.

**Props:**
- `children: ReactNode` - дочерние элементы

## 🎣 Hooks

### useMenu()
Хук доступа к состоянию меню.

**Возвращает:**
```typescript
{
  isOpen: boolean;           // Открыто ли меню
  openMenu: () => void;      // Открыть меню
  closeMenu: () => void;     // Закрыть меню
  toggleMenu: () => void;    // Переключить состояние
  expandedItems: Set<string>; // Раскрытые подменю
  toggleExpand: (id: string) => void; // Переключить подменю
}
```

**Пример:**
```tsx
const { isOpen, openMenu, closeMenu } = useMenu();
```

## 📋 Конфигурация меню

Редактируйте `MenuData.ts` для изменения структуры меню:

```typescript
export const menuItems: MenuItem[] = [
  {
    id: 'my-item',
    label: 'Мой пункт',
    icon: Star,
    action: 'navigate',
    actionValue: '/my-page',
    requiresOnline: false,
    children: [/* подменю */],
  },
];
```

### Типы действий (action):
- `navigate` - навигация на страницу
- `function` - вызов callback функции
- `modal` - открытие модального окна
- `expand` - раскрытие подменю

## 🎨 Стилизация

Меню использует Tailwind CSS и поддерживает:
- Темная тема по умолчанию
- Адаптивная ширина (85vw, max 400px)
- Крупные интерактивные зоны (64px)
- Backdrop blur эффект
- Hardware-accelerated анимации

### Кастомизация цветов:
```tsx
// В HamburgerMenu.tsx измените:
className="bg-gray-900/95"  // Фон меню
className="text-gray-100"   // Текст
className="text-blue-400"   // Иконки
```

## 🔧 API

### MenuProvider
```tsx
<MenuProvider>
  {children}
</MenuProvider>
```

### HamburgerMenu
```tsx
<HamburgerMenu 
  onSync={() => console.log('Sync')}
  onUpdateReferences={() => console.log('Update')}
  onLogout={() => console.log('Logout')}
/>
```

### useMenu
```tsx
const menu = useMenu();
menu.openMenu();
menu.closeMenu();
menu.toggleMenu();
console.log(menu.isOpen);
```

## ⌨️ Горячие клавиши

- `Escape` - закрыть меню
- Свайп влево - закрыть меню
- Свайп вправо - открыть меню (от края)

## 📱 Особенности для мобильных

- Touch-optimized (64px мин. размер)
- Swipeable (react-swipeable)
- Haptic feedback (виброотклик)
- Prevent body scroll при открытом меню
- Backdrop blur для контекста

## 🌐 Оффлайн поддержка

Меню автоматически:
- Отображает статус онлайн/оффлайн
- Отключает пункты с `requiresOnline: true`
- Показывает серым цветом недоступные функции
- Хранит состояние в React Context

## 🐛 Troubleshooting

### Меню не открывается
Проверьте что `MenuProvider` обернут вокруг всего приложения:
```tsx
<MenuProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</MenuProvider>
```

### Ошибка "useMenu must be used within MenuProvider"
Убедитесь что компонент находится внутри `<MenuProvider>`.

### Свайпы не работают
- Проверьте что `react-swipeable` установлен
- Эмулируйте touch в DevTools
- Используйте реальное устройство для тестирования

## 📚 Дополнительно

См. также:
- [HAMBURGER_MENU_GUIDE.md](../../../HAMBURGER_MENU_GUIDE.md) - полное руководство
- [MENU_IMPLEMENTATION_SUMMARY.md](../../../MENU_IMPLEMENTATION_SUMMARY.md) - итоги
- `__tests__/menu.test.example.tsx` - примеры использования

## 📄 Лицензия

Часть проекта "Склад-15" © Cleverence 2025

