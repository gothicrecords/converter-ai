// ============================================
// COMPREHENSIVE ANALYTICS SYSTEM
// ============================================
// Google Analytics 4, Google Tag Manager, Vercel Analytics
// Web Vitals, Custom Events, Error Tracking

// ============================================
// CONFIGURATION
// ============================================
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';
export const ENABLE_ANALYTICS = process.env.NODE_ENV === 'production';

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const isGAEnabled = () => {
    return typeof window !== 'undefined' && 
           window.gtag && 
           GA_TRACKING_ID !== 'G-XXXXXXXXXX' &&
           ENABLE_ANALYTICS;
};

export const isGTMEnabled = () => {
    return typeof window !== 'undefined' && 
           window.dataLayer && 
           GTM_ID !== 'GTM-XXXXXXX' &&
           ENABLE_ANALYTICS;
};

// Get user properties for enhanced tracking
const getUserProperties = () => {
    if (typeof window === 'undefined') return {};
    
    return {
        screen_resolution: `${window.screen?.width}x${window.screen?.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        user_agent: navigator.userAgent,
        language: navigator.language || 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'direct',
        page_url: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
    };
};

// ============================================
// PAGEVIEW TRACKING
// ============================================
export const pageview = (url) => {
    if (!ENABLE_ANALYTICS) return;
    
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    
    // Google Analytics 4
    if (isGAEnabled()) {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
            page_location: fullUrl,
            page_title: document.title,
            ...getUserProperties(),
        });
    }
    
    // Google Tag Manager
    if (isGTMEnabled()) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'page_view',
            page_path: url,
            page_location: fullUrl,
            page_title: document.title,
            ...getUserProperties(),
        });
    }
};

// ============================================
// EVENT TRACKING (Enhanced)
// ============================================
export const event = ({ 
    action, 
    category, 
    label, 
    value,
    items = [],
    currency = 'EUR',
    custom_parameters = {}
}) => {
    if (!ENABLE_ANALYTICS) return;
    
    const eventData = {
        event_category: category,
        event_label: label,
        value: value,
        currency: currency,
        ...getUserProperties(),
        ...custom_parameters,
    };
    
    // Google Analytics 4
    if (isGAEnabled()) {
        window.gtag('event', action, {
            ...eventData,
            items: items.length > 0 ? items : undefined,
        });
    }
    
    // Google Tag Manager
    if (isGTMEnabled()) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: action,
            event_category: category,
            event_label: label,
            value: value,
            currency: currency,
            items: items.length > 0 ? items : undefined,
            ...eventData,
        });
    }
};

// ============================================
// TOOL USAGE TRACKING
// ============================================
export const trackToolUsage = (toolName, action = 'use', metadata = {}) => {
    event({
        action: action,
        category: 'Tool Usage',
        label: toolName,
        custom_parameters: {
            tool_name: toolName,
            tool_action: action,
            ...metadata,
        },
    });
};

export const trackToolStart = (toolName, fileType = null, fileSize = null) => {
    trackToolUsage(toolName, 'tool_start', {
        file_type: fileType,
        file_size: fileSize,
    });
};

export const trackToolComplete = (toolName, duration = null, success = true) => {
    trackToolUsage(toolName, success ? 'tool_complete' : 'tool_failed', {
        duration_ms: duration,
        success: success,
    });
};

// ============================================
// FILE & CONVERSION TRACKING
// ============================================
export const trackFileUpload = (fileType, fileSize, toolName = null) => {
    event({
        action: 'file_upload',
        category: 'File Operations',
        label: `${toolName || 'general'} - ${fileType}`,
        value: Math.round(fileSize / 1024), // Size in KB
        custom_parameters: {
            file_type: fileType,
            file_size: fileSize,
            file_size_kb: Math.round(fileSize / 1024),
            file_size_mb: Math.round((fileSize / 1024 / 1024) * 100) / 100,
            tool_name: toolName,
        },
    });
};

export const trackConversion = (conversionType, fromFormat, toFormat, fileSize = 0, duration = null) => {
    event({
        action: 'conversion',
        category: 'Conversion',
        label: `${fromFormat} to ${toFormat}`,
        value: Math.round(fileSize / 1024),
        custom_parameters: {
            conversion_type: conversionType,
            from_format: fromFormat,
            to_format: toFormat,
            file_size: fileSize,
            duration_ms: duration,
        },
    });
    
    // Track as conversion event for GA4
    if (isGAEnabled()) {
        window.gtag('event', 'conversion', {
            conversion_type: conversionType,
            from_format: fromFormat,
            to_format: toFormat,
            value: Math.round(fileSize / 1024),
            currency: 'EUR',
        });
    }
};

export const trackDownload = (fileType, toolName, fileSize = null) => {
    event({
        action: 'file_download',
        category: 'Engagement',
        label: `${toolName} - ${fileType}`,
        value: fileSize ? Math.round(fileSize / 1024) : undefined,
        custom_parameters: {
            file_type: fileType,
            tool_name: toolName,
            file_size: fileSize,
        },
    });
};

// ============================================
// USER ACTIONS TRACKING
// ============================================
export const trackSignup = (method = 'email', plan = 'free') => {
    event({
        action: 'sign_up',
        category: 'User',
        label: method,
        custom_parameters: {
            signup_method: method,
            plan: plan,
        },
    });
    
    // GA4 conversion event
    if (isGAEnabled()) {
        window.gtag('event', 'sign_up', {
            method: method,
            plan: plan,
        });
    }
};

export const trackLogin = (method = 'email') => {
    event({
        action: 'login',
        category: 'User',
        label: method,
        custom_parameters: {
            login_method: method,
        },
    });
};

export const trackLogout = () => {
    event({
        action: 'logout',
        category: 'User',
    });
};

export const trackUpgrade = (plan = 'pro', price = 19) => {
    event({
        action: 'purchase',
        category: 'Revenue',
        label: plan,
        value: price,
        currency: 'EUR',
        custom_parameters: {
            plan: plan,
            price: price,
        },
    });
    
    // GA4 ecommerce event
    if (isGAEnabled()) {
        window.gtag('event', 'purchase', {
            transaction_id: `upgrade_${Date.now()}`,
            value: price,
            currency: 'EUR',
            items: [{
                item_id: plan,
                item_name: `${plan} Plan`,
                price: price,
                quantity: 1,
            }],
        });
    }
};

// ============================================
// ENGAGEMENT TRACKING
// ============================================
export const trackButtonClick = (buttonName, location) => {
    event({
        action: 'button_click',
        category: 'Engagement',
        label: buttonName,
        custom_parameters: {
            button_name: buttonName,
            location: location,
        },
    });
};

export const trackSearch = (searchTerm, resultsCount = null) => {
    event({
        action: 'search',
        category: 'Engagement',
        label: searchTerm,
        value: resultsCount,
        custom_parameters: {
            search_term: searchTerm,
            results_count: resultsCount,
        },
    });
};

export const trackVideoPlay = (videoName, duration = null) => {
    event({
        action: 'video_play',
        category: 'Engagement',
        label: videoName,
        value: duration,
        custom_parameters: {
            video_name: videoName,
            video_duration: duration,
        },
    });
};

export const trackTimeOnPage = (pageName, timeSpent) => {
    event({
        action: 'time_on_page',
        category: 'Engagement',
        label: pageName,
        value: Math.round(timeSpent),
        custom_parameters: {
            page_name: pageName,
            time_spent_seconds: Math.round(timeSpent),
        },
    });
};

// ============================================
// ERROR TRACKING
// ============================================
export const trackError = (errorMessage, errorLocation, errorType = 'general', errorCode = null) => {
    event({
        action: 'error',
        category: 'Error',
        label: `${errorLocation}: ${errorMessage}`,
        custom_parameters: {
            error_message: errorMessage,
            error_location: errorLocation,
            error_type: errorType,
            error_code: errorCode,
        },
    });
    
    // Send to GA4 as exception
    if (isGAEnabled()) {
        window.gtag('event', 'exception', {
            description: errorMessage,
            fatal: errorType === 'fatal',
            error_location: errorLocation,
        });
    }
};

export const trackAPIError = (endpoint, statusCode, errorMessage) => {
    trackError(
        errorMessage || `API Error: ${statusCode}`,
        endpoint,
        'api_error',
        statusCode
    );
};

// ============================================
// PERFORMANCE TRACKING
// ============================================
export const trackPerformance = (metric, value, unit = 'ms') => {
    event({
        action: 'performance',
        category: 'Performance',
        label: metric,
        value: Math.round(value),
        custom_parameters: {
            metric_name: metric,
            metric_value: value,
            metric_unit: unit,
        },
    });
};

// Web Vitals tracking
export const trackWebVital = (metric) => {
    const { name, value, id, delta } = metric;
    
    if (isGAEnabled()) {
        window.gtag('event', name, {
            event_category: 'Web Vitals',
            value: Math.round(name === 'CLS' ? delta * 1000 : delta),
            event_label: id,
            non_interaction: true,
        });
    }
    
    trackPerformance(name, value, name === 'CLS' ? 'score' : 'ms');
};

// ============================================
// ECOMMERCE TRACKING
// ============================================
export const trackAddToCart = (itemId, itemName, price, quantity = 1) => {
    event({
        action: 'add_to_cart',
        category: 'Ecommerce',
        label: itemName,
        value: price * quantity,
        currency: 'EUR',
        items: [{
            item_id: itemId,
            item_name: itemName,
            price: price,
            quantity: quantity,
        }],
    });
    
    if (isGAEnabled()) {
        window.gtag('event', 'add_to_cart', {
            currency: 'EUR',
            value: price * quantity,
            items: [{
                item_id: itemId,
                item_name: itemName,
                price: price,
                quantity: quantity,
            }],
        });
    }
};

export const trackBeginCheckout = (value, items = []) => {
    event({
        action: 'begin_checkout',
        category: 'Ecommerce',
        value: value,
        currency: 'EUR',
        items: items,
    });
    
    if (isGAEnabled()) {
        window.gtag('event', 'begin_checkout', {
            currency: 'EUR',
            value: value,
            items: items,
        });
    }
};

// ============================================
// SESSION TRACKING
// ============================================
export const trackSessionStart = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    
    event({
        action: 'session_start',
        category: 'Session',
        custom_parameters: {
            session_id: sessionId,
        },
    });
};

export const trackSessionEnd = (duration = null) => {
    const sessionId = sessionStorage?.getItem('analytics_session_id');
    
    event({
        action: 'session_end',
        category: 'Session',
        value: duration ? Math.round(duration) : undefined,
        custom_parameters: {
            session_id: sessionId,
            session_duration: duration,
        },
    });
};

// ============================================
// CUSTOM USER PROPERTIES
// ============================================
export const setUserProperty = (propertyName, propertyValue) => {
    if (isGAEnabled()) {
        window.gtag('set', 'user_properties', {
            [propertyName]: propertyValue,
        });
    }
    
    if (isGTMEnabled()) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            user_property: propertyName,
            user_property_value: propertyValue,
        });
    }
};

export const setUserId = (userId) => {
    if (isGAEnabled()) {
        window.gtag('set', { user_id: userId });
    }
    
    setUserProperty('user_id', userId);
};
