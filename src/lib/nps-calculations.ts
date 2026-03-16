import { NpsResponse, NpsFilters, NpsStats, DailyNps, PlanTypeStats } from './types';
import { format, parseISO, isValid } from 'date-fns';

export function filterResponses(responses: NpsResponse[], filters: NpsFilters): NpsResponse[] {
  return responses.filter((r) => {
    if (filters.dateFrom) {
      const responseDate = normalizeDate(r.date);
      if (responseDate && responseDate < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      const responseDate = normalizeDate(r.date);
      if (responseDate && responseDate > filters.dateTo) return false;
    }
    if (filters.planType && r.highestPlanType !== filters.planType.toLowerCase()) {
      return false;
    }
    if (filters.locale && r.userLocale !== filters.locale.toLowerCase()) {
      return false;
    }
    if (filters.category && r.category !== filters.category) {
      return false;
    }
    return true;
  });
}

function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    // Try ISO format first
    const parsed = parseISO(dateStr);
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd');
    }
  } catch {
    // ignore
  }
  // Try extracting date from various formats
  const match = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }
  return null;
}

export function calculateStats(responses: NpsResponse[]): NpsStats {
  const total = responses.length;
  if (total === 0) {
    return {
      total: 0,
      npsScore: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promoterPct: 0,
      passivePct: 0,
      detractorPct: 0,
      avgScore: 0,
    };
  }

  const promoters = responses.filter((r) => r.category === 'Promoter').length;
  const passives = responses.filter((r) => r.category === 'Passive').length;
  const detractors = responses.filter((r) => r.category === 'Detractor').length;

  const npsScore = Math.round(((promoters - detractors) / total) * 100);
  const avgScore = responses.reduce((sum, r) => sum + r.score, 0) / total;

  return {
    total,
    npsScore,
    promoters,
    passives,
    detractors,
    promoterPct: Math.round((promoters / total) * 100),
    passivePct: Math.round((passives / total) * 100),
    detractorPct: Math.round((detractors / total) * 100),
    avgScore: Math.round(avgScore * 10) / 10,
  };
}

export function groupByDay(responses: NpsResponse[]): DailyNps[] {
  const groups: Record<string, NpsResponse[]> = {};

  responses.forEach((r) => {
    const day = normalizeDate(r.date) || 'unknown';
    if (day === 'unknown') return;
    if (!groups[day]) groups[day] = [];
    groups[day].push(r);
  });

  return Object.entries(groups)
    .map(([date, items]) => {
      const stats = calculateStats(items);
      return {
        date,
        npsScore: stats.npsScore,
        total: stats.total,
        promoters: stats.promoters,
        passives: stats.passives,
        detractors: stats.detractors,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupByPlanType(responses: NpsResponse[]): PlanTypeStats[] {
  const groups: Record<string, NpsResponse[]> = {};

  responses.forEach((r) => {
    const plan = r.highestPlanType || 'unknown';
    if (!groups[plan]) groups[plan] = [];
    groups[plan].push(r);
  });

  return Object.entries(groups)
    .map(([planType, items]) => {
      const stats = calculateStats(items);
      return {
        planType: planType.charAt(0).toUpperCase() + planType.slice(1),
        avgScore: stats.avgScore,
        total: stats.total,
        npsScore: stats.npsScore,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function getUniqueValues(responses: NpsResponse[]) {
  const planTypes = [...new Set(responses.map((r) => r.highestPlanType).filter(Boolean))].sort();
  const locales = [...new Set(responses.map((r) => r.userLocale).filter(Boolean))].sort();
  const categories: string[] = ['Promoter', 'Passive', 'Detractor'];
  return { planTypes, locales, categories };
}
