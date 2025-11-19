/**
 * Performance optimization utilities
 * Helps with Core Web Vitals and overall site performance
 */

// Debounce function for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(callback, options = {}) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Preload critical resources
export function preloadResource(href, as, crossorigin = false) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

// Prefetch route
export function prefetchRoute(href) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// Optimize images with lazy loading
export function setupLazyImages() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const imageObserver = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img && img.dataset && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          if (imageObserver) {
            imageObserver.unobserve(img);
          }
        }
      }
    });
  });

  if (!imageObserver) {
    return;
  }

  // Observe all images with data-src
  try {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      if (img && imageObserver) {
        imageObserver.observe(img);
      }
    });
  } catch (error) {
    console.warn('Error setting up lazy images:', error);
  }
}

// Optimize Core Web Vitals
export function optimizeCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // Prevent layout shift for images
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.complete) {
      img.style.minHeight = img.offsetHeight + 'px';
      img.onload = () => {
        img.style.minHeight = '';
      };
    }
  });

  // Optimize font loading
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}

// Request Idle Callback polyfill
export function requestIdleCallback(callback, options = {}) {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback
  const timeout = options.timeout || 2000;
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 5,
    });
  }, timeout);
}

// Cancel Idle Callback
export function cancelIdleCallback(id) {
  if (typeof window === 'undefined') return;
  
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

// Measure performance
export function measurePerformance(name, fn) {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

// Batch DOM updates
export function batchDOMUpdates(updates) {
  if (typeof window === 'undefined' || !('requestAnimationFrame' in window)) {
    updates.forEach(update => update());
    return;
  }

  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

