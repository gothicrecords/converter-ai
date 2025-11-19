/**
 * Hook per gestire animazioni CSS in modo SSR-safe
 * Applica le classi di animazione solo lato client per evitare problemi di hydration
 */

import { useEffect, useState } from 'react';

/**
 * Hook per applicare animazioni solo dopo il mount lato client
 * @param {boolean} enabled - Se true, abilita le animazioni
 * @returns {boolean} - True se le animazioni possono essere applicate
 */
export function useAnimation(enabled = true) {
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      // Piccolo delay per assicurarsi che il DOM sia pronto
      const timer = setTimeout(() => {
        setCanAnimate(true);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return canAnimate;
}

/**
 * Hook per applicare animazioni con delay basato su data-delay attribute
 */
export function useStaggeredAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
      
      // Applica animazioni con delay basato su data-delay
      const animatedElements = document.querySelectorAll('[data-delay]');
      animatedElements.forEach((el) => {
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        if (delay > 0) {
          el.style.animationDelay = `${delay}ms`;
        }
      });
    }
  }, []);

  return mounted;
}

