import Link from 'next/link';
import React from 'react';
import { useTranslation } from '../lib/i18n';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>MegaPixelAI</h4>
          <p style={styles.footerDesc}>{t('footer.description')}</p>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>{t('footer.product')}</h4>
          <Link href="/home" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.tools')}</Link>
          <Link href="/#features" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.features')}</Link>
          <Link href="/pricing" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.pricing')}</Link>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>{t('footer.company')}</h4>
          <Link href="/about" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.aboutUs')}</Link>
          <Link href="/blog" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.blog')}</Link>
          <Link href="/contact" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.contact')}</Link>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>{t('footer.legal')}</h4>
          <Link href="/privacy" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.privacy')}</Link>
          <Link href="/terms" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.terms')}</Link>
          <Link href="/cookies" style={styles.footerLink} onMouseEnter={(e) => {e.target.style.color = '#667eea'; e.target.style.transform = 'translateX(4px)';}} onMouseLeave={(e) => {e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)';}}>{t('footer.cookies')}</Link>
        </div>
      </div>
      <div style={styles.enterpriseFooter}>
        <p style={{margin: 0, fontSize: '14px', opacity: 0.7}}>{t('footer.description')}</p>
      </div>
      <div style={styles.footerBottom}>
        <p style={styles.footerCopyright}>© 2025 MegaPixelAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

const styles = {
  footer: {
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 26, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(102, 126, 234, 0.3)',
    padding: '50px 24px 24px',
    marginTop: 'auto',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.1)'
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
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    padding: '4px 0',
    position: 'relative',
    display: 'inline-block'
  },
  footerLinkHover: {
    color: '#667eea',
    transform: 'translateX(4px)'
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
