import '../styles/styles.css';
import '../styles/animations.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, Component, useState } from 'react';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../lib/i18n';
import ToastContainer from '../components/Toast';
import dynamic from 'next/dynamic';
// Lazy load components to prevent initial load errors
const DownloadManager = dynamic(() => import('../components/DownloadManager'), {
  ssr: false,
  loading: () => null
});

const ChatSupport = dynamic(() => import('../components/ChatSupport'), {
  ssr: false,
  loading: () => null
});

import * as analytics from '../lib/analytics';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    if (typeof window !== 'undefined' && analytics && analytics.trackError) {
      try {
        analytics.trackError(
          error.message || 'Unknown error',
          errorInfo.componentStack || 'unknown',
          'error_boundary',
          error.stack
        );
      } catch (e) {
        console.error('Failed to track error:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>Something went wrong</h1>
          <p style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
            {error?.message || 'An unexpected error occurred'}
          </p>
          {error?.stack && (
            <details style={{ marginTop: '16px', textAlign: 'left', maxWidth: '600px', fontSize: '12px', color: '#999' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Error Details</summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px', 
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Applica classe per abilitare animazioni solo lato client
  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      document.documentElement.classList.add('animations-ready');
      // Applica animazioni a tutti gli elementi con classi animate-*
      const animatedElements = document.querySelectorAll('[class*="animate-"]');
      if (animatedElements && animatedElements.length > 0) {
        animatedElements.forEach((el) => {
          if (el && el.classList) {
            el.classList.add('animate-ready');
          }
        });
      }
    } catch (error) {
      console.warn('Animation setup failed:', error);
    }
  }, [mounted]);

  useEffect(() => {
    // Previeni scroll orizzontale (solo client-side)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    }
    
    // Prefetch ottimizzato solo dopo idle per non bloccare FCP
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Prefetch solo le route più comuni
          const commonRoutes = [
            '/tools/rimozione-sfondo-ai',
            '/tools/generazione-immagini-ai',
            '/upscaler',
            '/pdf',
            '/tools'
          ];
          // Prefetch con delay per non sovraccaricare
          commonRoutes.forEach((route, index) => {
            setTimeout(() => {
              router.prefetch(route).catch(() => {}); // Ignora errori
            }, index * 100);
          });
        }, { timeout: 2000 });
      } else {
        // Fallback per browser senza requestIdleCallback
        setTimeout(() => {
          router.prefetch('/tools').catch(() => {});
        }, 2000);
      }
    }

    // Track pageviews con Google Analytics e GTM
    const handleRouteChange = (url) => {
      analytics.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Track initial pageview
    if (router.asPath) {
      analytics.pageview(router.asPath);
    }
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Web Vitals Tracking
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

    // Load web-vitals library dynamically (optional)
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(analytics.trackWebVital);
      onFID(analytics.trackWebVital);
      onFCP(analytics.trackWebVital);
      onLCP(analytics.trackWebVital);
      onTTFB(analytics.trackWebVital);
      if (onINP) onINP(analytics.trackWebVital);
    }).catch(() => {
      // Web-vitals not available, skip silently
    });

    // Global error tracking
    const handleError = (event) => {
      analytics.trackError(
        event.message || 'Unknown error',
        event.filename || 'unknown',
        'javascript_error',
        event.lineno
      );
    };

    const handleUnhandledRejection = (event) => {
      analytics.trackError(
        event.reason?.message || 'Unhandled promise rejection',
        'promise_rejection',
        'promise_error'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider initialTranslations={pageProps.translations || {}}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
          <meta name="theme-color" content="#0f1720" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/logo.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/logo-with-text.jpg" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
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
            /* Ottimizzazioni performance */
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            /* GPU acceleration per animazioni */
            [style*="transform"], [style*="opacity"] {
              will-change: transform, opacity;
            }
            /* Smooth scrolling */
            html {
              scroll-behavior: smooth;
            }
            /* Ottimizzazione rendering */
            img, video {
              content-visibility: auto;
            }
          `}</style>
        </Head>

      {/* Google Tag Manager */}
      {analytics.ENABLE_ANALYTICS && analytics.GTM_ID !== 'GTM-XXXXXXX' && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${analytics.GTM_ID}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${analytics.GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 - Enhanced */}
      {analytics.ENABLE_ANALYTICS && analytics.GA_TRACKING_ID !== 'G-XXXXXXXXXX' && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analytics.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  page_location: window.location.href,
                  page_title: document.title,
                  send_page_view: true,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure',
                });
              `,
            }}
          />
        </>
      )}

        <ToastContainer />
        <Component {...pageProps} />
        <DownloadManager />
        <ChatSupport />
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
