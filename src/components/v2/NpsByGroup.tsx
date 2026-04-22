'use client';

import { GroupNps } from '@/lib/nps-calculations';

interface NpsByGroupProps {
  title: string;
  subtitle: string;
  data: GroupNps[];
}

function colorFor(nps: number): { bar: string; text: string } {
  if (nps < 0) return { bar: 'bg-red-500', text: 'text-red-500' };
  if (nps < 50) return { bar: 'bg-[#2a8fc7]', text: 'text-[#2a8fc7]' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
}

export default function NpsByGroup({ title, subtitle, data }: NpsByGroupProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {/* Scale ticks 0-100 with midline at 50 */}
      <div className="relative h-4 mb-3 text-[10px] text-gray-400 select-none">
        <span className="absolute left-0 top-0">0</span>
        <span className="absolute left-[25%] top-0 -translate-x-1/2">25</span>
        <span className="absolute left-[50%] top-0 -translate-x-1/2 text-emerald-600 font-semibold">50</span>
        <span className="absolute left-[75%] top-0 -translate-x-1/2">75</span>
        <span className="absolute right-0 top-0">100</span>
      </div>

      <div className="flex-1 space-y-5">
        {data.length === 0 && (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
            No data in range
          </div>
        )}
        {data.map((g) => {
          const clamped = Math.max(-100, Math.min(100, g.npsScore));
          // Render on a 0-100 bar by shifting negative NPS to 0 (for visual only)
          const pct = Math.max(0, clamped);
          const color = colorFor(clamped);
          return (
            <div key={g.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{g.label}</span>
                <span className={`text-sm font-bold ${color.text}`}>
                  {clamped >= 0 ? '+' : ''}
                  {clamped} NPS
                </span>
              </div>
              <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                {/* midline marker at 50% */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-gray-300 z-10" />
                <div
                  className={`h-full rounded-full ${color.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Based on <span className="font-semibold text-gray-600">{g.total.toLocaleString()}</span> responses
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 text-[10px] text-gray-500 border-t border-gray-100 pt-3">
        <LegendDot color="bg-red-500" label="< 0" />
        <LegendDot color="bg-[#2a8fc7]" label="0–49" />
        <LegendDot color="bg-emerald-500" label="≥ 50 (great)" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
