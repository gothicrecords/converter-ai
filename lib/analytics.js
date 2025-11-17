// Google Analytics 4 Integration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

// Verifica se GA è abilitato
export const isGAEnabled = () => {
    return typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID !== 'G-XXXXXXXXXX';
};

// Invia pageview a GA4
export const pageview = (url) => {
    if (isGAEnabled()) {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

// Invia evento custom a GA4
export const event = ({ action, category, label, value }) => {
    if (isGAEnabled()) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Eventi predefiniti per gli strumenti
export const trackToolUsage = (toolName, action = 'use') => {
    event({
        action: action,
        category: 'Tool Usage',
        label: toolName,
    });
};

export const trackConversion = (conversionType, value = 0) => {
    event({
        action: 'conversion',
        category: 'Conversion',
        label: conversionType,
        value: value,
    });
};

export const trackSignup = (method = 'email') => {
    event({
        action: 'sign_up',
        category: 'User',
        label: method,
    });
};

export const trackLogin = (method = 'email') => {
    event({
        action: 'login',
        category: 'User',
        label: method,
    });
};

export const trackUpgrade = (plan = 'pro') => {
    event({
        action: 'upgrade',
        category: 'Revenue',
        label: plan,
        value: plan === 'pro' ? 19 : 0,
    });
};

export const trackDownload = (fileType, toolName) => {
    event({
        action: 'download',
        category: 'Engagement',
        label: `${toolName} - ${fileType}`,
    });
};

export const trackError = (errorMessage, errorLocation) => {
    event({
        action: 'error',
        category: 'Error',
        label: `${errorLocation}: ${errorMessage}`,
    });
};

// Performance tracking
export const trackPerformance = (metric, value) => {
    event({
        action: 'performance',
        category: 'Performance',
        label: metric,
        value: Math.round(value),
    });
};
