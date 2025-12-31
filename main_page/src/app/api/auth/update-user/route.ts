import { headers } from 'next/headers';

export async function POST(req: Request) {
  const authUrl = process.env.INTERNAL_AUTH_URL;
  if (!authUrl) return new Response('Internal auth URL not configured', { status: 500 });

  const cookie = (await headers()).get('cookie') ?? '';

  try {
    const body = await req.text();

    const res = await fetch(`${authUrl}/api/auth/update-user`, {
      method: 'POST',
      headers: {
        cookie,
        'Content-Type': req.headers.get('content-type') || 'application/json',
      },
      body,
    });

    const respBody = await res.text();
    return new Response(respBody, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    console.error('Proxy to auth service failed:', err);
    return new Response('Failed to contact auth service', { status: 502 });
  }
}
