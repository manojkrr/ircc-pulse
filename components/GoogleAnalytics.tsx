// src/components/GoogleAnalytics.tsx
import React, {useEffect} from "react";

const GA_TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const GoogleAnalytics: React.FC = () => {
    useEffect(() => {
        if (!GA_TRACKING_ID) {
            console.warn("GA not initialized (dev mode or missing ID)");
            return;
        }

        // Add GA script
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
        document.head.appendChild(script);

        // Add GA initialization inline script
        const inlineScript = document.createElement("script");
        inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
    `;
        document.head.appendChild(inlineScript);

        // Cleanup function (optional)
        return () => {
            document.head.removeChild(script);
            document.head.removeChild(inlineScript);
        };
    }, []);

    return null; // no UI
};
