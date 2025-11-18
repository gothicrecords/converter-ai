import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PdfConverter = dynamic(() => import('../../components/PdfConverter'), { ssr: false });

const TOOL_META = {
  jpg2pdf: {
    title: 'JPG to PDF - Converti JPG in PDF | Best Upscaler IA',
    description: 'Converti immagini JPG in PDF ad alta qualità. Supporto batch, download e ZIP. Perfetto per archiviazione e condivisione.'
  },
  pdf2jpg: {
    title: 'PDF to JPG - Estrai immagini da PDF | Best Upscaler IA',
    description: 'Estrai immagini JPG dai tuoi PDF in pochi secondi, con conversione fedele e controllo della risoluzione.'
  },
  docx2pdf: {
    title: 'Word to PDF - Converti DOCX in PDF | Best Upscaler IA',
    description: 'Converti documenti Word (DOC/DOCX) in PDF mantenendo layout e formattazione.'
  },
  pdf2docx: {
    title: 'PDF to Word - Converti PDF in DOCX | Best Upscaler IA',
    description: 'Trasforma i tuoi PDF in documenti Word modificabili con l’estrazione intelligente del testo.'
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
