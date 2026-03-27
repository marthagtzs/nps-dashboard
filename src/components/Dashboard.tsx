'use client';

import { useMemo } from 'react';
import { useNpsData } from '@/hooks/useNpsData';
import {
  filterResponses,
  calculateStats,
  groupByDay,
  groupByPlanType,
  getUniqueValues,
} from '@/lib/nps-calculations';
import KpiCards from './KpiCards';
import FilterBar from './FilterBar';
import NpsOverTimeChart from './NpsOverTimeChart';
import CategoryDonutChart from './CategoryDonutChart';
import ScoresByPlanChart from './ScoresByPlanChart';
import ResponseTable from './ResponseTable';
import CommentsPanel from './CommentsPanel';

export default function Dashboard() {
  const { responses, filters, setFilters, loading, error, lastUpdated, refresh } =
    useNpsData();

  const { planTypes, locales, categories, osValues } = useMemo(
    () => getUniqueValues(responses),
    [responses]
  );

  const filtered = useMemo(
    () => filterResponses(responses, filters),
    [responses, filters]
  );

  const stats = useMemo(() => calculateStats(filtered), [filtered]);
  const dailyNps = useMemo(() => groupByDay(filtered), [filtered]);
  const planStats = useMemo(() => groupByPlanType(filtered), [filtered]);

  const timeSinceUpdate = useMemo(() => {
    if (!lastUpdated) return null;
    const diff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }, [lastUpdated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2a8fc7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading NPS data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Failed to load data</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[#2a8fc7] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#2a8fc7] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800">NPS Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              {timeSinceUpdate && (
                <span className="text-xs text-gray-400">
                  Updated {timeSinceUpdate}
                </span>
              )}
              <button
                onClick={refresh}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <KpiCards stats={stats} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          planTypes={planTypes}
          locales={locales}
          categories={categories}
          osValues={osValues}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NpsOverTimeChart data={dailyNps} />
          </div>
          <div>
            <CategoryDonutChart stats={stats} />
          </div>
        </div>

        {/* Plan Type Chart */}
        <ScoresByPlanChart data={planStats} />

        {/* Table + Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponseTable responses={filtered} />
          </div>
          <div>
            <CommentsPanel responses={filtered} />
          </div>
        </div>
      </main>
    </div>
  );
}
