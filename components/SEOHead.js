import Head from 'next/head';

export default function SEOHead({ 
    title, 
    description, 
    canonical,
    toolName,
    toolCategory,
    keywords = []
}) {
    const siteName = 'MegaPixelAI';
    const siteUrl = 'https://best-upscaler-ia.vercel.app';
    const fullTitle = `${title} | ${siteName}`;
    const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

    const structuredData = toolName ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": toolName,
        "applicationCategory": toolCategory || "MultimediaApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "operatingSystem": "Web",
        "description": description,
        "url": fullUrl,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        }
    } : null;

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
            
            {/* Canonical */}
            {canonical && <link rel="canonical" href={fullUrl} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={`${siteUrl}/og-image.jpg`} />

            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="Italian" />
            <meta name="author" content={siteName} />

            {/* Structured Data */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}
        </Head>
    );
}
