'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { NpsFilters, TimeRangePreset } from '@/lib/types';
import { colorForAssignee } from './assigneeColors';

export type TrackingStatusFilter = 'all' | 'pending' | 'followed';
export type TrackingAssigneeFilter = string; // '' = all, 'UNASSIGNED' sentinel, or name

interface CommentTrackingFiltersProps {
  filters: NpsFilters;
  setFilters: React.Dispatch<React.SetStateAction<NpsFilters>>;
  assigneeFilter: TrackingAssigneeFilter;
  setAssigneeFilter: (v: TrackingAssigneeFilter) => void;
  statusFilter: TrackingStatusFilter;
  setStatusFilter: (v: TrackingStatusFilter) => void;
  assigneeOptions: string[];
  planTypes: string[];
  locales: string[];
  categories: string[];
  osValues: string[];
  appVersions: string[];
  counts: { total: number; assigned: number; followed: number };
}

type Pill = { key: TimeRangePreset | 'all' | 'custom' | '14d'; label: string; days?: number };

const PILLS: Pill[] = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '14d', label: 'Last 14 days', days: 14 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: 'custom', label: 'Custom' },
  { key: 'all', label: 'All time' },
];

function getPresetDates(days: number) {
  const today = new Date();
  return {
    dateFrom: format(subDays(today, days - 1), 'yyyy-MM-dd'),
    dateTo: format(today, 'yyyy-MM-dd'),
  };
}

export default function CommentTrackingFilters({
  filters,
  setFilters,
  assigneeFilter,
  setAssigneeFilter,
  statusFilter,
  setStatusFilter,
  assigneeOptions,
  planTypes,
  locales,
  categories,
  osValues,
  appVersions,
  counts,
}: CommentTrackingFiltersProps) {
  // Determine the active pill from current filters
  const activePill: Pill['key'] = (() => {
    if (!filters.dateFrom && !filters.dateTo) return 'all';
    if (filters.timeRange === '7d') return '7d';
    if (filters.timeRange === '30d') return '30d';
    // 14d isn't in TimeRangePreset union; detect by date math
    if (filters.timeRange === '' && filters.dateFrom && filters.dateTo) {
      const from = new Date(filters.dateFrom);
      const to = new Date(filters.dateTo);
      const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
      if (days === 14) return '14d';
    }
    return 'custom';
  })();

  const [customOpen, setCustomOpen] = useState(activePill === 'custom');

  const pickPill = (p: Pill) => {
    if (p.key === 'all') {
      setFilters((f) => ({ ...f, dateFrom: '', dateTo: '', timeRange: '' }));
      setCustomOpen(false);
    } else if (p.key === 'custom') {
      setCustomOpen(true);
    } else if (p.days) {
      const { dateFrom, dateTo } = getPresetDates(p.days);
      // 14d isn't in TimeRangePreset union, keep timeRange blank for it
      const timeRange: TimeRangePreset = p.key === '7d' || p.key === '30d' || p.key === '90d' ? p.key : '';
      setFilters((f) => ({ ...f, dateFrom, dateTo, timeRange }));
      setCustomOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-700">{counts.total.toLocaleString()}</span> response
            {counts.total === 1 ? '' : 's'}
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-gray-700">{counts.assigned.toLocaleString()}</span> assigned
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-gray-700">{counts.followed.toLocaleString()}</span> followed up
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Time pills */}
        <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
          {PILLS.map((p) => {
            const isActive = activePill === p.key;
            return (
              <button
                key={p.key}
                onClick={() => pickPill(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive ? 'bg-[#2a8fc7] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Assignee filter */}
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="">All assignees</option>
          <option value="__UNASSIGNED__">Unassigned</option>
          {assigneeOptions.map((o) => {
            const c = colorForAssignee(o);
            return (
              <option key={o} value={o} className={c.softText}>
                {o}
              </option>
            );
          })}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TrackingStatusFilter)}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="followed">Followed up</option>
        </select>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Plan */}
        <select
          value={filters.planType}
          onChange={(e) => setFilters((f) => ({ ...f, planType: e.target.value }))}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="">All plans</option>
          {planTypes.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        {/* Locale */}
        <select
          value={filters.locale}
          onChange={(e) => setFilters((f) => ({ ...f, locale: e.target.value }))}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="">All locales</option>
          {locales.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>

        {/* OS */}
        <select
          value={filters.os}
          onChange={(e) => setFilters((f) => ({ ...f, os: e.target.value }))}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="">All OS</option>
          {osValues.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        {/* App version */}
        <select
          value={filters.appVersion}
          onChange={(e) => setFilters((f) => ({ ...f, appVersion: e.target.value }))}
          className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
        >
          <option value="">All versions</option>
          {appVersions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {customOpen && (
        <div className="mt-3 flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, timeRange: '' }))}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, timeRange: '' }))}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a8fc7] focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
