import '../public/styles.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../lib/i18n';
import ToastContainer from '../components/Toast';
import * as analytics from '../lib/analytics';

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch solo dopo idle per non bloccare FCP
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const commonRoutes = [
          '/tools/rimozione-sfondo-ai',
          '/tools/generazione-immagini-ai',
          '/upscaler',
          '/pdf'
        ];
        commonRoutes.forEach(route => router.prefetch(route));
      });
    }

    // Track pageviews con Google Analytics
    const handleRouteChange = (url) => {
      analytics.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialTranslations={pageProps.translations || {}}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
          <meta name="theme-color" content="#0f1720" />
          
          {/* Critical CSS inline per FCP veloce */}
          <style dangerouslySetInnerHTML={{__html: `
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;background:#0a0e1a;color:#e2e8f0;line-height:1.6;-webkit-font-smoothing:antialiased}
            #__next{min-height:100vh}
          `}} />
          
          {/* Preconnect solo a risorse critiche */}
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://image.pollinations.ai" />
          <link rel="dns-prefetch" href="https://api.remove.bg" />
          
          <title>Tool Suite - Upscaler AI & PDF Converter</title>
        </Head>

      {/* Google Analytics 4 - Lazy load per migliorare FCP */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${analytics.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${analytics.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

        <ToastContainer />
        <Component {...pageProps} />
        <SpeedInsights />
        <Analytics />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
