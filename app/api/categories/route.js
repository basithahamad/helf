import { authorised, listCategories, saveCategories } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await listCategories(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body)) return Response.json({ error: 'expected an array' }, { status: 400 });
  if (!body.some(c => String(c?.name || '').trim())) {
    return Response.json({ error: 'keep at least one category' }, { status: 400 });
  }

  await saveCategories(body);
  return Response.json(await listCategories());
}
