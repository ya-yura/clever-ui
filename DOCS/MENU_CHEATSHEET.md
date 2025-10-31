# 🚀 Гамбургер-меню — Шпаргалка для разработчиков

## 📦 Импорты

```typescript
// Основные компоненты
import { 
  HamburgerMenu,     // Главный компонент меню
  MenuProvider,      // Context provider
  useMenu            // Hook для управления
} from '@/modules/menu';

// Типы
import type { MenuItem } from '@/modules/menu';
```

---

## 🎯 Быстрые примеры

### Открыть меню
```tsx
const { openMenu } = useMenu();
<button onClick={openMenu}>Открыть</button>
```

### Закрыть меню
```tsx
const { closeMenu } = useMenu();
<button onClick={closeMenu}>Закрыть</button>
```

### Переключить состояние
```tsx
const { toggleMenu } = useMenu();
<button onClick={toggleMenu}>☰</button>
```

### Проверить статус
```tsx
const { isOpen } = useMenu();
{isOpen && <div>Меню открыто!</div>}
```

---

## 🔧 Добавить пункт меню

**Файл:** `src/modules/menu/MenuData.ts`

```typescript
// 1. Импортируйте иконку
import { Star } from 'lucide-react';

// 2. Добавьте в массив menuItems
{
  id: 'my-feature',           // Уникальный ID
  label: 'Моя функция',       // Текст
  icon: Star,                 // Иконка
  action: 'navigate',         // Тип действия
  actionValue: '/my-path',    // Значение
  requiresOnline: false,      // Требует интернет?
}
```

---

## 📋 Типы действий (action)

| Action | Описание | actionValue |
|--------|----------|-------------|
| `navigate` | Переход на страницу | Путь роута `/path` |
| `function` | Вызов callback | Имя функции `'myFunc'` |
| `modal` | Открыть модалку | ID модалки `'settings'` |
| `expand` | Раскрыть подменю | — |

---

## 🎨 Подменю

```typescript
{
  id: 'settings',
  label: 'Настройки',
  icon: Settings,
  action: 'expand',
  children: [
    {
      id: 'settings-1',
      label: 'Подпункт 1',
      icon: Wifi,
      action: 'modal',
      actionValue: 'connection',
    },
    // ... больше подпунктов
  ]
}
```

---

## 🎣 useMenu() API

```typescript
interface MenuContextType {
  isOpen: boolean;                      // Статус
  openMenu: () => void;                 // Открыть
  closeMenu: () => void;                // Закрыть
  toggleMenu: () => void;               // Переключить
  expandedItems: Set<string>;           // Раскрытые
  toggleExpand: (id: string) => void;   // Переключить раскрытие
}
```

**Пример:**
```tsx
const menu = useMenu();

// Открыть через 2 секунды
setTimeout(() => menu.openMenu(), 2000);

// Проверить статус
if (menu.isOpen) {
  console.log('Открыто!');
}
```

---

## 🔌 Интеграция callback'ов

**Файл:** `src/components/Layout.tsx`

```tsx
import { useSync } from '@/hooks/useSync';
import { useReferences } from '@/hooks/useReferences';

const Layout = () => {
  // 1. Создайте хуки
  const { sync } = useSync({ /*...*/ });
  const { updateReferences } = useReferences();

  // 2. Передайте в меню
  return (
    <HamburgerMenu 
      onSync={sync}
      onUpdateReferences={updateReferences}
      onLogout={() => console.log('Logout')}
    />
  );
};
```

---

## 🎨 Кастомизация стилей

### Изменить цвет фона
```tsx
// src/modules/menu/HamburgerMenu.tsx
className="bg-gray-900/95"  →  className="bg-blue-900/95"
```

### Изменить ширину
```tsx
className="w-[85vw] max-w-[400px]"  →  className="w-[90vw] max-w-[500px]"
```

### Изменить цвет иконок
```tsx
// src/modules/menu/MenuItem.tsx
className="text-blue-400"  →  className="text-green-400"
```

---

## ⌨️ Горячие клавиши

