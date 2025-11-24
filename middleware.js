import { NextResponse } from 'next/server';

// Enforce canonical host and HTTPS in production
export function middleware(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  
  // Only run in Vercel production environment
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv !== 'production') {
    return NextResponse.next();
  }

  // Determine primary domain from env
  const envUrl = process.env.NEXT_PUBLIC_URL || process.env.APP_URL || '';
  let primaryHost = '';
  try {
    if (envUrl) primaryHost = new URL(envUrl).host;
  } catch {}
  
  // If no primary host configured, skip redirect
  if (!primaryHost) {
    return NextResponse.next();
  }

  // Redirect www to apex
  if (host && host.toLowerCase() === `www.${primaryHost}`) {
    url.host = primaryHost;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  // Redirect vercel.app preview URLs to primary domain
  const isVercelHost = host && host.endsWith('.vercel.app');
  if (isVercelHost && host !== primaryHost) {
    url.host = primaryHost;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
