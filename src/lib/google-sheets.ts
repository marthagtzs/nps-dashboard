import { NpsResponse } from './types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;
const SHEET_NAME = 'NPS Responses';

export async function fetchNpsData(): Promise<NpsResponse[]> {
  if (!SHEET_ID || !API_KEY) {
    throw new Error('Missing GOOGLE_SHEET_ID or GOOGLE_API_KEY environment variables');
  }

  const range = encodeURIComponent(`${SHEET_NAME}!A:L`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  const res = await fetch(url, {
    next: { revalidate: 7200 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Sheets API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  if (rows.length <= 1) {
    return [];
  }

  // Skip header row
  return rows.slice(1).map(parseRow).filter(Boolean) as NpsResponse[];
}

function parseRow(row: string[]): NpsResponse | null {
  if (!row || row.length < 3) return null;

  const score = parseInt(row[2], 10);
  if (isNaN(score)) return null;

  // Determine category from score if not provided
  let category = (row[3] || '').trim() as NpsResponse['category'];
  if (!category || !['Promoter', 'Passive', 'Detractor'].includes(category)) {
    if (score >= 9) category = 'Promoter';
    else if (score >= 7) category = 'Passive';
    else category = 'Detractor';
  }

  return {
    identity: (row[0] || '').trim(),
    date: (row[1] || '').trim(),
    score,
    category,
    comment: (row[4] || '').trim(),
    dedupKey: (row[5] || '').trim(),
    highestPlanType: (row[6] || '').trim().toLowerCase(),
    userLocale: (row[7] || '').trim().toLowerCase(),
    os: (row[8] || '').trim(),
    appVersion: (row[9] || '').trim(),
    assigned: (row[10] || '').trim(),
    followedUp: parseBool(row[11]),
  };
}

function parseBool(v: string | undefined): boolean {
  if (!v) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'x';
}

export async function fetchTags(): Promise<string[]> {
  if (!SHEET_ID || !API_KEY) return [];
  const range = encodeURIComponent('Tags!A2:A');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  try {
    const res = await fetch(url, { next: { revalidate: 7200 } });
    if (!res.ok) {
      // If the Tags sheet doesn't exist yet, the API returns 400.
      // Swallow and return empty so the dashboard still loads.
      return [];
    }
    const data = await res.json();
    const rows: string[][] = data.values || [];
    return rows
      .map((r) => (r[0] || '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
