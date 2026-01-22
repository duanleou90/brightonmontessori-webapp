import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function normalizeRedirectSlug(slug: string, origin: string) {
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
  const slug = searchParams.get('slug') || '/';

  const draft = await draftMode();
  draft.disable();

  const redirectUrl = normalizeRedirectSlug(slug, request.nextUrl.origin);
  return NextResponse.redirect(redirectUrl, 307);
}
