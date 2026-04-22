'use client';

import { useEffect, useRef, useState } from 'react';
import { NpsFilters, TimeRangePreset } from '@/lib/types';
import { format, subDays } from 'date-fns';
import FiltersPopover from './FiltersPopover';

interface OverviewHeaderProps {
  total: number;
  grandTotal: number;
  filters: NpsFilters;
  setFilters: React.Dispatch<React.SetStateAction<NpsFilters>>;
  planTypes: string[];
  locales: string[];
  categories: string[];
  osValues: string[];
  appVersions: string[];
}

type PillKey = TimeRangePreset | 'all' | 'custom';

const PILLS: { key: PillKey; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'custom', label: 'Custom' },
  { key: 'all', label: 'All time' },
];

function getPresetDates(preset: PillKey): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  switch (preset) {
    case '7d':
      return { dateFrom: format(subDays(today, 6), 'yyyy-MM-dd'), dateTo: todayStr };
    case '30d':
      return { dateFrom: format(subDays(today, 29), 'yyyy-MM-dd'), dateTo: todayStr };
    case '90d':
      return { dateFrom: format(subDays(today, 89), 'yyyy-MM-dd'), dateTo: todayStr };
    default:
      return { dateFrom: '', dateTo: '' };
  }
}

export default function OverviewHeader(props: OverviewHeaderProps) {
  const { total, grandTotal, filters, setFilters } = props;
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Determine selected pill from filters
  const activePill: PillKey = (() => {
    if (!filters.dateFrom && !filters.dateTo) return 'all';
    if (filters.timeRange === '7d' || filters.timeRange === '30d' || filters.timeRange === '90d') {
      return filters.timeRange;
    }
    // Date(s) set without a preset match → treat as custom
    return 'custom';
  })();

  const [customOpen, setCustomOpen] = useState(activePill === 'custom');

  // Keep customOpen in sync if the active pill changes (e.g. user picks a preset)
  useEffect(() => {
    if (activePill !== 'custom') setCustomOpen(false);
  }, [activePill]);

  const selectPill = (key: PillKey) => {
    if (key === 'all') {
      setFilters({ ...filters, dateFrom: '', dateTo: '', timeRange: '' });
      setCustomOpen(false);
    } else if (key === 'custom') {
      setCustomOpen(true);
      // Don't clear existing dates; let user tweak them directly.
      // If the pill was previously a preset, wipe the preset flag so the date inputs are treated as custom.
      if (filters.timeRange) {
        setFilters({ ...filters, timeRange: '' });
      }
    } else {
      const { dateFrom, dateTo } = getPresetDates(key);
      setFilters({ ...filters, dateFrom, dateTo, timeRange: key });
      setCustomOpen(false);
    }
  };

  const nonDateFilterCount = [
    filters.planType,
    filters.locale,
    filters.category,
    filters.os,
    filters.appVersion,
  ].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NPS</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total.toLocaleString()} of {grandTotal.toLocaleString()} total responses shown
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {PILLS.map((p) => {
            const isActive = activePill === p.key;
            return (
              <button
                key={p.key}
                onClick={() => selectPill(p.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#2a8fc7] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#2a8fc7] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {nonDateFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#2a8fc7] rounded-full">
                {nonDateFilterCount}
              </span>
            )}
          </button>
          {open && (
            <FiltersPopover
              {...props}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      </div>

      {customOpen && (
        <div className="mt-3 flex items-end gap-3 flex-wrap bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, timeRange: '' })}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, timeRange: '' })}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
            />
          </div>
          {(filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => setFilters({ ...filters, dateFrom: '', dateTo: '', timeRange: '' })}
              className="text-xs text-[#2a8fc7] hover:text-blue-700 font-medium self-end pb-1.5"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
