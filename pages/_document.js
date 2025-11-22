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
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
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
