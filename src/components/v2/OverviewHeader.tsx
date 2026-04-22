'use client';

import { useRef, useState } from 'react';
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

const PILLS: { key: TimeRangePreset | 'all'; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'all', label: 'All time' },
];

function getPresetDates(preset: TimeRangePreset | 'all'): { dateFrom: string; dateTo: string } {
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

  const selectPill = (key: TimeRangePreset | 'all') => {
    if (key === 'all') {
      setFilters({ ...filters, dateFrom: '', dateTo: '', timeRange: '' });
    } else {
      const { dateFrom, dateTo } = getPresetDates(key);
      setFilters({ ...filters, dateFrom, dateTo, timeRange: key });
    }
  };

  // Determine selected pill from filters
  const activePill: TimeRangePreset | 'all' = (() => {
    if (!filters.dateFrom && !filters.dateTo) return 'all';
    return (filters.timeRange as TimeRangePreset) || '';
  })() as TimeRangePreset | 'all';

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
    </div>
  );
}
