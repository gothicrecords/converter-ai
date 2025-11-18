import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PdfConverter = dynamic(() => import('../../components/PdfConverter'), { ssr: false });

const TOOL_META = {
  jpg2pdf: {
    title: 'JPG to PDF - Converti JPG in PDF | Best Upscaler IA',
    description: 'Converti immagini JPG in PDF ad alta qualità. Supporto batch e ZIP.'
  },
  pdf2jpg: {
    title: 'PDF to JPG - Estrai immagini da PDF | Best Upscaler IA',
    description: 'Converti PDF in immagini JPG in pochi secondi, con qualità controllata.'
  },
  docx2pdf: {
    title: 'Word to PDF - Converti DOCX in PDF | Best Upscaler IA',
    description: 'Converti i documenti in PDF mantenendo layout e formattazione.'
  },
  ppt2pdf: {
    title: 'PowerPoint to PDF - Converti PPT/PPTX in PDF | Best Upscaler IA',
    description: 'Converti presentazioni PowerPoint (PPT/PPTX) in PDF preservando layout e grafica.'
  },
  xls2pdf: {
    title: 'Excel to PDF - Converti XLS/XLSX in PDF | Best Upscaler IA',
    description: 'Converti fogli Excel (XLS/XLSX) in PDF ottimizzando tabelle e grafici.'
  },
  html2pdf: {
    title: 'HTML to PDF - Converti HTML/URL in PDF | Best Upscaler IA',
    description: 'Trasforma file HTML o URL in PDF con rendering accurato.'
  },
  pdf2pptx: {
    title: 'PDF to PowerPoint - Converti PDF in PPTX | Best Upscaler IA',
    description: 'Converti PDF in presentazioni PowerPoint modificabili (PPTX).'
  },
  pdf2xlsx: {
    title: 'PDF to Excel - Converti PDF in XLSX | Best Upscaler IA',
    description: "Estrai tabelle dai PDF in fogli Excel (XLSX) pronti all'analisi."
  },
  pdf2pdfa: {
    title: 'PDF to PDF/A - Conformità archiviazione | Best Upscaler IA',
    description: "Converti PDF in PDF/A conforme per l'archiviazione a lungo termine."
  },
  pdf2docx: {
    title: 'PDF to Word - Converti PDF in DOCX | Best Upscaler IA',
    description: 'Converti PDF in documenti Word modificabili (DOCX).'
  }
}

export default function PdfToolPage({ initialActive }){
  const router = useRouter();
  const meta = TOOL_META[initialActive] || TOOL_META.jpg2pdf;

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <link rel="canonical" href={`https://www.best-upscaler-ia.com/pdf/${initialActive}`} />
      </Head>
      <PdfConverter initialActive={initialActive} seoTitle={meta.title} seoDescription={meta.description} />
    </>
  );
}

export function getStaticPaths(){
  const slugs = Object.keys(TOOL_META);
  const paths = slugs.map(s => ({ params: { slug: s } }));
  return { paths, fallback: false };
}

export function getStaticProps({ params }){
  const slug = params.slug || 'jpg2pdf';
  return { props: { initialActive: slug } };
}
