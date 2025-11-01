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
    function gtag(...args: any[]) { window.dataLayer.push(args); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", GA_ID, {
        send_page_view: true,
    });
};

export const logPageView = (path: string) => {
    const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (typeof window.gtag !== "function" || !GA_ID) return;

    window.gtag("event", "page_view", {
        page_path: path,
    });
};

export const logEvent = (action: string, params?: Record<string, any>) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", action, params);
};
