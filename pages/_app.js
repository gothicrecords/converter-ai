import '../public/styles.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch common tool routes on mount
    const commonRoutes = [
      '/tools/rimozione-sfondo-ai',
      '/tools/generazione-immagini-ai',
      '/upscaler',
      '/pdf'
    ];
    commonRoutes.forEach(route => router.prefetch(route));
  }, [router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#0f1720" />
        <link rel="preconnect" href="https://image.pollinations.ai" />
        <link rel="dns-prefetch" href="https://image.pollinations.ai" />
        <link rel="preconnect" href="https://api.remove.bg" />
        <link rel="dns-prefetch" href="https://api.remove.bg" />
        <title>Tool Suite - Upscaler AI & PDF Converter</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
