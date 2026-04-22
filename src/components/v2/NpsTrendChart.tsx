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

interface NpsTrendChartProps {
  data: DailyNps[];
}

export default function NpsTrendChart({ data }: NpsTrendChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">NPS trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Daily NPS score. Green line at 50 is the &ldquo;great&rdquo; threshold.
          </p>
        </div>
        <span className="text-[10px] font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
          DAILY
        </span>
      </div>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No data in range
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 16, left: -4, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[-100, 100]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                ticks={[-100, -50, 0, 50, 100]}
              />
              <Tooltip
                formatter={(value) => [String(value ?? ''), 'NPS']}
                labelFormatter={(label) => formatDate(String(label))}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: 12,
                }}
              />
              <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="#d1d5db" />
              <Line
                type="monotone"
                dataKey="npsScore"
                stroke="#2a8fc7"
                strokeWidth={2.5}
                dot={{ fill: '#2a8fc7', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#2a8fc7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
