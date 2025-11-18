import { tools } from '../lib/tools';

const EXTERNAL_DATA_URL = 'https://www.best-upscaler-ia.com';

function generateSiteMap(tools) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--Pagine statiche-->
     <url>
       <loc>${EXTERNAL_DATA_URL}</loc>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/upscaler</loc>
     </url>
     <url>
        <loc>${EXTERNAL_DATA_URL}/pdf</loc>
     </url>
    <!-- PDF tool pages for SEO -->
    <url>
      <loc>${EXTERNAL_DATA_URL}/pdf/jpg2pdf</loc>
    </url>
    <url>
      <loc>${EXTERNAL_DATA_URL}/pdf/pdf2jpg</loc>
    </url>
    <url>
      <loc>${EXTERNAL_DATA_URL}/pdf/docx2pdf</loc>
    </url>
    <url>
      <loc>${EXTERNAL_DATA_URL}/pdf/pdf2docx</loc>
    </url>
     <!--Pagine dinamiche degli strumenti-->
     ${tools
       .map(({ href }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}${href}`}</loc>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps renderizzerà questa pagina
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSiteMap(tools);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
