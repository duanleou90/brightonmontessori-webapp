import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function normalizePreviewSlug(slug: string, origin: string) {
  if (!slug) return new URL('/', origin);

  // Disallow open redirects. Only allow same-origin URLs or path-only slugs.
  if (slug.startsWith('http://') || slug.startsWith('https://')) {
    const parsed = new URL(slug);
    if (parsed.origin !== origin) return new URL('/', origin);
    return parsed;
  }

  const ensuredPath = slug.startsWith('/') ? slug : `/${slug}`;
  return new URL(ensuredPath, origin);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';
  const expectedSecret = process.env.PREVIEW_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return new NextResponse('Invalid preview secret', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const redirectUrl = normalizePreviewSlug(slug, request.nextUrl.origin);

  return NextResponse.redirect(redirectUrl, 307);
}
