import { headers } from 'next/headers';

export async function GET(req: Request) {
  const authUrl = process.env.INTERNAL_AUTH_URL;
  if (!authUrl) return new Response('Internal auth URL not configured', { status: 500 });

  // Forward the incoming cookie header to the auth service
  const cookie = (await headers()).get('cookie') ?? '';

  try {
    const res = await fetch(`${authUrl}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        cookie,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const body = await res.text();
    return new Response(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    console.error('Proxy to auth service failed:', err);
    return new Response('Failed to contact auth service', { status: 502 });
  }
}
