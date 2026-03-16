'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { DailyNps } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface NpsOverTimeChartProps {
  data: DailyNps[];
}

export default function NpsOverTimeChart({ data }: NpsOverTimeChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch {
      return dateStr;
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">NPS Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">NPS Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              domain={[-100, 100]}
              tick={{ fontSize: 12, fill: '#888' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip
              formatter={(value) => [value, 'NPS Score']}
              labelFormatter={(label) => formatDate(String(label))}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <ReferenceLine y={0} stroke="#ccc" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="npsScore"
              stroke="#2a8fc7"
              strokeWidth={3}
              dot={{ fill: '#2a8fc7', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#2a8fc7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
