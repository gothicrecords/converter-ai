import '../styles/styles.css';
import '../styles/animations.css';
import '../styles/dropdown.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, Component, useState } from 'react';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../lib/i18n';
import ToastContainer from '../components/Toast';
import { optimizeCoreWebVitals, setupLazyImages } from '../lib/performance';
import DownloadManager from '../components/DownloadManager';
import ChatSupport from '../components/ChatSupport';

import * as analytics from '../lib/analytics';
import { cleanupHistory } from '../utils/history';

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
    // Pulisci la history se è troppo grande
    if (typeof window !== 'undefined') {
      try {
        cleanupHistory();
      } catch (error) {
        console.warn('Failed to cleanup history on mount:', error);
      }
    }
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
      
      // Setup lazy loading and Core Web Vitals optimizations
      try {
        if (typeof optimizeCoreWebVitals === 'function') {
          optimizeCoreWebVitals();
        }
        if (typeof setupLazyImages === 'function') {
          setupLazyImages();
        }
        // Import and use additional performance utilities
        import('../lib/performance').then(({ optimizeAnimations, measureWebVitals }) => {
          if (typeof optimizeAnimations === 'function') {
            optimizeAnimations();
          }
          if (typeof measureWebVitals === 'function') {
            measureWebVitals();
          }
        }).catch(() => {
          // Silently fail if performance utils can't be loaded
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Performance optimization setup failed:', error);
        }
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
    
    // Intelligent prefetching after page load for better performance
    if (typeof window !== 'undefined') {
      // Wait for page to be fully interactive
      const prefetchCriticalRoutes = () => {
        // Prefetch critical routes based on current page
        const currentPath = router.asPath;
        const criticalRoutes = [];
        
        // Always prefetch main navigation routes
        criticalRoutes.push('/tools', '/upscaler', '/pdf');
        
        // Add route-specific prefetches
        if (currentPath === '/') {
          criticalRoutes.push('/home', '/tools/rimozione-sfondo-ai', '/tools/generazione-immagini-ai');
        } else if (currentPath.startsWith('/tools')) {
          criticalRoutes.push('/tools/rimozione-sfondo-ai', '/upscaler');
        }
        
        // Prefetch routes with delay to avoid blocking
        criticalRoutes.slice(0, 5).forEach((route, index) => {
          setTimeout(() => {
            router.prefetch(route).catch(() => {}); // Ignore errors
          }, index * 200 + 1000); // Start after 1s, 200ms between each
        });
      };
      
      // Use requestIdleCallback if available, otherwise use setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(prefetchCriticalRoutes, { timeout: 3000 });
      } else {
        setTimeout(prefetchCriticalRoutes, 2000);
      }
      
      // Prefetch on link hover (user intent)
      const prefetchOnHover = (e) => {
        const link = e.target.closest('a[href]');
        if (link && link.href.startsWith(window.location.origin)) {
          const href = link.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('http')) {
            router.prefetch(href).catch(() => {});
          }
        }
      };
      
      // Add prefetch on hover for better UX
      document.addEventListener('mouseover', prefetchOnHover, { passive: true });
      
      // Cleanup
      return () => {
        document.removeEventListener('mouseover', prefetchOnHover);
      };
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

  // Register Service Worker for performance
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Use requestIdleCallback for non-critical registration
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
              // Silently fail - service worker is optional
              if (process.env.NODE_ENV === 'development') {
                console.log('Service Worker registration failed:', error);
              }
            });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          navigator.serviceWorker
            .register('/sw.js')
            .catch(() => {
              // Silently fail
            });
        }, 2000);
      }
    }
  }, []);

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
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="MegaPixelAI ToolSuite" />
          <meta name="theme-color" content="#0a0e1a" />
          <meta name="msapplication-TileColor" content="#0a0e1a" />
          <meta name="msapplication-navbutton-color" content="#0a0e1a" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/logo.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/logo-with-text.jpg" />
          
          {/* Performance: Preconnect to external domains */}
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* DNS Prefetch for faster resolution */}
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://connect.facebook.net" />
          <link rel="dns-prefetch" href="https://www.clarity.ms" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          
          {/* CSS files are already imported above, no need for link tags */}
          
          {/* DNS prefetch for external resources */}
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
          
          {/* Resource hints for critical routes (prefetch in production only) */}
          {process.env.NODE_ENV === 'production' && (
            <>
              <link rel="prefetch" href="/tools" as="document" />
              <link rel="prefetch" href="/upscaler" as="document" />
              <link rel="prefetch" href="/pdf" as="document" />
            </>
          )}
          
          <title>Tool Suite - Upscaler AI & PDF Converter</title>
          <style>{`
            html {
              overflow-y: scroll;
              overflow-x: hidden;
              width: 100%;
              max-width: 100%;
            }
            body {
              overflow-x: hidden;
              max-width: 100%;
              width: 100%;
              position: relative;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            * {
              box-sizing: border-box;
            }
            /* Force scrollbar to always show to prevent layout shift */
            :root {
              overflow-y: scroll;
              overflow-x: hidden;
              scrollbar-gutter: stable;
              width: 100%;
              max-width: 100%;
            }
            /* Prevent horizontal scroll */
            #__next {
              overflow-x: hidden;
              max-width: 100%;
              width: 100%;
            }
            /* Ottimizzazioni performance */
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              -webkit-tap-highlight-color: transparent;
            }
            /* GPU acceleration per animazioni */
            [style*="transform"], [style*="opacity"] {
              will-change: transform, opacity;
            }
            /* Smooth scrolling - disabilitato su mobile per performance */
            @media (prefers-reduced-motion: no-preference) {
              html {
                scroll-behavior: smooth;
              }
            }
            /* Ottimizzazione rendering */
            img, video {
              content-visibility: auto;
            }
            /* Mobile optimizations */
            @media (max-width: 768px) {
              * {
                -webkit-tap-highlight-color: rgba(102, 126, 234, 0.2);
                touch-action: manipulation;
              }
              button, a, [role="button"] {
                -webkit-tap-highlight-color: rgba(102, 126, 234, 0.3);
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
              }
              /* Prevent text selection on buttons */
              input, textarea {
                -webkit-user-select: text;
                user-select: text;
              }
              /* iOS Safari specific fixes */
              @supports (-webkit-touch-callout: none) {
                body {
                  -webkit-overflow-scrolling: touch;
                }
              }
            }
            /* Android Chrome optimizations */
            @media (max-width: 768px) and (-webkit-min-device-pixel-ratio: 2) {
              * {
                -webkit-font-smoothing: antialiased;
              }
            }
          `}</style>
        </Head>

      {/* Google Analytics 4 - Primary (G-34NK4NEB9B) */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-34NK4NEB9B"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-34NK4NEB9B', {
              page_path: window.location.pathname,
              page_location: window.location.href,
              page_title: document.title,
              send_page_view: true,
            });
          `,
        }}
      />

      {/* Google Tag Manager - Always enabled if GTM_ID is configured */}
      {analytics.GTM_ID && analytics.GTM_ID !== 'GTM-XXXXXXX' && (
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

      {/* Google Analytics 4 - Enhanced (Additional tracking if configured) */}
      {analytics.ENABLE_ANALYTICS && analytics.GA_TRACKING_ID !== 'G-XXXXXXXXXX' && analytics.GA_TRACKING_ID !== 'G-34NK4NEB9B' && (
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

      {/* Meta Pixel (Facebook Pixel) */}
      {analytics.isMetaPixelEnabled && analytics.isMetaPixelEnabled() && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${analytics.META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${analytics.META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Bing Webmaster Tools Tracking */}
      {analytics.isBingWebmasterEnabled && analytics.isBingWebmasterEnabled() && (
        <Script
          id="bing-webmaster"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${analytics.BING_WEBMASTER_ID}");
            `,
          }}
        />
      )}

        <ToastContainer />
        <Component {...pageProps} />
        <DownloadManager />
        {mounted && <ChatSupport />}
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
