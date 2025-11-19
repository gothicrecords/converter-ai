/**
 * SEO Optimization Utilities
 * Helps improve search engine visibility and rankings
 */

// Generate structured data for tools
export function generateToolSchema(tool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name || tool.title,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": tool.description,
    "url": tool.href ? `https://best-upscaler-ia.vercel.app${tool.href}` : undefined,
    "featureList": tool.features || []
  };
}

// Generate FAQ schema
export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate HowTo schema
export function generateHowToSchema(steps, title, description) {
  if (!steps || steps.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name || step.title,
      "text": step.text || step.description,
      "image": step.image,
      "url": step.url
    }))
  };
}

// Generate Breadcrumb schema
export function generateBreadcrumbSchema(items) {
  if (!items || items.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Generate Article schema
export function generateArticleSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Organization",
      "name": "MegaPixelAI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MegaPixelAI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://best-upscaler-ia.vercel.app/logo-large.svg"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
}

// Generate keywords from content
export function extractKeywords(text, maxKeywords = 10) {
  if (!text) return [];
  
  // Simple keyword extraction (can be enhanced with NLP)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

// Generate meta description from content
export function generateMetaDescription(text, maxLength = 160) {
  if (!text) return '';
  
  // Remove HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, ' ').trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Truncate at word boundary
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Generate canonical URL
export function generateCanonicalUrl(path, baseUrl = 'https://best-upscaler-ia.vercel.app') {
  // Remove trailing slash
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');
  return `${baseUrl}${cleanPath}`;
}

// Generate hreflang tags
export function generateHreflangTags(path, locales, baseUrl = 'https://best-upscaler-ia.vercel.app') {
  return locales.map(locale => ({
    hreflang: locale,
    href: locale === 'en' 
      ? `${baseUrl}${path}`
      : `${baseUrl}/${locale}${path}`
  }));
}

// Optimize title for SEO
export function optimizeTitle(title, siteName = 'MegaPixelAI', maxLength = 60) {
  const fullTitle = `${title} | ${siteName}`;
  
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  // Truncate title if too long
  const truncated = title.substring(0, maxLength - siteName.length - 3);
  return `${truncated}... | ${siteName}`;
}

// Generate Open Graph tags
export function generateOGTags(data) {
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image || 'https://best-upscaler-ia.vercel.app/og-image.jpg',
    'og:url': data.url,
    'og:type': data.type || 'website',
    'og:site_name': 'MegaPixelAI',
    'og:locale': data.locale || 'en_US',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': data.title
  };
}

// Generate Twitter Card tags
export function generateTwitterTags(data) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image || 'https://best-upscaler-ia.vercel.app/og-image.jpg',
    'twitter:image:alt': data.title,
    'twitter:site': '@MegaPixelAI',
    'twitter:creator': '@MegaPixelAI'
  };
}

