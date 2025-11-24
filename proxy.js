import { NextResponse } from 'next/server';

// Enforce canonical host and HTTPS in production
export function proxy(request) {
  // Allow disabling middleware via environment variable
  if (process.env.DISABLE_REDIRECT_MIDDLEWARE === 'true') {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const hostLower = host.toLowerCase();
  
  // Only run in Vercel production environment
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv !== 'production') {
    return NextResponse.next();
  }

  // Determine primary domain from env
  let envUrl = process.env.NEXT_PUBLIC_URL || process.env.APP_URL || '';
  let primaryHost = '';
  try {
    if (envUrl) {
      // Normalize to HTTPS in production (Vercel always uses HTTPS)
      if (envUrl.startsWith('http://')) {
        envUrl = envUrl.replace('http://', 'https://');
      } else if (!envUrl.startsWith('https://') && !envUrl.startsWith('http://')) {
        // If no protocol specified, assume HTTPS
        envUrl = `https://${envUrl}`;
      }
      const parsedUrl = new URL(envUrl);
      primaryHost = parsedUrl.host.toLowerCase();
      // Remove www. from primaryHost if present to avoid loops
      if (primaryHost.startsWith('www.')) {
        primaryHost = primaryHost.substring(4);
      }
    }
  } catch (e) {
    // Invalid URL, skip redirect
    return NextResponse.next();
  }
  
  // If no primary host configured, skip redirect
  if (!primaryHost) {
    return NextResponse.next();
  }

  // Normalize current host (remove www. if present for comparison)
  let currentHostNormalized = hostLower;
  if (currentHostNormalized.startsWith('www.')) {
    currentHostNormalized = currentHostNormalized.substring(4);
  }

  // Safety check: prevent redirect loops by checking if we're already on the target
  if (currentHostNormalized === primaryHost) {
    // If current host has www. but target doesn't, redirect to remove www
    if (hostLower.startsWith('www.')) {
      url.host = primaryHost;
      url.protocol = 'https:';
      // Double check to prevent loop - ensure we're not redirecting to the same host
      const targetHost = url.host.toLowerCase();
      if (targetHost !== hostLower && targetHost === primaryHost) {
        return NextResponse.redirect(url, 308);
      }
    }
    // Already on correct domain, no redirect needed
    return NextResponse.next();
  }

  // Redirect www to apex (non-www) - only if different
  if (hostLower === `www.${primaryHost}`) {
    url.host = primaryHost;
    url.protocol = 'https:';
    // Final safety check - ensure target is different from current
    const targetHost = url.host.toLowerCase();
    if (targetHost !== hostLower && targetHost === primaryHost) {
      return NextResponse.redirect(url, 308);
    }
  }

  // Redirect vercel.app preview URLs to primary domain (only if different)
  const isVercelHost = hostLower.endsWith('.vercel.app');
  if (isVercelHost && currentHostNormalized !== primaryHost) {
    url.host = primaryHost;
    url.protocol = 'https:';
    // Final safety check - ensure target is different from current
    const targetHost = url.host.toLowerCase();
    if (targetHost !== hostLower && targetHost === primaryHost) {
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
