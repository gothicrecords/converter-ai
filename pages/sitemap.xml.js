import { tools } from '../lib/tools';
import { getAllConversionTools } from '../lib/conversionRegistry';

// Always use production domain - never use preview URLs in sitemap
const PRODUCTION_DOMAIN = 'https://megapixelsuite.com';
const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_DOMAIN;
const SUPPORTED_LOCALES = ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'];
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/home', priority: '0.95', changefreq: 'daily' },
  { path: '/tools', priority: '0.95', changefreq: 'daily' },
  { path: '/pdf', priority: '0.9', changefreq: 'daily' },
  { path: '/chat', priority: '0.85', changefreq: 'daily' },
  { path: '/pricing', priority: '0.85', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.75', changefreq: 'monthly' },
  { path: '/faq', priority: '0.75', changefreq: 'weekly' },
  { path: '/dashboard', priority: '0.7', changefreq: 'weekly' },
  { path: '/login', priority: '0.6', changefreq: 'monthly' },
  { path: '/signup', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];

// PDF conversion pages - Higher priority for SEO
const pdfPages = [
  { path: '/pdf/jpg2pdf', priority: '0.85', changefreq: 'daily' },
  { path: '/pdf/pdf2jpg', priority: '0.85', changefreq: 'daily' },
  { path: '/pdf/docx2pdf', priority: '0.85', changefreq: 'daily' },
  { path: '/pdf/pdf2docx', priority: '0.85', changefreq: 'daily' },
  { path: '/pdf/ppt2pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/pdf/pdf2pptx', priority: '0.8', changefreq: 'weekly' },
  { path: '/pdf/xls2pdf', priority: '0.8', changefreq: 'weekly' },
  { path: '/pdf/pdf2xlsx', priority: '0.8', changefreq: 'weekly' },
  { path: '/pdf/html2pdf', priority: '0.75', changefreq: 'weekly' },
  { path: '/pdf/pdf2pdfa', priority: '0.75', changefreq: 'weekly' },
  { path: '/pdf/pdf2html', priority: '0.75', changefreq: 'weekly' },
  { path: '/pdf/pdf2txt', priority: '0.75', changefreq: 'weekly' },
];

function generateUrlEntry(path, priority = '0.8', changefreq = 'weekly', lastmod = CURRENT_DATE) {
  return `
    <url>
      <loc>${EXTERNAL_DATA_URL}${path}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
}

function generateSiteMap(allTools) {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Static Pages -->`;

  // Add static pages (without duplicate locale entries that create invalid URLs)
  staticPages.forEach(page => {
    sitemap += generateUrlEntry(page.path, page.priority, page.changefreq);
  });

  // Add PDF conversion pages
  sitemap += `
  <!-- PDF Conversion Pages -->`;
  pdfPages.forEach(page => {
    sitemap += generateUrlEntry(page.path, page.priority, page.changefreq);
  });

  // Add AI tools pages with higher priority
  sitemap += `
  <!-- AI Tools Pages -->`;
  allTools.forEach(tool => {
    if (tool.href) {
      // Higher priority for main tools and popular tools
      let priority = tool.pro ? '0.9' : '0.85';
      let changefreq = 'daily';

      // Boost priority for popular tools
      const popularTools = ['rimozione-sfondo-ai', 'generazione-immagini-ai', 'upscaler'];
      if (popularTools.some(pop => tool.href.includes(pop))) {
        priority = '0.95';
        changefreq = 'daily';
      }

      sitemap += generateUrlEntry(tool.href, priority, changefreq);
    }
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

function SiteMap() {
  // getServerSideProps renderizzerà questa pagina
}

export async function getServerSideProps({ res }) {
  try {
    // Get all tools (AI tools + conversion tools)
    let conversionTools = [];
    try {
      if (typeof getAllConversionTools === 'function') {
        conversionTools = getAllConversionTools();
      }
    } catch (err) {
      console.warn('Error getting conversion tools:', err);
      conversionTools = [];
    }

    const rawTools = [...(tools || []), ...conversionTools];

    // Filter tools to only include core categories for the sitemap
    const coreCats = ['PDF', 'Documenti', 'Document', 'Testo', 'Text', 'Presentazioni', 'Presentation', 'Fogli di Calcolo', 'Spreadsheet'];

    const allTools = rawTools.filter(t => {
      if (coreCats.includes(t.category)) return true;
      const coreSlugs = ['ocr-avanzato-ai', 'riassunto-testo', 'chat'];
      if (t.href) {
        const slug = t.href.split('/').pop();
        return coreSlugs.includes(slug);
      }
      return false;
    });

    const sitemap = generateSiteMap(allTools);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/xml');
    res.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    res.end();
  }

  return {
    props: {},
  };
}

export default SiteMap;
