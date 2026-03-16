'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { PlanTypeStats } from '@/lib/types';

interface ScoresByPlanChartProps {
  data: PlanTypeStats[];
}

const BAR_COLORS = ['#2a8fc7', '#27ae60', '#e09400', '#ee5a5a', '#8b5cf6', '#ec4899'];

export default function ScoresByPlanChart({ data }: ScoresByPlanChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">NPS by Plan Type</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">NPS by Plan Type</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="planType"
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              domain={[-100, 100]}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'npsScore') return [value, 'NPS Score'];
                return [value, name];
              }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="npsScore" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
