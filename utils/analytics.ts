declare global {
    interface Window {
        dataLayer: Record<string, any>[];
        gtag: (...args: any[]) => void;
    }
}

export const logEvent = (action: string, params?: Record<string, any>) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", action, params);
};
