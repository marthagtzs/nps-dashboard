'use client';

import { NpsFilters, TimeRangePreset } from '@/lib/types';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface FilterBarProps {
  filters: NpsFilters;
  onFiltersChange: (filters: NpsFilters) => void;
  planTypes: string[];
  locales: string[];
  categories: string[];
  osValues: string[];
}

function getPresetDates(preset: TimeRangePreset): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  switch (preset) {
    case 'today':
      return { dateFrom: todayStr, dateTo: todayStr };
    case '7d':
      return { dateFrom: format(subDays(today, 6), 'yyyy-MM-dd'), dateTo: todayStr };
    case '30d':
      return { dateFrom: format(subDays(today, 29), 'yyyy-MM-dd'), dateTo: todayStr };
    case '90d':
      return { dateFrom: format(subDays(today, 89), 'yyyy-MM-dd'), dateTo: todayStr };
    case 'thisMonth':
      return { dateFrom: format(startOfMonth(today), 'yyyy-MM-dd'), dateTo: todayStr };
    case 'lastMonth': {
      const prev = subMonths(today, 1);
      return { dateFrom: format(startOfMonth(prev), 'yyyy-MM-dd'), dateTo: format(endOfMonth(prev), 'yyyy-MM-dd') };
    }
    default:
      return { dateFrom: '', dateTo: '' };
  }
}

const presets: { key: TimeRangePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
];

export default function FilterBar({
  filters,
  onFiltersChange,
  planTypes,
  locales,
  categories,
  osValues,
}: FilterBarProps) {
  const update = (key: keyof NpsFilters, value: string) => {
    if (key === 'dateFrom' || key === 'dateTo') {
      onFiltersChange({ ...filters, [key]: value, timeRange: '' });
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const selectPreset = (preset: TimeRangePreset) => {
    if (filters.timeRange === preset) {
      onFiltersChange({ ...filters, dateFrom: '', dateTo: '', timeRange: '' });
    } else {
      const { dateFrom, dateTo } = getPresetDates(preset);
      onFiltersChange({ ...filters, dateFrom, dateTo, timeRange: preset });
    }
  };

  const clearAll = () => {
    onFiltersChange({
      dateFrom: '',
      dateTo: '',
      timeRange: '',
      planType: '',
      locale: '',
      category: '',
      os: '',
    });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-[#2a8fc7] hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Time Range Presets */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => selectPreset(p.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              filters.timeRange === p.key
                ? 'bg-[#2a8fc7] text-white border-[#2a8fc7]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#2a8fc7] hover:text-[#2a8fc7]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update('dateFrom', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update('dateTo', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Plan Type</label>
          <select
            value={filters.planType}
            onChange={(e) => update('planType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent bg-white"
          >
            <option value="">All Plans</option>
            {planTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt.charAt(0).toUpperCase() + pt.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Locale</label>
          <select
            value={filters.locale}
            onChange={(e) => update('locale', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent bg-white"
          >
            <option value="">All Locales</option>
            {locales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">OS</label>
          <select
            value={filters.os}
            onChange={(e) => update('os', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent bg-white"
          >
            <option value="">All OS</option>
            {osValues.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
