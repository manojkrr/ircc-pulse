declare global {
    interface Window {
        dataLayer: Record<string, any>[];
        gtag: (...args: any[]) => void;
    }
}

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined"

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (isBrowser && window.gtag) {
        try {
            window.gtag("event", action, {
                event_category: category,
                event_label: label,
                value: value,
            })
        } catch (error) {
            console.warn("GA event tracking failed:", error)
        }
    }
}

// Track button clicks
export const trackButtonClick = (category: string, label?: string, value?: number) => {
    trackEvent("Button Click", category, label, value);
}
