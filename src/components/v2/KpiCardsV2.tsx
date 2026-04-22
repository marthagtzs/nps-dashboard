'use client';

import { NpsStats } from '@/lib/types';

interface KpiCardsV2Props {
  stats: NpsStats;
}

function npsLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Great', color: 'text-emerald-600' };
  if (score >= 50) return { label: 'Good', color: 'text-emerald-600' };
  if (score >= 0) return { label: 'Fair', color: 'text-amber-500' };
  return { label: 'Needs work', color: 'text-red-500' };
}

export default function KpiCardsV2({ stats }: KpiCardsV2Props) {
  const nps = npsLabel(stats.npsScore);
  const promoterBadge = stats.promoters;
  const detractorBadge = stats.detractors;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* NPS SCORE */}
      <Card title="NPS SCORE" accent="blue">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900">{stats.npsScore}</div>
            <div className={`text-sm font-medium mt-1 ${nps.color}`}>{nps.label}</div>
          </div>
          <IconCircle bg="bg-blue-100">
            <svg className="w-5 h-5 text-[#2a8fc7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </IconCircle>
        </div>
        <div className="text-xs text-emerald-600 mt-2 font-medium">
          {stats.npsScore >= 0 ? '↗' : '↘'} {stats.npsScore >= 0 ? '+' : ''}
          {stats.npsScore} pts
        </div>
      </Card>

      {/* RESPONSES */}
      <Card title="RESPONSES" accent="indigo">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
          </div>
          <IconCircle bg="bg-indigo-100">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </IconCircle>
        </div>
        <div className="text-xs text-emerald-600 mt-2 font-medium">↗ +{stats.total.toLocaleString()} vs prior</div>
      </Card>

      {/* PROMOTERS */}
      <Card title="PROMOTERS" accent="emerald">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-[#27ae60]">{stats.promoterPct}%</div>
            <div className="text-xs text-gray-500 mt-1">{promoterBadge.toLocaleString()} responses</div>
          </div>
          <IconCircle bg="bg-emerald-100">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </IconCircle>
        </div>
        <div className="text-xs text-emerald-600 mt-2 font-medium">↗ +{stats.promoterPct} pp</div>
      </Card>

      {/* DETRACTORS */}
      <Card title="DETRACTORS" accent="red">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-[#ee5a5a]">{stats.detractorPct}%</div>
            <div className="text-xs text-gray-500 mt-1">{detractorBadge.toLocaleString()} responses</div>
          </div>
          <IconCircle bg="bg-red-100">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </IconCircle>
        </div>
        <div className="text-xs text-red-500 mt-2 font-medium">↗ +{stats.detractorPct} pp</div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="text-[11px] font-semibold text-gray-500 tracking-wider mb-3">{title}</div>
      {children}
    </div>
  );
}

function IconCircle({ bg, children }: { bg: string; children: React.ReactNode }) {
  return <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>{children}</div>;
}
