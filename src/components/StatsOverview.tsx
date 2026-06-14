import { useMemo } from 'react';
import { useGiftStore, getStats } from '@/store/useGiftStore';
import { Calendar, DollarSign, Gift, AlertCircle } from 'lucide-react';

export function StatsOverview() {
  const plans = useGiftStore((state) => state.plans);
  const stats = useMemo(() => getStats(plans), [plans]);

  const statCards = [
    {
      icon: <Calendar className="w-5 h-5" />,
      label: '即将到来',
      value: stats.upcomingCount,
      suffix: '个',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-500',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: '待购预算',
      value: stats.totalBudget,
      suffix: '元',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-500',
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: '已完成',
      value: stats.purchasedCount,
      suffix: '个',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-600',
      iconBg: 'bg-green-500',
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: '紧急提醒',
      value: stats.urgentCount,
      suffix: '个',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      textColor: 'text-red-600',
      iconBg: 'bg-red-500',
      pulse: stats.urgentCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-2xl p-4 shadow-card animate-fade-in-up`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.value}
                <span className="text-sm font-normal ml-1">{card.suffix}</span>
              </p>
            </div>
            <div
              className={`${card.iconBg} text-white p-2 rounded-xl ${
                card.pulse ? 'animate-breathe' : ''
              }`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
