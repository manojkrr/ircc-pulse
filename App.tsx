import React, {useEffect, useMemo, useState} from 'react';
import Overview from './components/Overview';
import {formatInt, getCookie, setCookie} from './services/parsingUtils';
import {useQuery} from "@tanstack/react-query";
import getProcessingTimesDataFromIRCC, {IRCC_API_URL, QUERY_KEY_PROCESSING_TIMES} from "./services/IRCC-api.ts";
import {initGA, logEvent, logPageView} from "@/utils/analytics.ts";

type Theme = 'dark' | 'light';

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('dark');
    const [processError, setProcessError] = useState<string | null>(null)

    useEffect(() => {
        initGA();
        logPageView(window.location.pathname);
    }, []);

    useEffect(() => {
        const savedTheme = getCookie('theme') as Theme | undefined;
        setTheme(savedTheme || 'dark');
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
        setCookie('theme', theme, 365);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const {data, error: error, isLoading: loading} = useQuery({
        queryKey: QUERY_KEY_PROCESSING_TIMES,
        queryFn: async () => {
            try {
                return await getProcessingTimesDataFromIRCC()
            } catch (e) {
                if (e instanceof Error) {
                    setProcessError(`Failed to load or process data: ${e.message}`)
                } else {
                    setProcessError('An unknown error occurred.')
                }
                throw e // rethrow to let React Query handle it too
            }
        },
    })

    const totalPeopleApplied = useMemo(() => {
        if (!data?.summary) return 0;
        return data.summary.reduce((acc, row) => acc + (row.waiting || 0), 0);
    }, [data]);

    const headerInfo = useMemo(() => {
        if (!data?.updated) return {lastUpdated: 'N/A', interval: 'N/A'};
        return {
            lastUpdated: data.updated.flpt_lastupdated || 'Not specified',
            interval: data.updated.flpt_interval || 'Not specified'
        };
    }, [data]);

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <div className="flex flex-col items-center justify-start min-h-screen mt-60">
                        <div className="relative flex items-center justify-start mb-8">
                            <div
                                className="w-44 h-44 rounded-full border-8 border-gray-200 border-t-8 border-t-blue-500 animate-spin"></div>
                            <div
                                className="absolute inset-0 w-44 h-44 rounded-full border-8 border-transparent border-t-8 border-t-blue-300 animate-spin-slow"></div>
                        </div>
                        <p className="text-2xl font-semibold">Loading data from IRCC...</p>
                    </div>
                </>
            );
        }

        if (error) {
            return (
                <div
                    className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg max-w-2xl mx-auto my-8">
                    <strong className="font-bold">Error In Fetching Official IRCC Stats: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            );
        }

        if (processError) {
            return (
                <div
                    className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg max-w-2xl mx-auto my-8">
                    <strong className="font-bold">Error In Parsing the data: </strong>
                    <span className="block sm:inline">{processError}</span>
                    <br/><br/><br/>
                    <span className="block sm:inline">
                        Issue has been logged and will be resolved soon. Please try again later!
                    </span>
                </div>
            );
        }

        if (!data) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                    <svg
                        className="w-16 h-16 mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-4h6v4m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2h10z"
                        />
                    </svg>
                    <p className="text-xl font-medium">No data available.</p>
                    <p className="text-gray-400 mt-2">Please check back later or try refreshing.</p>
                </div>
            );
        }

        return <Overview data={data} theme={theme}/>;
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
                <header
                    className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            <span className="sm:hidden md:hidden">IRCC Pulse 🇨🇦</span>
                            <span className="hidden sm:inline">IRCC Pulse - Realtime Analysis of IRCC Applications 🇨🇦</span>
                        </span>
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </button>
                            </div>
                        </div>
                        <div
                            className="flex justify-end items-center space-x-6 text-xs text-gray-500 dark:text-gray-400 pb-2">
                            <div className="text-sm">
                                <span className="font-medium">People Waiting For A Decision: </span>
                                <span
                                    className="font-bold text-lg text-gray-800 dark:text-gray-100">{totalPeopleApplied > 0 ? formatInt(totalPeopleApplied) : 'N/A'}</span>
                            </div>
                            <div>
                                Last Updated: <span
                                className="font-semibold text-gray-700 dark:text-gray-300">{headerInfo.lastUpdated}</span> |
                                <span
                                className="font-semibold text-gray-700 dark:text-gray-300 capitalize"> Updated {headerInfo.interval}</span> |
                                Source:{" "}
                                <a
                                    href={IRCC_API_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-700 dark:text-gray-300 capitalize"
                                    onClick={() =>
                                        logEvent("source_click_here", {
                                            category: "Engagement",
                                            label: "IRCC API Source",
                                            url: IRCC_API_URL,
                                        })
                                    }
                                >
                                    Click Here
                                </a>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
                <footer
                    className="text-center py-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800 mt-8">
                    <p>
                        <a href="https://laws-lois.justice.gc.ca/eng/acts/c-42/page-6.html?utm_source=chatgpt.com"
                           target="_blank">
                            &copy; 2025 Manoj Kumar. All rights reserved.
                        </a>
                    </p>
                </footer>
            </div>
        </>
    );
};

export default App;