import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * DropdownPortal
 * Renders children into a portal (document.body) and positions it relative to an anchor
 * Props:
 * - anchorRef: ref to the element the dropdown should be anchored to
 * - open: boolean
 * - onClose: function
 * - children
 */
export default function DropdownPortal({ anchorRef, open, onClose, children, offset = 8, preferRight = false }) {
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
    function handle() {
      if (!anchorRef?.current || !elRef?.current) return;
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const dropdownRect = elRef.current.getBoundingClientRect();
      const topCandidate = anchorRect.bottom + offset;
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      let top,
          left = anchorRect.left;

      // Prefer to show below if there's enough space, otherwise above
      if (spaceBelow >= dropdownRect.height || spaceBelow >= spaceAbove) {
        top = Math.min(topCandidate, window.innerHeight - dropdownRect.height - 8);
      } else {
        // open above
        top = Math.max(anchorRect.top - dropdownRect.height - offset, 8);
      }

      // Fit horizontally
      if (left + dropdownRect.width > window.innerWidth - 8) {
        left = Math.max(window.innerWidth - dropdownRect.width - 8, 8);
      }

      if (preferRight) {
        // Align to right edge of anchor
        left = Math.max(anchorRect.right - dropdownRect.width, 8);
      }

      setStyle({ top: `${top}px`, left: `${left}px`, position: 'fixed', zIndex: 10050, visibility: 'visible' });
    }

    if (open) {
      handle();
      window.addEventListener('resize', handle);
      window.addEventListener('scroll', handle, true);
    }

    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [open, anchorRef, container, offset, preferRight]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (!container) return;
      // If clicked outside the portal and outside anchor
      if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
      if (elRef?.current && elRef.current.contains(e.target)) return;
      onClose && onClose();
    };

    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, anchorRef, container, onClose]);

  if (!container) return null;

  return createPortal(
    <div ref={elRef} style={style} className="dropdown-portal">
      {children}
    </div>,
    container
  );
}
