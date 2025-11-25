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

// Optimize images with lazy loading - improved performance
export function setupLazyImages() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Use requestIdleCallback for non-critical image loading
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      initLazyImages();
    }, { timeout: 2000 });
  } else {
    setTimeout(initLazyImages, 100);
  }
}

function initLazyImages() {
  const imageObserver = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img && img.dataset && img.dataset.src) {
          // Load image with priority hint
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.src = img.dataset.src;
          img.loading = 'lazy';
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          
          // Add fade-in animation
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.3s ease-in';
          img.onload = () => {
            img.style.opacity = '1';
          };
          
          if (imageObserver) {
            imageObserver.unobserve(img);
          }
        }
      }
    });
  }, {
    rootMargin: '50px', // Start loading 50px before image enters viewport
    threshold: 0.01,
  });

  if (!imageObserver) {
    return;
  }

  // Observe all images with data-src (native lazy loading fallback)
  try {
    const images = document.querySelectorAll('img[data-src]:not([loading="eager"])');
    images.forEach((img) => {
      // Set width and height if available to prevent layout shift
      if (img.dataset.width && img.dataset.height) {
        img.style.aspectRatio = `${img.dataset.width} / ${img.dataset.height}`;
      }
      
      if (img && imageObserver) {
        imageObserver.observe(img);
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error setting up lazy images:', error);
    }
  }
}

// Optimize Core Web Vitals - enhanced version
export function optimizeCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // Prevent layout shift for images with aspect ratio
  const images = document.querySelectorAll('img:not([style*="aspect-ratio"])');
  images.forEach((img) => {
    if (!img.complete && img.naturalWidth && img.naturalHeight) {
      // Set aspect ratio to prevent layout shift
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      img.style.aspectRatio = `${aspectRatio}`;
      img.style.width = img.style.width || 'auto';
      img.style.height = img.style.height || 'auto';
    }
    
    // Add loading="lazy" to images that don't have it
    if (!img.hasAttribute('loading') && !img.closest('[data-above-fold]')) {
      img.loading = 'lazy';
    }
  });

  // Optimize font loading with display swap
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
  
  // Preload critical resources
  preloadCriticalResources();
}

function preloadCriticalResources() {
  if (typeof document === 'undefined') return;
  
  // Preload critical CSS (if any)
  const criticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media])');
  criticalStyles.forEach(link => {
    if (link.href && !link.href.startsWith('data:')) {
      link.rel = 'preload';
      link.as = 'style';
    }
  });
  
  // Preload above-the-fold images
  const aboveFoldImages = document.querySelectorAll('img[data-above-fold="true"]');
  aboveFoldImages.forEach(img => {
    if (img.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      if (img.srcset) {
        link.imagesrcset = img.srcset;
      }
      document.head.appendChild(link);
    }
  });
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

// Performance monitoring utility
export function measureWebVitals() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    // Measure Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Browser doesn't support LCP
      }
      
      // Measure First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Browser doesn't support FID
      }
      
      // Measure Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Browser doesn't support CLS
      }
    }
  } catch (error) {
    // Silently fail in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance monitoring failed:', error);
    }
  }
}

// Optimize animation performance
export function optimizeAnimations() {
  if (typeof window === 'undefined') return;
  
  // Use CSS will-change for animated elements
  const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="transition"]');
  animatedElements.forEach((el) => {
    if (el && el.style) {
      el.style.willChange = 'transform, opacity';
      
      // Remove will-change after animation to free resources
      if (el.addEventListener) {
        el.addEventListener('animationend', () => {
          el.style.willChange = 'auto';
        }, { once: true });
      }
    }
  });
}

// Mobile-specific optimizations
export function optimizeMobilePerformance() {
  if (typeof window === 'undefined') return;
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  if (!isMobile) return;
  
  // Reduce animation complexity on mobile
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
  }
  
  // Optimize touch events
  let touchStartTime = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartTime = performance.now();
  }, { passive: true });
  
  // Prevent double-tap zoom on buttons
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // Optimize scroll performance
  let ticking = false;
  const optimizeScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Scroll optimizations here
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', optimizeScroll, { passive: true });
}

// Virtual scrolling helper for long lists (React hook - use in components)
// This is a utility function, actual implementation should be in a React component
export function createVirtualScrollConfig(items, itemHeight, containerHeight, scrollTop) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return { 
    visibleItems, 
    startIndex, 
    endIndex,
    offsetY,
    totalHeight: items.length * itemHeight
  };
}

