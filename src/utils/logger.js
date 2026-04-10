/**
 * Utility for logging errors with detailed timestamps and context.
 */
export const logError = (error, context = 'App') => {
    const now = new Date();
    const timestamp = now.toLocaleString('es-AR', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const errorEntry = {
        timestamp,
        context,
        message: error?.message || error,
        stack: error?.stack || 'No stack trace available',
        url: window.location.href,
        userAgent: navigator.userAgent
    };

    // Log to console with styling for better visibility in devtools
    console.group(`%c[ERROR][${timestamp}][${context}]`, 'color: #ff4d4d; font-weight: bold; font-size: 1.1em;');
    console.error(errorEntry);
    console.groupEnd();

    // Persist to localStorage (for persistence across reloads)
    try {
        const existingLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
        existingLogs.push(errorEntry);
        // Keep only last 100 logs to prevent storage bloat
        if (existingLogs.length > 100) existingLogs.shift();
        localStorage.setItem('app_error_logs', JSON.stringify(existingLogs));
    } catch (e) {
        console.warn('Could not save log to localStorage', e);
    }
};

/**
 * Hook or function to initialize global error catching
 */
export const initGlobalLogger = () => {
    window.onerror = (message, source, lineno, colno, error) => {
        logError(error || message, 'GlobalWindow');
    };

    window.onunhandledrejection = (event) => {
        logError(event.reason, 'UnhandledPromise');
    };
};
