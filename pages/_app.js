import '../public/styles.css';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isPdf = router.pathname.startsWith('/pdf');
  const isHome = router.pathname === '/';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#0f1720" />
        <title>Upscaler AI - 8K Image Enhancement</title>
      </Head>

      <nav className="app-nav">
        <div className="nav-inner">
          <div className="nav-main">
            <Link href="/" className={`nav-item ${isHome ? 'active' : ''}`}>Upscaler</Link>
            <Link href="/pdf" className={`nav-item ${isPdf ? 'active' : ''}`}>PDF Tools</Link>
          </div>
          <div className="nav-sub">
            <Link href="/pdf#jpg2pdf" className="sub-item">JPG→PDF</Link>
            <Link href="/pdf#pdf2jpg" className="sub-item">PDF→JPG</Link>
            <Link href="/pdf#docx2pdf" className="sub-item">WORD→PDF</Link>
            <Link href="/pdf#pdf2docx" className="sub-item">PDF→WORD</Link>
          </div>
        </div>
      </nav>

      <Component {...pageProps} />

      <style jsx>{`
        .app-nav{position:sticky;top:0;z-index:50;background:#0b1220cc;backdrop-filter:blur(8px);border-bottom:1px solid #1f2a44}
        .nav-inner{max-width:1200px;margin:0 auto;padding:10px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
        .nav-main{display:flex;gap:8px}
        .nav-item{display:inline-block;padding:8px 12px;border-radius:10px;text-decoration:none;color:#cfe0ff;background:#1a2235}
        .nav-item.active{background:#2563eb;color:#fff}
        .nav-sub{display:flex;gap:6px;margin-left:auto}
        .sub-item{color:#9fb0c8;text-decoration:none;padding:6px 10px;border-radius:8px}
        .sub-item:hover{background:#132038}
        @media (max-width:640px){
          .nav-sub{flex-basis:100%;margin-left:0}
        }
      `}</style>
    </>
  );
}

export default MyApp;
