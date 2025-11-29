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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTs = today.getTime();

      // Load data from IndexedDB
      const receiving = await db.receivingDocuments.count();
      const placement = await db.placementDocuments.count();
      const picking = await db.pickingDocuments.count();
      const shipment = await db.shipmentDocuments.count();

      // Calculate Avg Time (based on completed receiving docs for now)
      const completedReceiving = await db.receivingDocuments
        .where('status')
        .equals('completed')
        .toArray();
      
      let totalTime = 0;
      let count = 0;
      completedReceiving.forEach(doc => {
          if (doc.createdAt && doc.updatedAt) {
              totalTime += (doc.updatedAt - doc.createdAt);
              count++;
          }
      });
      const avgMinutes = count > 0 ? Math.round(totalTime / count / 60000) : 0;

      // Count errors from today
      const errors = await db.errorLogs
        .where('timestamp')
        .above(todayTs)
        .count();

      // Calculate KPIs
      const stats: KPI[] = [
        {
          id: 'receiving',
          label: 'Приемка документов',
          value: receiving,
          unit: 'док.',
          trend: 'stable',
          icon: Package,
          color: 'bg-module-receiving-bg',
        },
        {
          id: 'placement',
          label: 'Размещено',
          value: placement,
          unit: 'док.',
          trend: 'stable',
          icon: CheckCircle,
          color: 'bg-module-placement-bg',
        },
        {
          id: 'picking',
          label: 'Подобрано',
          value: picking,
          unit: 'док.',
          trend: 'stable',
          icon: BarChart3,
          color: 'bg-module-picking-bg',
        },
        {
          id: 'shipment',
          label: 'Отгружено',
          value: shipment,
          unit: 'док.',
          trend: 'stable',
          icon: TrendingUp,
          color: 'bg-module-shipment-bg',
        },
        {
          id: 'avgTime',
          label: 'Среднее время (Приемка)',
          value: avgMinutes,
          unit: 'мин',
          trend: 'stable',
          icon: Clock,
          color: 'bg-accent-yellow',
        },
        {
          id: 'errors',
          label: 'Ошибок сегодня',
          value: errors,
          unit: 'шт.',
          trend: errors > 0 ? 'down' : 'stable',
          icon: AlertCircle,
          color: 'bg-status-error',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-content-primary mb-2">📊 Статистика и KPI</h1>
        <p className="text-content-secondary">Ключевые показатели эффективности за сегодня</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-surface-secondary rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-borders-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-surface-primary" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      kpi.trend === 'up'
                        ? 'text-status-success rotate-0'
                        : kpi.trend === 'down'
                        ? 'text-status-error rotate-180'
                        : 'text-content-tertiary rotate-90'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      kpi.trend === 'up'
                        ? 'text-status-success'
                        : kpi.trend === 'down'
                        ? 'text-status-error'
                        : 'text-content-tertiary'
                    }`}
                  >
                    {kpi.trend === 'up' ? '+12%' : kpi.trend === 'down' ? '-5%' : '0%'}
                  </span>
                </div>
              </div>

              <h3 className="text-content-secondary text-sm mb-2">{kpi.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-content-primary">{kpi.value}</span>
                <span className="text-content-tertiary">{kpi.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="mt-8 bg-surface-secondary rounded-xl p-6 shadow-lg border border-borders-default">
        <h2 className="text-xl font-semibold text-content-primary mb-4">График активности</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-borders-strong rounded-lg">
          <p className="text-content-tertiary">
            Графики будут доступны после интеграции библиотеки Chart.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

