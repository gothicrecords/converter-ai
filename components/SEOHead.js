import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SEOHead({ 
    title, 
    description, 
    canonical,
    toolName,
    toolCategory,
    keywords = [],
    image,
    type = 'website',
    locale,
    alternateLocales = [],
    faqItems = [],
    howToSteps = [],
    articleData = null,
    videoData = null
}) {
    const router = useRouter();
    const siteName = 'MegaPixelAI';
    const siteUrl =
        process.env.NEXT_PUBLIC_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const currentLocale = locale || router?.locale || 'en';
    
    // Fallback per evitare che appaiano le chiavi di traduzione
    const safeTitle = title && !title.startsWith('seo.') ? title : 'Strumenti AI Professionali';
    const safeDescription = description && !description.startsWith('seo.') ? description : 'Piattaforma all-in-one con strumenti AI professionali';
    
    const fullTitle = `${safeTitle} | ${siteName}`;
    const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
    const ogImage = image || `${siteUrl}/og-image.jpg`;

    // Supported locales
    const supportedLocales = ['en', 'it', 'es', 'fr', 'de', 'pt', 'ru', 'ja', 'zh', 'ar', 'hi', 'ko'];
    
    // Generate hreflang tags for all supported locales
    const generateHreflangTags = () => {
        const tags = [];
        const basePath = canonical || '/';
        
        // Add current locale
        tags.push(
            <link key={`hreflang-${currentLocale}`} rel="alternate" hrefLang={currentLocale} href={fullUrl} />
        );
        
        // Add x-default (usually English or main locale)
        tags.push(
            <link key="hreflang-x-default" rel="alternate" hrefLang="x-default" href={`${siteUrl}${basePath}`} />
        );
        
        // Add alternate locales
        supportedLocales.forEach(loc => {
            if (loc !== currentLocale) {
                const localePath = loc === 'en' ? basePath : `/${loc}${basePath}`;
                tags.push(
                    <link key={`hreflang-${loc}`} rel="alternate" hrefLang={loc} href={`${siteUrl}${localePath}`} />
                );
            }
        });
        
        return tags;
    };

    // Enhanced Structured Data
    const structuredData = [
        // Organization Schema
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "url": siteUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo-large.svg`,
                "width": 512,
                "height": 512
            },
            "description": "Professional AI tools platform for image upscaling, PDF conversion, OCR, background removal, image generation, and more",
            "foundingDate": "2024",
            "sameAs": [
                // Add social media links if available
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": supportedLocales,
                "areaServed": "Worldwide"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
            }
        },
        // WebSite Schema
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": siteUrl,
            "description": "Free AI-powered tools for image upscaling, PDF conversion, OCR, background removal, and more",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            },
            "inLanguage": supportedLocales,
            "publisher": {
                "@type": "Organization",
                "name": siteName
            }
        }
    ];

    // Add SoftwareApplication schema if toolName is provided
    if (toolName) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": toolName,
            "applicationCategory": toolCategory || "MultimediaApplication",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
            },
            "operatingSystem": "Web",
            "description": description,
            "url": fullUrl,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
            },
            "featureList": [
                "AI-powered processing",
                "High-quality output",
                "Fast processing",
                "Secure and private"
            ]
        });
    }

    // BreadcrumbList if canonical path has multiple segments
    if (canonical && canonical.split('/').filter(Boolean).length > 1) {
        const pathSegments = canonical.split('/').filter(Boolean);
        const breadcrumbItems = pathSegments.map((segment, index) => {
            const path = '/' + pathSegments.slice(0, index + 1).join('/');
            return {
                "@type": "ListItem",
                "position": index + 1,
                "name": segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                "item": `${siteUrl}${path}`
            };
        });
        
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": siteUrl
                },
                ...breadcrumbItems
            ]
        });
    }

    // FAQ Schema for AI crawlers
    if (faqItems && faqItems.length > 0) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        });
    }

    // HowTo Schema for step-by-step guides
    if (howToSteps && howToSteps.length > 0) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": title,
            "description": description,
            "step": howToSteps.map((step, index) => ({
                "@type": "HowToStep",
                "position": index + 1,
                "name": step.name,
                "text": step.text,
                "image": step.image || ogImage,
                "url": step.url || fullUrl
            }))
        });
    }

    // Article Schema for blog posts and tool pages
    if (articleData) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": ogImage,
            "author": {
                "@type": "Organization",
                "name": siteName
            },
            "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${siteUrl}/logo-large.svg`
                }
            },
            ...(articleData.datePublished ? { "datePublished": articleData.datePublished } : {}),
            ...(articleData.dateModified ? { "dateModified": articleData.dateModified } : {}),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": fullUrl
            },
            "inLanguage": currentLocale
        });
    }

    // Video Schema if video data is provided
    if (videoData) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": title,
            "description": description,
            "thumbnailUrl": videoData.thumbnailUrl || ogImage,
            ...(videoData.uploadDate ? { "uploadDate": videoData.uploadDate } : {}),
            "duration": videoData.duration,
            "contentUrl": videoData.contentUrl,
            "embedUrl": videoData.embedUrl
        });
    }

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={safeDescription} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
            
            {/* Geo-targeting and Language */}
            <meta name="geo.region" content="IT" />
            <meta name="geo.placename" content="Italy" />
            <meta name="language" content={currentLocale} />
            <meta httpEquiv="content-language" content={currentLocale} />
            
            {/* Canonical */}
            {canonical && <link rel="canonical" href={fullUrl} />}
            
            {/* Sitemap */}
            <link rel="sitemap" type="application/xml" href={`${siteUrl}/sitemap.xml`} />
            
            {/* Hreflang Tags for International SEO */}
            {generateHreflangTags()}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={safeDescription} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:locale" content={currentLocale.replace('-', '_')} />
            {supportedLocales.filter(l => l !== currentLocale).map(loc => (
                <meta key={`og-locale-${loc}`} property="og:locale:alternate" content={loc.replace('-', '_')} />
            ))}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={safeDescription} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:site" content="@MegaPixelAI" />
            <meta name="twitter:creator" content="@MegaPixelAI" />

            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="author" content={siteName} />
            <meta name="copyright" content={siteName} />
            <meta name="revisit-after" content="7 days" />
            <meta name="distribution" content="global" />
            <meta name="rating" content="general" />
            <meta name="application-name" content={siteName} />
            <meta name="generator" content="Next.js" />
            
            {/* AI-Friendly Meta Tags */}
            <meta name="AI-friendly" content="true" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="apple-itunes-app" content="app-id=" />
            
            {/* Enhanced SEO Meta Tags */}
            <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="slurp" content="index, follow" />
            <meta name="duckduckbot" content="index, follow" />
            
            {/* Rich Snippets Support */}
            {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
                <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
            )}
            {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
                <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION} />
            )}
            
            {/* Content Type and Encoding */}
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            
            {/* Additional Open Graph for AI */}
            <meta property="og:type" content={type} />
            {type === 'article' && articleData && (
                <>
                    {articleData.datePublished && (
                        <meta property="article:published_time" content={articleData.datePublished} />
                    )}
                    {articleData.dateModified && (
                        <meta property="article:modified_time" content={articleData.dateModified} />
                    )}
                    {articleData.tags && articleData.tags.map((tag, i) => (
                        <meta key={`article-tag-${i}`} property="article:tag" content={tag} />
                    ))}
                </>
            )}
            
            {/* Mobile Optimization */}
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            
            {/* Theme and Colors */}
            <meta name="theme-color" content="#667eea" />
            <meta name="msapplication-TileColor" content="#667eea" />
            
            {/* Structured Data - Multiple Schemas */}
            {structuredData.map((schema, index) => (
                <script
                    key={`structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </Head>
    );
}
