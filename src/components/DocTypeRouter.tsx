import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Receiving from '@/pages/Receiving';
import Placement from '@/pages/Placement';
import Picking from '@/pages/Picking';
import Shipment from '@/pages/Shipment';
import Return from '@/pages/Return';
import Inventory from '@/pages/Inventory';

/**
 * Роутер типов документов для универсального маршрута /docs/:docTypeUni/:docId?
 * Маппит OData типы на соответствующие интерактивные компоненты
 */
const DOC_TYPE_COMPONENTS: Record<string, React.ComponentType> = {
  // OData Type → React Component
  'PrihodNaSklad': Receiving,
  'RazmeshhenieVYachejki': Placement,
  'PodborZakaza': Picking,
  'Otgruzka': Shipment,
  'Vozvrat': Return,
  'Inventarizaciya': Inventory,
};

/**
 * Маппинг для fallback на legacy маршруты
 * Если компонент для типа не найден, перенаправляем на старый маршрут
 */
const LEGACY_ROUTE_MAP: Record<string, string> = {
  'PrihodNaSklad': '/receiving',
  'RazmeshhenieVYachejki': '/placement',
  'PodborZakaza': '/picking',
  'Otgruzka': '/shipment',
  'Vozvrat': '/return',
  'Inventarizaciya': '/inventory',
};

export const DocTypeRouter: React.FC = () => {
  const { docTypeUni, docId } = useParams<{ docTypeUni: string; docId?: string }>();

  if (!docTypeUni) {
    return <Navigate to="/" replace />;
  }

  // Получаем компонент для данного типа
  const Component = DOC_TYPE_COMPONENTS[docTypeUni];

  if (Component) {
    // Рендерим соответствующий компонент
    // docId будет доступен через useParams внутри компонента
    return <Component />;
  }

  // Если компонент не найден, перенаправляем на legacy маршрут или home
  const legacyRoute = LEGACY_ROUTE_MAP[docTypeUni];
  if (legacyRoute) {
    const fullRoute = docId ? `${legacyRoute}/${docId}` : legacyRoute;
    return <Navigate to={fullRoute} replace />;
  }

  // Тип документа не поддерживается
  console.warn(`Unsupported document type: ${docTypeUni}`);
  return <Navigate to="/" replace />;
};



