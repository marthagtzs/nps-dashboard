'use client';

import { NpsStats } from '@/lib/types';

interface KpiCardsProps {
  stats: NpsStats;
}

export default function KpiCards({ stats }: KpiCardsProps) {
  const getNpsColor = (score: number) => {
    if (score >= 50) return 'text-emerald-600';
    if (score >= 0) return 'text-amber-500';
    return 'text-red-500';
  };

  const cards = [
    {
      label: 'Total Responses',
      value: stats.total.toLocaleString(),
      color: 'text-[#2a8fc7]',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'NPS Score',
      value: stats.npsScore,
      color: getNpsColor(stats.npsScore),
      bg: stats.npsScore >= 50 ? 'bg-emerald-50' : stats.npsScore >= 0 ? 'bg-amber-50' : 'bg-red-50',
      border: stats.npsScore >= 50 ? 'border-emerald-200' : stats.npsScore >= 0 ? 'border-amber-200' : 'border-red-200',
    },
    {
      label: 'Promoters',
      value: `${stats.promoterPct}%`,
      subtitle: `${stats.promoters} responses`,
      color: 'text-[#27ae60]',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'Passives',
      value: `${stats.passivePct}%`,
      subtitle: `${stats.passives} responses`,
      color: 'text-[#e09400]',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Detractors',
      value: `${stats.detractorPct}%`,
      subtitle: `${stats.detractors} responses`,
      color: 'text-[#ee5a5a]',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} ${card.border} border rounded-xl p-4 transition-shadow hover:shadow-md`}
        >
          <p className="text-sm text-gray-500 font-medium">{card.label}</p>
          <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          {card.subtitle && (
            <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
