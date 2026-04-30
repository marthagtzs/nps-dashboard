import { NextResponse } from 'next/server';
import { fetchNpsData, fetchTags } from '@/lib/google-sheets';

// Always pull fresh data on every request — the dashboard polls every 30s and
// users hit Refresh manually expecting an immediate update. ISR caching here
// makes "Updated X ago" lie about the staleness of the server response.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [data, tags] = await Promise.all([fetchNpsData(), fetchTags()]);
    return NextResponse.json(
      { data, tags, fetchedAt: new Date().toISOString() },
      {
        headers: {
          // Belt-and-suspenders: tell every layer (Vercel CDN, browsers, proxies)
          // not to cache this response so manual refresh actually fetches new data.
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching NPS data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch NPS data' },
      { status: 500 }
    );
  }
}