```tsx
// Автоматически поддерживаются:
ESC           → Закрыть меню
Свайп влево   → Закрыть меню
Клик на overlay → Закрыть меню

// Добавить свои:
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'm' && e.ctrlKey) {
      toggleMenu();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

---

## 🌐 Проверка онлайн/оффлайн

```tsx
// Автоматически в меню
const [isOnline, setIsOnline] = useState(navigator.onLine);

// Слушатели событий
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

---

## 🔔 Виброотклик

```tsx
// Автоматически включен в MenuItem
if ('vibrate' in navigator) {
  navigator.vibrate(50);  // 50ms вибрация
}

// Отключить:
// Удалите строки с navigator.vibrate() в MenuItem.tsx
```

---

## 📱 Свайпы

```tsx
// Автоматически настроены в HamburgerMenu
const swipeHandlers = useSwipeable({
  onSwipedLeft: closeMenu,   // Свайп влево = закрыть
  trackMouse: false,          // Только touch
  trackTouch: true,
  delta: 50,                  // Минимальная дистанция
});

// Применить на другой элемент:
<div {...swipeHandlers}>
  Свайпни меня
</div>
```

---

## 🧪 Отладка

### Консольные команды
```javascript
// Откройте консоль браузера (F12)

// Найти кнопку меню
document.querySelector('[aria-label="Открыть меню"]')?.click();

// Проверить статус онлайн
console.log('Online:', navigator.onLine);

// Проверить вибрацию
navigator.vibrate([50, 100, 50]);

// Имитировать оффлайн
// DevTools → Network → Offline
```

### React DevTools
```
Components → MenuProvider → hooks:
  ├─ isOpen: true/false
  ├─ expandedItems: Set(0)
  └─ ... другие состояния
```

---

## 🚨 Частые ошибки

### ❌ Error: useMenu must be used within MenuProvider
```tsx
// ❌ НЕПРАВИЛЬНО
<App>
  <MyComponent />  {/* useMenu() здесь не работает */}
</App>

// ✅ ПРАВИЛЬНО
<MenuProvider>
  <App>
    <MyComponent />  {/* Теперь работает! */}
  </App>
</MenuProvider>
```

### ❌ Меню не закрывается
```tsx
// Проверьте что overlay имеет onClick={closeMenu}
<MenuOverlay isOpen={isOpen} onClose={closeMenu} />
```

### ❌ Свайпы не работают
```bash
# Убедитесь что установлен пакет
npm list react-swipeable

# Переустановите если нужно
npm install react-swipeable
```

---

## 📊 Производительность

### Оптимизация MenuItem
```tsx
// Используйте React.memo
export default React.memo(MenuItem);

// Используйте useCallback
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### Lazy loading иконок
```tsx
// Вместо:
import { Star, Settings, User } from 'lucide-react';

// Используйте:
const Star = lazy(() => import('lucide-react/dist/esm/icons/star'));
```

---

## 🎯 Полезные ссылки

- **Lucide Icons**: https://lucide.dev/icons
- **Framer Motion**: https://www.framer.com/motion
- **React Swipeable**: https://github.com/FormidableLabs/react-swipeable
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🔥 Pro Tips

1. **Анимация иконки ☰ → ✕**
   ```tsx
   <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>☰</motion.div>
   ```

2. **Запретить скролл body**
   ```tsx
   // Уже реализовано в useMenu
   document.body.style.overflow = isOpen ? 'hidden' : '';
   ```

3. **Индикатор непрочитанных**
   ```tsx
   <Badge count={5}>
     <MenuItem item={item} />
   </Badge>
   ```

4. **Поиск по меню**
   ```tsx
   const filtered = menuItems.filter(item => 
     item.label.toLowerCase().includes(search.toLowerCase())
   );
   ```

---

## ✅ Чек-лист перед деплоем

- [ ] MenuProvider обернут вокруг App
- [ ] useMenu() используется в компонентах
- [ ] HamburgerMenu добавлен в Layout
- [ ] Callback'и подключены (onSync, onLogout)
- [ ] Пункты меню настроены в MenuData.ts
- [ ] Тестирование на мобильном
- [ ] Проверка оффлайн режима
- [ ] Lint errors исправлены
- [ ] Документация обновлена

---

**Шпаргалка v1.0 | 31.10.2025**  
**Проект**: Склад-15 PWA  
**Автор**: AI Engineer

