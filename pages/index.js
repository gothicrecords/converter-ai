import Link from 'next/link';
import Head from 'next/head';
import { HiSparkles, HiPhotograph, HiDocumentText, HiDocument, HiArrowRight } from 'react-icons/hi';
import { BsFileEarmarkPdfFill, BsFileEarmarkImageFill, BsFileEarmarkWordFill } from 'react-icons/bs';

const tools = [
  {
    id: 'upscaler',
    title: 'Upscaler AI',
    description: 'Migliora le tue immagini con upscaling 2x in 8K. Veloce e naturale.',
    Icon: HiSparkles,
    href: '/upscaler',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  {
    id: 'jpg2pdf',
    title: 'JPG → PDF',
    description: 'Converti più immagini in un unico documento PDF.',
    Icon: BsFileEarmarkImageFill,
    href: '/pdf#jpg2pdf',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  {
    id: 'pdf2jpg',
    title: 'PDF → JPG',
    description: 'Estrai immagini JPG dai tuoi file PDF.',
    Icon: BsFileEarmarkPdfFill,
    href: '/pdf#pdf2jpg',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  {
    id: 'docx2pdf',
    title: 'WORD → PDF',
    description: 'Trasforma documenti Word in PDF professionali.',
    Icon: BsFileEarmarkWordFill,
    href: '/pdf#docx2pdf',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
  {
    id: 'pdf2docx',
    title: 'PDF → WORD',
    description: 'Converti PDF in documenti Word modificabili.',
    Icon: HiDocument,
    href: '/pdf#pdf2docx',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#fa709a'
  },
];

export default function HomePage() {
  return (
    <div className="home-wrap">
      <Head>
        <title>Tool Suite - Upscaler AI & PDF Converter</title>
        <meta name="description" content="Strumenti professionali per upscaling AI e conversione PDF" />
      </Head>
      
      <div className="bg-glow"></div>
      
      <header className="hero">
        <div className="hero-badge">
          <HiSparkles className="badge-icon" />
          <span>Powered by AI</span>
        </div>
        <h1 className="hero-title">Strumenti AI & Conversione</h1>
        <p className="hero-subtitle">Scegli lo strumento di cui hai bisogno. Veloce, professionale e gratuito.</p>
      </header>

      <div className="tools-grid">
        {tools.map(tool => {
          const IconComponent = tool.Icon;
          return (
            <Link key={tool.id} href={tool.href} className="tool-card">
              <div className="card-glow" style={{ background: tool.gradient }}></div>
              <div className="tool-icon-wrap">
                <div className="icon-bg" style={{ background: tool.gradient }}></div>
                <IconComponent className="tool-icon" style={{ color: tool.color }} />
              </div>
              <h2 className="tool-title">{tool.title}</h2>
              <p className="tool-desc">{tool.description}</p>
              <div className="tool-footer">
                <span className="tool-cta">Inizia ora</span>
                <HiArrowRight className="tool-arrow" style={{ color: tool.color }} />
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="home-footer">
        <p>Tutti gli strumenti sono gratuiti e rispettano la tua privacy.</p>
      </footer>

      <style jsx>{`
        .home-wrap {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
          min-height: 100vh;
        }
        .bg-glow {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 60%, rgba(167, 139, 250, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }
        .hero {
          text-align: center;
          margin-bottom: 64px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 24px;
          color: #a78bfa;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .badge-icon {
          width: 18px;
          height: 18px;
        }
        .hero-title {
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 800;
          margin: 0 0 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .hero-subtitle {
          font-size: clamp(16px, 2.5vw, 20px);
          color: #94a3b8;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        .tool-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 32px 28px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
          border: 2px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          opacity: 0;
          transition: opacity 0.4s;
          filter: blur(60px);
        }
        .tool-card:hover .card-glow {
            opacity: 0.12; }
          .tool-card:hover {
            transform: translateY(-4px);
            border-color: rgba(148, 163, 184, 0.4);
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
        }
        .tool-icon-wrap {
          position: relative;
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
        }
        .icon-bg {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          opacity: 0.15;
          transition: all 0.4s;
        }
        .tool-card:hover .icon-bg {
          opacity: 0.25;
          transform: scale(1.1) rotate(5deg);
        }
        .tool-icon {
          position: relative;
          width: 36px;
          height: 36px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.4s;
        }
        .tool-card:hover .tool-icon {
          transform: translate(-50%, -50%) scale(1.15) rotate(-5deg);
        }
        .tool-title {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 12px;
          position: relative;
          } 
          .tool-title { text-decoration: none; }
        .tool-desc {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 20px;
          flex: 1;
        }
        .tool-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        .tool-cta {
          font-size: 14px;
          font-weight: 600;
          color: #cbd5e1;
          transition: color 0.3s;
          } 
          .tool-cta { text-decoration: none; }
        .tool-card:hover .tool-cta {
          color: #f1f5f9;
        }
        .tool-arrow {
          width: 24px;
          height: 24px;
          transition: transform 0.4s;
        }
        .tool-card:hover .tool-arrow {
          transform: translateX(6px);
        }
        .home-footer {
          text-align: center;
          padding: 32px 0;
          color: #64748b;
          font-size: 14px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        .home-footer p {
          margin: 0;
        }
        @media (max-width: 640px) {
          .home-wrap {
            padding: 40px 16px;
          }
          .hero {
            margin-bottom: 48px;
          }
          .tools-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .tool-card {
            padding: 28px 24px;
          }
        }
      `}</style>
    </div>
  );
}
