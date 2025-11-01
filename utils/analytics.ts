declare global {
    interface Window {
        dataLayer: Record<string, any>[];
        gtag: (...args: any[]) => void;
    }
}

export const initGA = () => {
    const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

    if (!GA_ID) {
        console.warn("GA not initialized (missing ID)");
        return;
    }

    // Add GA script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and config
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
        window.dataLayer.push(args);
    };

    script.onload = () => {
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, {send_page_view: true});
        window.gtag("event", "page_view", {page_path: window.location.pathname});
    };
};

export const logEvent = (action: string, params?: Record<string, any>) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", action, params);
};
