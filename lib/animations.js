/**
 * Sistema centralizzato per le animazioni
 * Gestisce animazioni CSS e wrapper SSR-safe per framer-motion
 * 
 * Questo modulo fornisce:
 * - Wrapper SSR-safe per framer-motion (caricamento solo lato client)
 * - Hook per verificare se siamo lato client
 * - Varianti di animazione predefinite
 * - Utility per gestire prefers-reduced-motion
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'framer-motion';

// Static imports per evitare require.resolveWeak() in webpack
// Usiamo useIsClient per gestire SSR
const MotionDiv = motion.div;
const MotionComponent = motion;
const AnimatePresence = FramerAnimatePresence;

/**
 * Hook per verificare se siamo lato client
 */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
};

/**
 * Wrapper per motion.div con fallback SSR
 */
export const SafeMotionDiv = ({ children, ...props }) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <div {...props}>{children}</div>;
  }
  
  return <MotionDiv {...props}>{children}</MotionDiv>;
};

/**
 * Wrapper per AnimatePresence con fallback SSR
 */
export const SafeAnimatePresence = ({ children, ...props }) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <>{children}</>;
  }
  
  return <AnimatePresence {...props}>{children}</AnimatePresence>;
};

/**
 * Esporta i componenti motion per uso diretto (solo lato client)
 */
export { MotionComponent, AnimatePresence };

/**
 * Varianti di animazione predefinite per framer-motion
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

/**
 * Utility per gestire prefers-reduced-motion
 * Verifica se l'utente ha preferenze per movimento ridotto
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    // Fallback se matchMedia non è supportato
    return false;
  }
};

/**
 * Utility per disabilitare animazioni se l'utente preferisce movimento ridotto
 * Restituisce props di animazione ottimizzate in base alle preferenze utente
 */
export const getAnimationProps = (defaultProps) => {
  if (typeof window === 'undefined') {
    // SSR: restituisci props di base senza animazioni
    return {
      ...defaultProps,
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 }
    };
  }
  
  if (prefersReducedMotion()) {
    return {
      ...defaultProps,
      transition: { duration: 0.01 }
    };
  }
  
  return defaultProps;
};

