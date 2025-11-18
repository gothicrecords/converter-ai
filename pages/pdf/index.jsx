import dynamic from 'next/dynamic';

import dynamic from 'next/dynamic';

const PdfConverter = dynamic(() => import('../../components/PdfConverter'), { ssr: false });

export default function PdfIndexPage() {
  return <PdfConverter initialActive="jpg2pdf" />;
}

// Disabilita pre-rendering per questa pagina
export async function getServerSideProps() {
  return {
    props: {},
  };
}

