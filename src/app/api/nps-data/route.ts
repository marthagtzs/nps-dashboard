import { NextResponse } from 'next/server';
import { fetchNpsData, fetchTags } from '@/lib/google-sheets';

export const revalidate = 30;

export async function GET() {
  try {
    const [data, tags] = await Promise.all([fetchNpsData(), fetchTags()]);
    return NextResponse.json({ data, tags, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching NPS data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch NPS data' },
      { status: 500 }
    );
  }
}
