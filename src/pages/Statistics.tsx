// === 📁 src/pages/Statistics.tsx ===
// Statistics and KPI page

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/services/db';

interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const Statistics: React.FC = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Load data from IndexedDB
      const receiving = await db.receivingDocuments.count();
      const placement = await db.placementDocuments.count();
      const picking = await db.pickingDocuments.count();
      const shipment = await db.shipmentDocuments.count();

      // Calculate KPIs
      const stats: KPI[] = [
        {
          id: 'receiving',
          label: 'Приемка документов',
          value: receiving,
          unit: 'док.',
          trend: 'up',
          icon: Package,
          color: 'bg-blue-500',
        },
        {
          id: 'placement',
          label: 'Размещено',
          value: placement,
          unit: 'док.',
          trend: 'up',
          icon: CheckCircle,
          color: 'bg-green-500',
        },
        {
          id: 'picking',
          label: 'Подобрано',
          value: picking,
          unit: 'док.',
          trend: 'stable',
          icon: BarChart3,
          color: 'bg-yellow-500',
        },
        {
          id: 'shipment',
          label: 'Отгружено',
          value: shipment,
          unit: 'док.',
          trend: 'down',
          icon: TrendingUp,
          color: 'bg-purple-500',
        },
        {
          id: 'avgTime',
          label: 'Среднее время',
          value: 45,
          unit: 'мин',
          trend: 'down',
          icon: Clock,
          color: 'bg-orange-500',
        },
        {
          id: 'errors',
          label: 'Ошибок',
          value: 3,
          unit: 'шт.',
          trend: 'up',
          icon: AlertCircle,
          color: 'bg-red-500',
        },
      ];

      setKpis(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#e3e3dd] mb-2">📊 Статистика и KPI</h1>
        <p className="text-gray-400">Ключевые показатели эффективности за сегодня</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-[#474747] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      kpi.trend === 'up'
                        ? 'text-green-400 rotate-0'
                        : kpi.trend === 'down'
                        ? 'text-red-400 rotate-180'
                        : 'text-gray-400 rotate-90'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      kpi.trend === 'up'
                        ? 'text-green-400'
                        : kpi.trend === 'down'
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {kpi.trend === 'up' ? '+12%' : kpi.trend === 'down' ? '-5%' : '0%'}
                  </span>
                </div>
              </div>

              <h3 className="text-gray-400 text-sm mb-2">{kpi.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#e3e3dd]">{kpi.value}</span>
                <span className="text-gray-500">{kpi.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="mt-8 bg-[#474747] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-[#e3e3dd] mb-4">График активности</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-500">
            Графики будут доступны после интеграции библиотеки Chart.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

