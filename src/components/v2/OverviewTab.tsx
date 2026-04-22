'use client';

import { useMemo } from 'react';
import { NpsFilters, NpsResponse } from '@/lib/types';
import {
  calculateStats,
  groupByDay,
  groupByField,
  getScoreDistribution,
  getUniqueValues,
} from '@/lib/nps-calculations';
import OverviewHeader from './OverviewHeader';
import KpiCardsV2 from './KpiCardsV2';
import NpsTrendChart from './NpsTrendChart';
import ScoreDistributionChart from './ScoreDistributionChart';
import NpsByGroup from './NpsByGroup';
import CommentCategories from '../CommentCategories';

interface OverviewTabProps {
  responses: NpsResponse[];
  filtered: NpsResponse[];
  filters: NpsFilters;
  setFilters: React.Dispatch<React.SetStateAction<NpsFilters>>;
}

export default function OverviewTab({ responses, filtered, filters, setFilters }: OverviewTabProps) {
  const stats = useMemo(() => calculateStats(filtered), [filtered]);
  const priorStats = useMemo(() => calculateStats(responses), [responses]);
  const dailyNps = useMemo(() => groupByDay(filtered), [filtered]);
  const scoreDist = useMemo(() => getScoreDistribution(filtered), [filtered]);

  const byPlan = useMemo(
    () =>
      groupByField(filtered, 'highestPlanType', (s) =>
        s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'
      ),
    [filtered]
  );
  const byOs = useMemo(() => groupByField(filtered, 'os', (s) => s || 'Unknown'), [filtered]);
  const byLocale = useMemo(
    () => groupByField(filtered, 'userLocale', (s) => (s || 'unknown').toUpperCase()),
    [filtered]
  );

  const { planTypes, locales, categories, osValues, appVersions } = useMemo(
    () => getUniqueValues(responses),
    [responses]
  );

  return (
    <>
      <OverviewHeader
        total={stats.total}
        grandTotal={priorStats.total}
        filters={filters}
        setFilters={setFilters}
        planTypes={planTypes}
        locales={locales}
        categories={categories}
        osValues={osValues}
        appVersions={appVersions}
      />

      <KpiCardsV2 stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NpsTrendChart data={dailyNps} />
        <ScoreDistributionChart data={scoreDist} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NpsByGroup title="NPS by plan" subtitle="Free vs paid engagement" data={byPlan} />
        <NpsByGroup title="NPS by OS" subtitle="Platform differences" data={byOs} />
        <NpsByGroup title="NPS by locale" subtitle="Market differences" data={byLocale} />
      </div>

      <CommentCategories responses={filtered} />
    </>
  );
}
