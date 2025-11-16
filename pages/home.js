import Link from 'next/link';
import Head from 'next/head';

const tools = [
  {
    id: 'upscaler',
    title: 'Upscaler AI',
    description: 'Migliora le tue immagini con upscaling 2x in 8K. Veloce e naturale.',
    icon: '🖼️',
    href: '/upscaler',
    color: '#2563eb'
  },
  {
    id: 'jpg2pdf',
    title: 'JPG → PDF',
    description: 'Converti più immagini in un unico documento PDF.',
    icon: '📄',
    href: '/pdf#jpg2pdf',
    color: '#059669'
  },
  {
    id: 'pdf2jpg',
    title: 'PDF → JPG',
    description: 'Estrai immagini JPG dai tuoi file PDF.',
    icon: '🖼️',
    href: '/pdf#pdf2jpg',
    color: '#dc2626'
  },
  {
    id: 'docx2pdf',
    title: 'WORD → PDF',
    description: 'Trasforma documenti Word in PDF professionali.',
    icon: '📝',
    href: '/pdf#docx2pdf',
    color: '#7c3aed'
  },
  {
    id: 'pdf2docx',
    title: 'PDF → WORD',
    description: 'Converti PDF in documenti Word modificabili.',
    icon: '📋',
    href: '/pdf#pdf2docx',
    color: '#ea580c'
  },
];

export default function HomePage() {
  return (
    <div className="home-wrap">
      <Head>
        <title>Tool Suite - Upscaler AI & PDF Converter</title>
      </Head>
      
      <header className="hero">
        <h1 className="hero-title">Strumenti AI & Conversione</h1>
        <p className="hero-subtitle">Scegli lo strumento di cui hai bisogno</p>
      </header>

      <div className="tools-grid">
        {tools.map(tool => (
          <Link key={tool.id} href={tool.href} className="tool-card">
            <div className="tool-icon" style={{ color: tool.color }}>
              {tool.icon}
            </div>
            <h2 className="tool-title">{tool.title}</h2>
            <p className="tool-desc">{tool.description}</p>
            <div className="tool-arrow" style={{ color: tool.color }}>→</div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .home-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .hero {
          text-align: center;
          margin-bottom: 48px;
        }
        .hero-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          margin: 0 0 12px;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: clamp(16px, 2.5vw, 20px);
          color: #94a3b8;
          margin: 0;
        }
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .tool-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid #1f2a44;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .tool-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tool-card:hover {
          transform: translateY(-4px);
          border-color: #3b82f6;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
        }
        .tool-card:hover::before {
          opacity: 1;
        }
        .tool-icon {
          font-size: 48px;
          margin-bottom: 16px;
          transition: transform 0.3s;
        }
        .tool-card:hover .tool-icon {
          transform: scale(1.1);
        }
        .tool-title {
          font-size: 22px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 8px;
          position: relative;
        }
        .tool-desc {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 16px;
          flex: 1;
        }
        .tool-arrow {
          font-size: 24px;
          font-weight: 700;
          align-self: flex-end;
          transition: transform 0.3s;
        }
        .tool-card:hover .tool-arrow {
          transform: translateX(4px);
        }
        @media (max-width: 640px) {
          .home-wrap {
            padding: 24px 16px;
          }
          .hero {
            margin-bottom: 32px;
          }
          .tools-grid {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
