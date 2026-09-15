import { read, write, authorised, merge } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await read('site'), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return Response.json({ error: 'expected an object' }, { status: 400 });

  const doc = merge(await read('site'), body);
  await write('site', doc);
  return Response.json(doc);
}
