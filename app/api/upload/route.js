import { authorised } from '../../../lib/store';
import { saveUpload, UploadError } from '../../../lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// multipart/form-data with a single `file` field. Answers with the public URL
// to store on the article or in the site document.
export async function POST(request) {
  if (!authorised(request)) return Response.json({ error: 'unauthorized' }, { status: 401 });

  let form;
  try { form = await request.formData(); }
  catch { return Response.json({ error: 'expected multipart/form-data' }, { status: 400 }); }

  try {
    const saved = await saveUpload(form.get('file'));
    return Response.json(saved, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return Response.json({ error: err.message }, { status: err.status });
    console.error('upload failed', err);
    return Response.json({ error: 'upload failed' }, { status: 500 });
  }
}
