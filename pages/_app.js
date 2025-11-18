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
    // Previeni scroll orizzontale
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    // Prefetch solo dopo idle per non bloccare FCP
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const commonRoutes = [
          '/tools/rimozione-sfondo-ai',
          '/tools/generazione-immagini-ai',
          '/upscaler',
          '/pdf',
          // Verso PDF
          '/pdf/jpg2pdf',
          '/pdf/docx2pdf',
          '/pdf/ppt2pdf',
          '/pdf/xls2pdf',
          '/pdf/html2pdf',
          // Da PDF
          '/pdf/pdf2jpg',
          '/pdf/pdf2docx',
          '/pdf/pdf2pptx',
          '/pdf/pdf2xlsx',
          '/pdf/pdf2pdfa'
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
          <meta name="theme-color" content="#0f1720" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <title>Tool Suite - Upscaler AI & PDF Converter</title>
          <style>{`
            html, body {
              overflow-x: hidden;
              max-width: 100vw;
              position: relative;
            }
            * {
              max-width: 100%;
            }
          `}</style>
        </Head>

      {/* Google Analytics 4 - Completamente disabilitato per performance */}
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            strategy="worker"
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="worker"
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
        </>
      )}

        <ToastContainer />
        <Component {...pageProps} />
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
