# 🧩 Каталог компонентов

В этом документе описаны все доступные компоненты дизайн-системы, их варианты и примеры использования.

## 📚 Содержание

1. [Base (Базовые)](#base)
   - [Button](#button)
   - [IconButton](#iconbutton)
   - [Badge](#badge)
   - [Chip](#chip)
   - [Avatar](#avatar)
   - [ProgressBar](#progressbar)
   - [Skeleton](#skeleton)
2. [Structure (Структура)](#structure)
   - [Card](#card)
   - [Divider](#divider)
   - [Modal](#modal)
   - [Drawer](#drawer)
3. [Forms (Формы)](#forms)
   - [Input](#input)
   - [TextArea](#textarea)
   - [Select](#select)
   - [Checkbox](#checkbox)
   - [Radio](#radio)
   - [Toggle](#toggle)
4. [Navigation (Навигация)](#navigation)
   - [Tabs](#tabs)
   - [List & ListItem](#list--listitem)
   - [Accordion](#accordion)
5. [Feedback (Обратная связь)](#feedback)
   - [Toast](#toast)
   - [Alert](#alert)
   - [Spinner](#spinner)
   - [Tooltip](#tooltip)

---

## Base

### Button

Основной элемент для действий пользователя.

**Варианты:** `primary`, `secondary`, `ghost`, `danger`  
**Размеры:** `sm`, `md`, `lg`

```tsx
<Button variant="primary">Сохранить</Button>
<Button variant="secondary" startIcon={<Icon />}>Назад</Button>
<Button variant="ghost" disabled>Отмена</Button>
<Button variant="danger" isLoading>Удалить</Button>
```

### IconButton

Кнопка, состоящая только из иконки.

**Варианты:** `default`, `primary`, `ghost`, `danger`

```tsx
<IconButton icon={<Search />} variant="default" />
<IconButton icon={<Bell />} variant="primary" badge={3} />
<IconButton icon={<Trash />} variant="danger" size="lg" />
```

### Badge

Маленький индикатор статуса или количества.

**Варианты:** `neutral`, `primary`, `success`, `warning`, `error`, `info`

```tsx
<Badge label="New" variant="primary" />
<Badge label="Success" variant="success" size="sm" />
<Badge label="99+" variant="error" />
```

### Chip

Интерактивный элемент для фильтров, выбора или тегов.

**Варианты:** `default`, `primary`, `success`, `warning`, `error`

```tsx
<Chip label="Фильтр" onClick={() => {}} />
<Chip label="Активный" active variant="primary" />
<Chip label="Удалить" onDelete={() => {}} />
```

### Avatar

Отображение пользователя или сущности.

**Размеры:** `xs`, `sm`, `md`, `lg`, `xl`

```tsx
<Avatar name="Иван Иванов" size="md" />
<Avatar src="/user.jpg" status="online" />
<Avatar name="Company" variant="square" />
```

### ProgressBar

Индикатор прогресса выполнения задачи.

**Варианты:** `primary`, `success`, `warning`, `error`

```tsx
<ProgressBar value={50} showLabel />
<ProgressBar value={100} variant="success" />
<ProgressBar value={30} size="sm" />
```

### Skeleton

Заглушка для отображения загрузки контента.

**Варианты:** `text`, `circular`, `rectangular`

```tsx
<Skeleton variant="text" width="60%" />
<Skeleton variant="circular" width={40} height={40} />
<SkeletonCard hasImage />
<SkeletonText lines={3} />
```

---

## Structure

### Card

Контейнер для контента.

**Варианты:** `default`, `elevated`, `outlined`, `interactive`

```tsx
<Card>
  <p>Простая карточка</p>
</Card>

<Card variant="elevated" onClick={handleClick}>
  <h3>Интерактивная с тенью</h3>
</Card>
```

### Divider

Разделитель контента.

**Ориентация:** `horizontal`, `vertical`

```tsx
<Divider />
<Divider label="ИЛИ" />
<Divider orientation="vertical" />
```

### Modal

Всплывающее окно, блокирующее взаимодействие с фоном.

**Размеры:** `sm`, `md`, `lg`, `xl`, `full`

```tsx
<Modal isOpen={open} onClose={close} title="Заголовок">
  <p>Контент модального окна</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button onClick={close}>Закрыть</Button>
  </div>
</Modal>
```

### Drawer

Выезжающая панель (справа, слева, снизу).

**Позиция:** `right`, `left`, `bottom`

```tsx
<Drawer isOpen={open} onClose={close} title="Меню" position="right">
  <List>
    <ListItem title="Пункт 1" />
    <ListItem title="Пункт 2" />
  </List>
</Drawer>
```

---

## Forms

### Input

Поле ввода текста.

```tsx
<Input label="Email" placeholder="user@example.com" />
<Input icon={<Search />} fullWidth />
<Input error="Неверный формат" />
```

### TextArea

Многострочное поле ввода.

```tsx
<TextArea label="Комментарий" rows={4} />
```

### Select

Выпадающий список.

```tsx
<Select 
  label="Выберите город"
  options={[
    { value: 'msk', label: 'Москва' },
    { value: 'spb', label: 'Санкт-Петербург' }
  ]}
  value={city}
  onChange={handleChange}
/>
```

### Checkbox

Флажок выбора.

```tsx
<Checkbox label="Согласен с условиями" checked={checked} onChange={toggle} />
```

### Radio

Переключатель (один из многих).

```tsx
<Radio name="delivery" label="Самовывоз" value="pickup" />
<Radio name="delivery" label="Доставка" value="delivery" />
```

### Toggle

Переключатель вкл/выкл.

```tsx
<Toggle label="Уведомления" checked={enabled} onChange={toggle} />
```

---

## Navigation

### Tabs

Вкладки для переключения контента.

**Варианты:** `default`, `pills`, `underline`

```tsx
const tabs = [
  { id: 'tab1', label: 'Главная', icon: <Home /> },
  { id: 'tab2', label: 'Настройки' }
];

<Tabs tabs={tabs} activeTab={active} onChange={setActive} />
```

### List & ListItem

Списки элементов.

```tsx
<List divider>
  <ListItem title="Элемент 1" subtitle="Описание" showChevron />
  <ListItem title="Элемент 2" icon={<User />} />
  <ListItem title="Активный элемент" active />
</List>
```

### Accordion

Раскрывающийся список.

```tsx
<Accordion>
  <AccordionItem title="Раздел 1">
    Контент раздела 1...
  </AccordionItem>
  <AccordionItem title="Раздел 2">
    Контент раздела 2...
  </AccordionItem>
</Accordion>
```

---

## Feedback

### Toast

Всплывающее уведомление.

**Варианты:** `info`, `success`, `warning`, `error`

```tsx
<Toast message="Сохранено!" variant="success" />
```

### Alert

Встроенное уведомление.

**Варианты:** `info`, `success`, `warning`, `error`

```tsx
<Alert variant="warning" title="Внимание">
  Сервер недоступен. Проверьте соединение.
</Alert>
```

### Spinner

Индикатор загрузки.

**Размеры:** `sm`, `md`, `lg`, `xl`

```tsx
<Spinner size="md" />
<Spinner variant="primary" />
```

### Tooltip

Всплывающая подсказка.

**Позиция:** `top`, `bottom`, `left`, `right`

```tsx
<Tooltip content="Дополнительная информация">
  <Icon />
</Tooltip>
```
