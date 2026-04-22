'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { ScoreBucket } from '@/lib/nps-calculations';

interface ScoreDistributionChartProps {
  data: ScoreBucket[];
}

const COLORS: Record<ScoreBucket['category'], string> = {
  Detractor: '#ee5a5a',
  Passive: '#e09400',
  Promoter: '#27ae60',
};

export default function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const total = data.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Score distribution</h3>
        <p className="text-xs text-gray-500 mt-0.5">How responses split across the 0&ndash;10 scale.</p>
      </div>
      {total === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No data in range
        </div>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="score"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  formatter={(value, _k, p) => [String(value ?? ''), String(p?.payload?.category ?? '')]}
                  labelFormatter={(label) => `Score ${label}`}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.score} fill={COLORS[entry.category]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            <LegendDot color={COLORS.Detractor} label="Detractor (0–6)" />
            <LegendDot color={COLORS.Passive} label="Passive (7–8)" />
            <LegendDot color={COLORS.Promoter} label="Promoter (9–10)" />
          </div>
        </>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
