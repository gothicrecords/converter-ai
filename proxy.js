import { NextResponse } from 'next/server';

// TEMPORARILY DISABLED: Middleware disabled to fix redirect loop issue
// Enforce canonical host and HTTPS in production
export function proxy(request) {
  // DISABLED: Return immediately to prevent redirect loops
  // TODO: Re-enable with proper domain configuration check
  return NextResponse.next();
  
  /* ORIGINAL CODE - DISABLED
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
  if (!primaryHost || !host) {
    return NextResponse.next();
  }

  // Normalize current host (remove www. if present for comparison)
  let currentHostNormalized = hostLower;
  if (currentHostNormalized.startsWith('www.')) {
    currentHostNormalized = currentHostNormalized.substring(4);
  }

  // CRITICAL: If we're already on the correct domain (normalized), NEVER redirect
  if (currentHostNormalized === primaryHost) {
    // Only redirect if current host has www. prefix
    if (hostLower.startsWith('www.')) {
      url.host = primaryHost;
      url.protocol = 'https:';
      // Triple check: ensure target is different and valid
      const targetHost = url.host.toLowerCase();
      if (targetHost && targetHost !== hostLower && targetHost === primaryHost) {
        return NextResponse.redirect(url, 308);
      }
    }
    // Already on correct domain, NO REDIRECT
    return NextResponse.next();
  }

  // Only redirect www to non-www if they're different
  if (hostLower === `www.${primaryHost}` && currentHostNormalized !== primaryHost) {
    url.host = primaryHost;
    url.protocol = 'https:';
    const targetHost = url.host.toLowerCase();
    // Final safety check: target must be different from current
    if (targetHost && targetHost !== hostLower && targetHost === primaryHost) {
      return NextResponse.redirect(url, 308);
    }
  }

  // Only redirect vercel.app preview URLs if different from primary
  const isVercelHost = hostLower.endsWith('.vercel.app');
  if (isVercelHost && currentHostNormalized !== primaryHost && primaryHost) {
    url.host = primaryHost;
    url.protocol = 'https:';
    const targetHost = url.host.toLowerCase();
    // Final safety check: target must be different from current
    if (targetHost && targetHost !== hostLower && targetHost === primaryHost) {
      return NextResponse.redirect(url, 308);
    }
  }

  // Default: no redirect
  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    // Run on all routes except Next internals, static assets, and API routes
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)',
  ],
};
