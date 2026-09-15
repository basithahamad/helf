import { read, write, authorised, isPublished, slugify } from '../../../lib/store';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };

export async function GET(request) {
  const all = await read('articles');
  // Drafts are never served publicly. The admin sends its code on reads too, so
  // it still sees everything.
  const visible = authorised(request) ? all : all.filter(isPublished);
  const id = new URL(request.url).searchParams.get('id');
  if (id) {
    const a = visible.find(x => x.id === id);
    return a
      ? Response.json(a, { headers: noStore })
      : Response.json({ error: 'not found' }, { status: 404 });
  }
  return Response.json(visible, { headers: noStore });
}

export async function POST(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.title) return Response.json({ error: 'title required' }, { status: 400 });

  const arts = await read('articles');
  let id = slugify(body.title), n = 2;
  while (arts.some(a => a.id === id)) id = `${slugify(body.title)}-${n++}`;

  const article = { ...body, id, createdAt: new Date().toISOString() };
  if (article.featured) arts.forEach(a => { a.featured = false; });
  arts.unshift(article);
  await write('articles', arts);
  return Response.json(article, { status: 201 });
}

export async function PUT(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'expected an object' }, { status: 400 });

  const arts = await read('articles');
  const i = arts.findIndex(a => a.id === id);
  if (i === -1) return Response.json({ error: 'not found' }, { status: 404 });

  const updated = { ...arts[i], ...body, id };
  if (updated.featured) arts.forEach(a => { a.featured = false; });
  arts[i] = updated;
  await write('articles', arts);
  return Response.json(updated);
}

export async function DELETE(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const arts = await read('articles');
  const next = arts.filter(a => a.id !== id);
  if (next.length === arts.length) return Response.json({ error: 'not found' }, { status: 404 });
  await write('articles', next);
  return Response.json({ ok: true });
}
