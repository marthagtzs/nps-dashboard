import { NextRequest, NextResponse } from 'next/server';

// Webhook URL is intentionally server-side only (not NEXT_PUBLIC_) so the
// Apps Script URL doesn't leak into client bundles. The dashboard POSTs
// to this route; this route forwards to the Apps Script webhook.
const WEBHOOK_URL = process.env.NPS_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_URL) {
    return NextResponse.json(
      { error: 'NPS_WEBHOOK_URL not configured' },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = ((body.action ?? 'update') as string) || 'update';

  let payload: Record<string, unknown>;

  if (action === 'addTag') {
    const name = ((body.name ?? '') as string).trim();
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    payload = { action: 'addTag', name };
  } else if (action === 'update') {
    const dedupKey = ((body.dedupKey ?? '') as string);
    if (!dedupKey) {
      return NextResponse.json({ error: 'dedupKey is required' }, { status: 400 });
    }
    payload = {
      action: 'update',
      dedupKey,
      // Only forward the fields actually present so we don't overwrite with undefined
      ...(Object.prototype.hasOwnProperty.call(body, 'assigned')
        ? { assigned: body.assigned }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'followedUp')
        ? { followedUp: body.followedUp }
        : {}),
    };
  } else {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Apps Script returns a 302 redirect with the actual response body
      redirect: 'follow',
    });
    const text = await res.text();
    // Apps Script returns JSON in the body even after redirect
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: res.ok ? 200 : 500 });
    } catch {
      return NextResponse.json(
        { status: res.ok ? 'ok' : 'error', raw: text },
        { status: res.ok ? 200 : 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook call failed' },
      { status: 502 }
    );
  }
}
