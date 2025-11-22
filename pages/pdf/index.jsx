import PdfConverter from '../../components/PdfConverter';

export default function PdfIndexPage() {
  return <PdfConverter initialActive="jpg2pdf" />;
}

// Disabilita pre-rendering per questa pagina
export async function getServerSideProps() {
  return {
    props: {},
  };
}

