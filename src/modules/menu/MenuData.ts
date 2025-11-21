// === 📁 src/modules/menu/MenuData.ts ===
// Menu structure configuration for Warehouse-15 PWA

import {
  RefreshCw,
  Database,
  Settings,
  Users,
  FileText,
  BarChart3,
  Activity,
  MessageSquare,
  Info,
  LogOut,
  QrCode,
  LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action?: string; // 'navigate' | 'modal' | 'function' | 'trigger'
  actionValue?: string;
  requiresOnline?: boolean;
  children?: MenuItem[];
  isExpanded?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: 'sync',
    label: 'Синхронизировать',
    icon: RefreshCw,
    action: 'function',
    actionValue: 'triggerSync',
    requiresOnline: true,
  },
  {
    id: 'update-refs',
    label: 'Обновить справочники',
    icon: Database,
    action: 'function',
    actionValue: 'updateReferences',
    requiresOnline: true,
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: Settings,
    action: 'navigate',
    actionValue: '/settings',
  },
  {
    id: 'install-interface',
    label: 'Установить интерфейс',
    icon: QrCode,
    action: 'function',
    actionValue: 'installInterface',
  },
  {
    id: 'partner',
    label: 'Напарник',
    icon: Users,
    action: 'navigate',
    actionValue: '/partner',
  },
  {
    id: 'my-documents',
    label: 'Мои документы',
    icon: FileText,
    action: 'navigate',
    actionValue: '/documents',
  },
  {
    id: 'statistics',
    label: 'Статистика и KPI',
    icon: BarChart3,
    action: 'navigate',
    actionValue: '/statistics',
  },
  {
    id: 'diagnostics',
    label: 'Диагностика',
    icon: Activity,
    action: 'navigate',
    actionValue: '/diagnostics',
  },
  {
    id: 'feedback',
    label: 'Обратная связь',
    icon: MessageSquare,
    action: 'navigate',
    actionValue: '/feedback',
  },
  {
    id: 'about',
    label: 'О программе',
    icon: Info,
    action: 'navigate',
    actionValue: '/about',
  },
  {
    id: 'logout',
    label: 'Выйти',
    icon: LogOut,
    action: 'function',
    actionValue: 'logout',
  },
];

// App version and metadata
export const appMetadata = {
  name: 'Склад-15',
  version: '1.0.1',
  build: '2025.10.31',
  vendor: 'Cleverence',
};

