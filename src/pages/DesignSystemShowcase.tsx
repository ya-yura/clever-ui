import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Bell, 
  Check, 
  ChevronRight, 
  MoreHorizontal,
  Settings,
  Home,
  Sun,
  Moon,
  Mail,
  User,
  FileText,
  Edit2,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Info as InfoIcon,
  Menu,
  List as ListIcon,
  CreditCard,
  UploadCloud,
  Download,
  Filter
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Import ALL components from Design System
import {
  Button,
  IconButton,
  Card,
  Badge,
  Chip,
  Avatar,
  ProgressBar,
  Input,
  TextArea,
  Checkbox,
  Radio,
  Toggle,
  Select,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Spinner,
  Tabs,
  List,
  ListItem,
  Accordion,
  AccordionItem,
  Divider,
  Modal,
  Drawer,
  Toast,
  Alert,
  Tooltip,
} from '@/design/components';

const DesignSystemShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectValue, setSelectValue] = useState('option1');
  const [radioValue, setRadioValue] = useState('1');

  const tabs = [
    { id: 'home', label: 'Главная', icon: <Home size={16} /> },
    { id: 'docs', label: 'Документы', icon: <FileText size={16} />, badge: 3 },
    { id: 'settings', label: 'Настройки', icon: <Settings size={16} /> },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2' },
    { value: 'option3', label: 'Опция 3' },
  ];

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-4 md:p-8 pb-32 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-surface-tertiary gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-content-primary mb-2 tracking-tight">Дизайн-система v2.0</h1>
            <p className="text-content-secondary text-lg">Cleverence Склад Mobile • 25 компонентов</p>
          </div>
          <div className="flex gap-3">
            <Tooltip content={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
              <IconButton 
                icon={theme === 'dark' ? <Sun /> : <Moon />}
              variant="ghost" 
              onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Переключить на светлую' : 'Переключить на тёмную'}
              />
            </Tooltip>
            <Button variant="secondary" onClick={() => navigate('/')} startIcon={<Home size={18} />}>
              На главную
            </Button>
          </div>
        </header>

        {/* 1. Кнопки */}
        <section className="space-y-6">
          <SectionHeader title="01. Кнопки и Действия" description="Основные элементы взаимодействия" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Кнопки (Buttons)</h4>
              
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary">Основная</Button>
                <Button variant="secondary">Вторичная</Button>
                <Button variant="ghost">Призрачная</Button>
                <Button variant="danger">Опасная</Button>
            </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary" startIcon={<Check size={18} />}>Сохранить</Button>
                <Button variant="secondary" endIcon={<ChevronRight size={18} />}>Далее</Button>
                <Button variant="primary" isLoading>Загрузка</Button>
                <Button variant="primary" disabled>Недоступна</Button>
            </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Мелкая</Button>
                <Button size="md">Средняя</Button>
                <Button size="lg">Крупная</Button>
              </div>
            </Card>

            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Иконки (IconButtons)</h4>
              
              <div className="flex flex-wrap gap-4 items-center">
                <IconButton icon={<Search />} variant="default" />
                <IconButton icon={<Bell />} variant="primary" badge={5} />
                <IconButton icon={<Settings />} variant="ghost" />
                <IconButton icon={<Trash2 />} variant="danger" />
            </div>

              <div className="flex flex-wrap gap-4 items-center">
                <IconButton icon={<Filter />} size="sm" variant="secondary" />
                <IconButton icon={<Filter />} size="md" variant="secondary" />
                <IconButton icon={<Filter />} size="lg" variant="secondary" />
              </div>
            </Card>
          </div>
        </section>

        {/* 2. Ввод данных */}
        <section className="space-y-6">
          <SectionHeader title="02. Ввод данных" description="Поля, переключатели и выбор" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Text Inputs */}
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Текстовые поля</h4>
              
              <Input 
                label="Электронная почта"
                type="email" 
                placeholder="user@company.com"
                icon={<Mail size={18} />}
                fullWidth
              />

              <Input 
                label="Пароль"
                type="password" 
                placeholder="••••••••"
                fullWidth
              />

              <TextArea 
                label="Комментарий"
                placeholder="Введите дополнительную информацию..."
                fullWidth
              />

              <Select 
                label="Роль пользователя"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                fullWidth
              />
            </Card>

            {/* Selection Controls */}
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Выбор и переключение</h4>

              <div className="space-y-4">
                <Checkbox 
                  label="Я согласен с условиями"
                  checked={checkboxState}
                  onChange={(e) => setCheckboxState(e.target.checked)}
                />

                <Checkbox 
                  label="Запомнить меня"
                  checked={false}
                  onChange={() => {}}
                />
              </div>

              <Divider />

              <div className="space-y-4">
                <Radio 
                  name="delivery"
                  label="Самовывоз"
                  description="Забрать со склада самостоятельно"
                  checked={radioValue === '1'}
                  onChange={() => setRadioValue('1')}
                />
                <Radio 
                  name="delivery"
                  label="Доставка"
                  description="Курьерская доставка до двери"
                  checked={radioValue === '2'}
                  onChange={() => setRadioValue('2')}
                />
              </div>

              <Divider />

              <div className="space-y-4">
                <Toggle 
                  label="Уведомления"
                  checked={toggleState}
                  onChange={(e) => setToggleState(e.target.checked)}
                />
                <Toggle 
                  label="Тёмная тема"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* 3. Навигация и Структура */}
        <section className="space-y-6">
          <SectionHeader title="03. Навигация и Структура" description="Табы, списки, аккордеоны" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Вкладки (Tabs)</h4>
              
              <div className="space-y-6">
                <Tabs 
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  variant="default"
                  fullWidth
                />
                <Tabs 
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  variant="pills"
                  fullWidth
                />
                <Tabs 
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  variant="underline"
                  fullWidth
                />
              </div>
            </Card>

            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Аккордеон (Accordion)</h4>
              
              <Accordion>
                <AccordionItem title="Информация о товаре" defaultOpen>
                  <p className="mb-2">Здесь находится детальная информация о товаре, его характеристиках и особенностях хранения.</p>
                  <Badge label="Хрупкое" variant="warning" size="sm" />
                </AccordionItem>
                <AccordionItem title="История перемещений">
                  <List compact>
                    <ListItem title="Приёмка" subtitle="10.10.2025 14:30" />
                    <ListItem title="Размещение" subtitle="10.10.2025 15:45" />
                  </List>
                </AccordionItem>
                <AccordionItem title="Документация" disabled>
                  Контент недоступен
                </AccordionItem>
              </Accordion>
              </Card>
          </div>

          <Card>
            <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Списки (Lists)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <List divider>
                <ListItem 
                  title="Накладная №12345" 
                  subtitle="ООО 'Поставщик' • 12 позиций"
                  icon={<FileText size={20} />}
                  showChevron
                />
                <ListItem 
                  title="Заказ на отгрузку №889" 
                  subtitle="ИП Иванов • Срочно"
                  icon={<CreditCard size={20} />}
                  showChevron
                />
                <ListItem 
                  title="Инвентаризация #4" 
                  subtitle="Зона А • В процессе"
                  icon={<ListIcon size={20} />}
                  showChevron
                  active
                />
              </List>
              <List>
                <ListItem 
                  title="Скачать отчет" 
                  icon={<Download size={20} />}
                  endIcon={<Badge label="PDF" size="sm" />}
                />
                <ListItem 
                  title="Загрузить данные" 
                  icon={<UploadCloud size={20} />}
                />
                <ListItem 
                  title="Синхронизация" 
                  icon={<AlertCircle size={20} className="text-warning" />}
                  endIcon={<Switch size="sm" checked readOnly />}
                />
              </List>
            </div>
            </Card>
        </section>

        {/* 4. Обратная связь */}
        <section className="space-y-6">
          <SectionHeader title="04. Обратная связь" description="Уведомления, модальные окна, загрузка" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Уведомления (Alerts)</h4>
              
              <div className="space-y-3">
                <Alert variant="info" title="Информация">
                  Новая версия приложения доступна для загрузки.
                </Alert>
                <Alert variant="success" onClose={() => {}}>
                  Документ успешно сохранен и отправлен на сервер.
                </Alert>
                <Alert variant="warning">
                  Внимание: потеряно соединение с сервером.
                </Alert>
                <Alert variant="error" title="Ошибка">
                  Не удалось сканировать штрихкод. Попробуйте снова.
                </Alert>
              </div>
            </Card>

            <Card className="space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-2">Индикаторы и Оверлеи</h4>
              
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" variant="secondary" />
                <Spinner size="xl" />
                </div>

              <Divider />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button onClick={() => setIsModalOpen(true)} fullWidth>
                  Открыть Модальное окно
                </Button>
                <Button variant="secondary" onClick={() => setIsDrawerOpen(true)} fullWidth>
                  Открыть Панель (Drawer)
                </Button>
                <Button variant="ghost" onClick={() => setShowToast(true)} fullWidth className="col-span-2">
                  Показать всплывающее уведомление
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. Элементы интерфейса */}
        <section className="space-y-6">
          <SectionHeader title="05. Элементы интерфейса" description="Бейджи, аватары, карточки" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Бейджи</h4>
              <div className="flex flex-wrap gap-2">
                <Badge label="Успех" variant="success" />
                <Badge label="Внимание" variant="warning" />
                <Badge label="Ошибка" variant="error" />
                <Badge label="Инфо" variant="info" />
                <Badge label="Нейтральный" variant="neutral" />
              </div>
            </Card>

            <Card className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Чипы</h4>
              <div className="flex flex-wrap gap-2">
                <Chip label="Фильтр" />
                <Chip label="Активный" active />
                <Chip label="Удаляемый" active icon={<X size={14} />} />
            </div>
            </Card>

            <Card className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Аватары</h4>
              <div className="flex items-center gap-2">
                <Avatar size="sm" name="Иван И." />
                <Avatar size="md" name="Петр П." status="online" />
                <Avatar size="lg" src="https://i.pravatar.cc/150?u=3" name="Анна С." />
              </div>
            </Card>
            </div>
            
          <Card>
            <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Скелетоны (Загрузка)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <SkeletonText lines={3} />
                <div className="flex gap-4 items-center">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <SkeletonCard hasImage />
              </div>
            </div>
          </Card>
        </section>

        {/* 6. Цвета и Типографика */}
        <section className="space-y-6">
          <SectionHeader title="06. Цвета и Типографика" description="Основа визуального стиля" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="Primary" hex="#daa420" bg="bg-brand-primary" text="text-brand-primaryDark" />
            <ColorCard name="Secondary" hex="#86e0cb" bg="bg-brand-secondary" text="text-brand-secondaryDark" />
            <ColorCard name="Success" hex="#91ed91" bg="bg-status-success" text="text-status-successDark" />
            <ColorCard name="Error" hex="#ba8f8e" bg="bg-status-error" text="text-status-errorDark" />
          </div>

          <Card noPadding className="p-6 overflow-hidden">
            <TypeSpecimen size="text-3xl" label="H1 Заголовок" weight="font-bold" sizeLabel="36px" />
            <TypeSpecimen size="text-2xl" label="H2 Заголовок" weight="font-bold" sizeLabel="32px" />
            <TypeSpecimen size="text-xl" label="H3 Заголовок" weight="font-bold" sizeLabel="24px" />
            <TypeSpecimen size="text-base" label="Основной текст" weight="font-normal" sizeLabel="16px" />
            <TypeSpecimen size="text-sm" label="Мелкий текст" weight="font-normal" sizeLabel="12px" />
          </Card>
        </section>

      </div>

      {/* Modal Demo */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Подтверждение действия"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-content-secondary">
            Вы уверены, что хотите выполнить это действие? Это демонстрационное модальное окно.
          </p>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Подтвердить
          </Button>
        </div>
      </Modal>

      {/* Drawer Demo */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Фильтры поиска"
      >
        <div className="space-y-6">
          <Input label="Поиск по названию" placeholder="Введите текст..." fullWidth />
          
          <div>
            <h5 className="text-sm font-medium mb-3">Категория</h5>
            <div className="flex flex-wrap gap-2">
              <Chip label="Все" active />
              <Chip label="Электроника" />
              <Chip label="Одежда" />
              <Chip label="Продукты" />
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium mb-3">Статус</h5>
            <div className="space-y-2">
              <Checkbox label="В наличии" checked onChange={() => {}} />
              <Checkbox label="Под заказ" checked={false} onChange={() => {}} />
              <Checkbox label="Снят с производства" checked={false} onChange={() => {}} />
            </div>
          </div>

          <div className="pt-4">
            <Button fullWidth variant="primary" onClick={() => setIsDrawerOpen(false)}>
              Применить фильтры
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Toast Demo */}
      {showToast && (
        <Toast 
          message="Операция успешно выполнена!"
          variant="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

/* --- Helper Components --- */

const Switch = ({ size = 'md', checked, readOnly }: any) => (
  <div className={`
    w-10 h-6 rounded-full relative transition-colors
    ${checked ? 'bg-brand-primary' : 'bg-surface-tertiary'}
  `}>
    <div className={`
      absolute top-1 left-1 bg-white rounded-full w-4 h-4 transition-transform
      ${checked ? 'translate-x-4' : ''}
    `} />
  </div>
);

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="border-l-4 border-brand-primary pl-4">
    <h2 className="text-2xl font-bold text-content-primary">{title}</h2>
    <p className="text-content-secondary">{description}</p>
  </div>
);

const ColorCard = ({ name, hex, bg, text = "text-content-primary" }: { name: string, hex: string, bg: string, text?: string }) => (
  <div className={`${bg} ${text} p-4 rounded-lg flex flex-col justify-between h-24 shadow-sm border border-black/5`}>
    <span className="font-bold text-sm">{name}</span>
    <span className="font-mono text-xs opacity-80 uppercase">{hex}</span>
  </div>
);

const TypeSpecimen = ({ size, label, weight, sizeLabel }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-surface-tertiary pb-4 last:border-0 last:pb-0 mb-4 last:mb-0">
    <div className={`${size} ${weight} text-content-primary mb-2 md:mb-0`}>
      Съешь ещё этих мягких французских булок, да выпей чаю
    </div>
    <div className="text-xs font-mono text-content-tertiary flex gap-4 shrink-0">
      <span className="font-bold">{label}</span>
      <span>{sizeLabel}</span>
      <span className="opacity-50">{weight}</span>
    </div>
  </div>
);

export default DesignSystemShowcase;
