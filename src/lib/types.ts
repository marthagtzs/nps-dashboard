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
}

export interface NpsFilters {
  dateFrom: string;
  dateTo: string;
  planType: string;
  locale: string;
  category: string;
  os: string;
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
