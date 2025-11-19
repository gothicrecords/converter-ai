import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import * as analytics from './analytics';

/**
 * React Hook for easy analytics tracking
 * 
 * Usage:
 * const { trackEvent, trackPageView, trackError } = useAnalytics();
 */
export function useAnalytics() {
    const router = useRouter();
    const pageStartTime = useRef(Date.now());
    const currentPage = useRef(null);

    // Track page view on route change
    useEffect(() => {
        const handleRouteChange = (url) => {
            // Track time on previous page
            if (currentPage.current) {
                const timeSpent = (Date.now() - pageStartTime.current) / 1000;
                analytics.trackTimeOnPage(currentPage.current, timeSpent);
            }

            // Track new page view
            analytics.pageview(url);
            currentPage.current = url;
            pageStartTime.current = Date.now();
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        
        // Track initial page view
        if (router.asPath) {
            analytics.pageview(router.asPath);
            currentPage.current = router.asPath;
        }

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
            
            // Track time on page when component unmounts
            if (currentPage.current) {
                const timeSpent = (Date.now() - pageStartTime.current) / 1000;
                analytics.trackTimeOnPage(currentPage.current, timeSpent);
            }
        };
    }, [router]);

    // Track session start on mount
    useEffect(() => {
        analytics.trackSessionStart();
        
        return () => {
            // Track session end on unmount
            const sessionStart = sessionStorage?.getItem('analytics_session_start');
            if (sessionStart) {
                const duration = (Date.now() - parseInt(sessionStart)) / 1000;
                analytics.trackSessionEnd(duration);
            }
        };
    }, []);

    // Helper functions
    const trackEvent = useCallback((action, category, label, value, customParams) => {
        analytics.event({
            action,
            category,
            label,
            value,
            custom_parameters: customParams || {},
        });
    }, []);

    const trackToolUsage = useCallback((toolName, action = 'use', metadata = {}) => {
        analytics.trackToolUsage(toolName, action, metadata);
    }, []);

    const trackFileUpload = useCallback((fileType, fileSize, toolName = null) => {
        analytics.trackFileUpload(fileType, fileSize, toolName);
    }, []);

    const trackConversion = useCallback((conversionType, fromFormat, toFormat, fileSize = 0, duration = null) => {
        analytics.trackConversion(conversionType, fromFormat, toFormat, fileSize, duration);
    }, []);

    const trackDownload = useCallback((fileType, toolName, fileSize = null) => {
        analytics.trackDownload(fileType, toolName, fileSize);
    }, []);

    const trackError = useCallback((errorMessage, errorLocation, errorType = 'general', errorCode = null) => {
        analytics.trackError(errorMessage, errorLocation, errorType, errorCode);
    }, []);

    const trackButtonClick = useCallback((buttonName, location) => {
        analytics.trackButtonClick(buttonName, location);
    }, []);

    const trackPageView = useCallback((url) => {
        analytics.pageview(url);
    }, []);

    return {
        trackEvent,
        trackToolUsage,
        trackFileUpload,
        trackConversion,
        trackDownload,
        trackError,
        trackButtonClick,
        trackPageView,
        // Direct access to analytics functions
        analytics,
    };
}

export default useAnalytics;

