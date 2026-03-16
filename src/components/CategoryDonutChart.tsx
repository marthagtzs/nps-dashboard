'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { NpsStats } from '@/lib/types';

interface CategoryDonutChartProps {
  stats: NpsStats;
}

const COLORS = {
  Promoters: '#27ae60',
  Passives: '#e09400',
  Detractors: '#ee5a5a',
};

export default function CategoryDonutChart({ stats }: CategoryDonutChartProps) {
  const data = [
    { name: 'Promoters', value: stats.promoters, pct: stats.promoterPct },
    { name: 'Passives', value: stats.passives, pct: stats.passivePct },
    { name: 'Detractors', value: stats.detractors, pct: stats.detractorPct },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const item = data.find((d) => d.name === name);
                return [`${value} (${item?.pct}%)`, name];
              }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
