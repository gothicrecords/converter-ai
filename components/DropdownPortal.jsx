import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MARGIN = 8;

/**
 * DropdownPortal
 * Renders children into a portal (document.body) and positions it relative to an anchor element.
 * Props:
 * - anchorEl: DOM element that anchors the dropdown
 * - open: boolean flag to show/hide the portal
 * - onClose: callback invoked when clicking outside
 * - children: dropdown content
 */
export default function DropdownPortal({ anchorEl, open, onClose, children, offset = 8, preferRight = false }) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState(null);
  const [style, setStyle] = useState({ 
    visibility: 'hidden', 
    position: 'fixed', 
    top: '-9999px', 
    left: '-9999px',
    zIndex: 10050
  });
  const elRef = useRef(null);

  // Gestisci il mounting lato client per evitare errori di hydration
  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      const portalContainer = document.createElement('div');
      setContainer(portalContainer);
      document.body.appendChild(portalContainer);
      return () => {
        if (document.body.contains(portalContainer)) {
          document.body.removeChild(portalContainer);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    if (!open) {
      setStyle({ visibility: 'hidden', position: 'fixed', top: '-9999px', left: '-9999px', zIndex: 10050 });
      return;
    }

    if (!anchorEl) return;

    // Renderizza il dropdown fuori schermo ma visibile per poter essere misurato
    setStyle({
      visibility: 'visible',
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      zIndex: 10050
    });

    let active = true;
    let rafId = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;

    const updatePosition = () => {
      if (!active || !anchorEl || !elRef.current) return;
      
      const anchorRect = anchorEl.getBoundingClientRect();
      const dropdownRect = elRef.current.getBoundingClientRect();
      
      // Se anchorRect ha dimensioni 0, l'elemento anchor non è ancora pronto
      if ((anchorRect.width === 0 || anchorRect.height === 0) && retryCount < MAX_RETRIES) {
        retryCount++;
        rafId = window.requestAnimationFrame(updatePosition);
        return;
      }
      
      // Se il dropdown non ha ancora dimensioni reali, aspetta un frame (ma con limite)
      if ((dropdownRect.width === 0 || dropdownRect.height === 0) && retryCount < MAX_RETRIES) {
        retryCount++;
        rafId = window.requestAnimationFrame(updatePosition);
        return;
      }
      
      // Usa le dimensioni reali o fallback
      const computedWidth = dropdownRect.width || 280;
      const computedHeight = dropdownRect.height || 100;
      
      retryCount = 0; // reset retry count quando abbiamo dimensioni valide
      
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      // Calcola la posizione verticale
      let top = anchorRect.bottom + offset;
      if (spaceBelow < computedHeight && spaceAbove > computedHeight) {
        top = anchorRect.top - computedHeight - offset;
      }
      top = Math.min(Math.max(top, MARGIN), Math.max(window.innerHeight - computedHeight - MARGIN, MARGIN));

      // Calcola la posizione orizzontale
      let left;
      if (preferRight) {
        // Allinea il bordo destro del dropdown al bordo destro del bottone
        left = anchorRect.right - computedWidth;
      } else {
        // Allinea il bordo sinistro del dropdown al bordo sinistro del bottone
        left = anchorRect.left;
      }
      
      // Se il dropdown esce dallo schermo a destra, spostalo a sinistra
      if (left + computedWidth > window.innerWidth - MARGIN) {
        left = window.innerWidth - computedWidth - MARGIN;
      }
      
      // Se il dropdown esce dallo schermo a sinistra, allinealo al margine sinistro
      if (left < MARGIN) {
        left = MARGIN;
      }

      setStyle({
        top: `${top}px`,
        left: `${left}px`,
        position: 'fixed',
        zIndex: 10050,
        visibility: 'visible'
      });
    };

    // Aspetta un frame per assicurarsi che il DOM sia pronto
    rafId = window.requestAnimationFrame(() => {
      rafId = window.requestAnimationFrame(updatePosition);
    });

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      active = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorEl, offset, preferRight, mounted]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const onDocClick = (e) => {
      if (!open) return;
      
      const target = e.target;
      
      // Non chiudere se si clicca sull'elemento anchor
      if (anchorEl && anchorEl.contains(target)) return;
      
      // Se si clicca su un link, non fare nulla (lascia che navighi)
      if (target.closest('a')) return;
      
      // Non chiudere se si clicca all'interno del dropdown
      if (elRef.current && elRef.current.contains(target)) {
        return;
      }
      
      // Chiudi solo se si clicca fuori
      onClose && onClose();
    };

    if (open) {
      document.addEventListener('click', onDocClick);
    }
    return () => document.removeEventListener('click', onDocClick);
  }, [open, anchorEl, onClose]);

  // Non renderizzare nulla durante SSR o se il container non è ancora montato
  if (!mounted || !container || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div ref={elRef} style={style} className="dropdown-portal">
      {children}
    </div>,
    container
  );
}
