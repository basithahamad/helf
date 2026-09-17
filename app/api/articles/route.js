import {
  authorised, listArticles, getArticle, createArticle, updateArticle, deleteArticle
} from '../../../lib/store';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };

export async function GET(request) {
  // Drafts are never served publicly. The admin sends its code on reads too, so
  // it still sees everything.
  const includeDrafts = authorised(request);
  const id = new URL(request.url).searchParams.get('id');

  if (id) {
    const a = await getArticle(id, { includeDrafts });
    return a
      ? Response.json(a, { headers: noStore })
      : Response.json({ error: 'not found' }, { status: 404 });
  }
  return Response.json(await listArticles({ includeDrafts }), { headers: noStore });
}

export async function POST(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.title) return Response.json({ error: 'title required' }, { status: 400 });

  return Response.json(await createArticle(body), { status: 201 });
}

export async function PUT(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'expected an object' }, { status: 400 });

  const updated = await updateArticle(id, body);
  return updated
    ? Response.json(updated)
    : Response.json({ error: 'not found' }, { status: 404 });
}

export async function DELETE(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  return (await deleteArticle(id))
    ? Response.json({ ok: true })
    : Response.json({ error: 'not found' }, { status: 404 });
}
