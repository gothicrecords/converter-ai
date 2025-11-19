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
  const [container] = useState(() => typeof document !== 'undefined' ? document.createElement('div') : null);
  const [style, setStyle] = useState({ visibility: 'hidden' });
  const elRef = useRef(null);

  useEffect(() => {
    if (!container) return;
    document.body.appendChild(container);
    return () => {
      if (document.body.contains(container)) document.body.removeChild(container);
    };
  }, [container]);

  useEffect(() => {
    if (!open) {
      setStyle({ visibility: 'hidden', position: 'fixed', top: 0, left: 0, zIndex: 10050 });
      return;
    }

    if (typeof window === 'undefined' || !anchorEl) return;

    let active = true;
    let rafId = null;

    const updatePosition = () => {
      if (!active || !anchorEl || !elRef.current) return;
      
      const anchorRect = anchorEl.getBoundingClientRect();
      const dropdownRect = elRef.current.getBoundingClientRect();
      
      // Se anchorRect ha dimensioni 0, l'elemento anchor non è ancora pronto
      if (anchorRect.width === 0 || anchorRect.height === 0) {
        rafId = window.requestAnimationFrame(updatePosition);
        return;
      }
      
      // Se il dropdown non ha ancora dimensioni reali, aspetta un frame
      if (dropdownRect.width === 0 || dropdownRect.height === 0) {
        rafId = window.requestAnimationFrame(updatePosition);
        return;
      }
      
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      // Calcola la posizione verticale
      let top = anchorRect.bottom + offset;
      if (spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height) {
        top = anchorRect.top - dropdownRect.height - offset;
      }
      top = Math.min(Math.max(top, MARGIN), Math.max(window.innerHeight - dropdownRect.height - MARGIN, MARGIN));

      // Calcola la posizione orizzontale: allinea il bordo sinistro del dropdown al bordo sinistro del bottone
      let left = anchorRect.left;
      
      // Se il dropdown esce dallo schermo a destra, spostalo a sinistra
      if (left + dropdownRect.width > window.innerWidth - MARGIN) {
        left = window.innerWidth - dropdownRect.width - MARGIN;
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
  }, [open, anchorEl, offset, preferRight]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (anchorEl && anchorEl.contains(e.target)) return;
      if (elRef.current && elRef.current.contains(e.target)) return;
      onClose && onClose();
    };

    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, anchorEl, onClose]);

  if (!container) return null;

  return createPortal(
    <div ref={elRef} style={style} className="dropdown-portal">
      {children}
    </div>,
    container
  );
}
