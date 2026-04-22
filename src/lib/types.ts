export interface NpsResponse {
  identity: string;
  date: string;
  score: number;
  category: 'Promoter' | 'Passive' | 'Detractor';
  comment: string;
  dedupKey: string;
  highestPlanType: string;
  userLocale: string;
  os: string;
  appVersion: string;
  assigned: string;
  followedUp: boolean;
}

export type TimeRangePreset = 'today' | '7d' | '30d' | '90d' | 'thisMonth' | 'lastMonth' | '';

export interface NpsFilters {
  dateFrom: string;
  dateTo: string;
  timeRange: TimeRangePreset;
  planType: string;
  locale: string;
  category: string;
  os: string;
  appVersion: string;
}

export interface NpsStats {
  total: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPct: number;
  passivePct: number;
  detractorPct: number;
  avgScore: number;
}

export interface DailyNps {
  date: string;
  npsScore: number;
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export interface PlanTypeStats {
  planType: string;
  avgScore: number;
  total: number;
  npsScore: number;
}
