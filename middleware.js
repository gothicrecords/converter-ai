import { NextResponse } from 'next/server';

// Enforce canonical host and HTTPS in production
export function middleware(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const isProd = process.env.NODE_ENV === 'production';

  // Determine primary domain from env
  const envUrl = process.env.NEXT_PUBLIC_URL || process.env.APP_URL || '';
  let primaryHost = '';
  try {
    if (envUrl) primaryHost = new URL(envUrl).host;
  } catch {}
  if (!primaryHost) primaryHost = process.env.PRIMARY_DOMAIN || 'megapixelsuite.com';

  // Redirect www to apex
  if (isProd && host && host.toLowerCase() === `www.${primaryHost}`) {
    url.host = primaryHost;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  // Redirect vercel.app or any non-canonical host to primary domain
  const isVercelHost = host && host.endsWith('.vercel.app');
  if (isProd && host && host !== primaryHost && (isVercelHost || host.endsWith(primaryHost) || true)) {
    url.host = primaryHost;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  // Optionally enforce HTTPS (usually handled by Vercel)
  // if (isProd && request.nextUrl.protocol === 'http:') {
  //   url.protocol = 'https:';
  //   return NextResponse.redirect(url, 308);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
