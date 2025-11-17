import '../public/styles.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#0f1720" />
        <title>Tool Suite - Upscaler AI & PDF Converter</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
