import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        {/* Preconnect to important domains for faster connection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Google Search Console Verification */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        {/* Bing Webmaster Tools Verification */}
        {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
          <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION} />
        )}
        
        {/* Preload critical fonts - disabled to prevent 404 errors */}
        {/* Font file doesn't exist, preload removed */}
        
        {/* Performance: Minimize render-blocking resources */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical inline styles to prevent FOUC */
            html{scroll-behavior:smooth}
            body{margin:0;font-family:system-ui,-apple-system,sans-serif}
            *{box-sizing:border-box}
          `
        }} />
        
        {/* Charset and viewport are handled by Next.js by default */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
