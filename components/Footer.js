import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>MegaPixelAI</h4>
          <p style={styles.footerDesc}>Strumenti AI professionali per creativi e professionisti.</p>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Prodotto</h4>
          <Link href="/home" style={styles.footerLink}>Strumenti</Link>
          <Link href="/#features" style={styles.footerLink}>Features</Link>
          <Link href="/pricing" style={styles.footerLink}>Pricing</Link>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Azienda</h4>
          <Link href="/about" style={styles.footerLink}>Chi siamo</Link>
          <Link href="/blog" style={styles.footerLink}>Blog</Link>
          <Link href="/contact" style={styles.footerLink}>Contatti</Link>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Legale</h4>
          <Link href="/privacy" style={styles.footerLink}>Privacy</Link>
          <Link href="/terms" style={styles.footerLink}>Termini</Link>
          <Link href="/cookies" style={styles.footerLink}>Cookie</Link>
        </div>
      </div>
      <div style={styles.enterpriseFooter}>
        <p style={{margin: 0, fontSize: '14px', opacity: 0.7}}>Enterprise-grade document analysis with complete privacy protection.</p>
      </div>
      <div style={styles.footerBottom}>
        <p style={styles.footerCopyright}>© 2025 MegaPixelAI. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
};

export default Footer;

const styles = {
  footer: {
    background: 'rgba(15, 23, 42, 0.6)',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
    padding: '60px 24px 24px',
    marginTop: 'auto'
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#e2e8f0',
    margin: '0 0 8px'
  },
  footerDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0
  },
  footerLink: {
    fontSize: '14px',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer'
  },
  enterpriseFooter: {
    textAlign: 'center',
    padding: '24px 24px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1'
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
    textAlign: 'center'
  },
  footerCopyright: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  }
};
