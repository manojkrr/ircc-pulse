import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {ProcessedData} from '../services/dataProcessor';
import TopProgramsChart from './charts/TopProgramsChart';
import ProgramsTable, {SortConfig} from './tables/ProgramsTable';
import PeopleAheadChart from './charts/PeopleAheadChart';
import TrendAnalysisTable from './tables/TrendAnalysisTable';
import {ProgramRow} from '../types';
import {getCookie, setCookie} from '../services/parsingUtils';
import {Tooltip} from "recharts";

const FAVORITES_COOKIE_KEY = 'favoritePrograms';
const DEFAULT_FAVORITES = ['cec', 'fsw', 'pnp-ee', 'pnp-base'];

const useFavorites = () => {
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        const fromCookie = getCookie(FAVORITES_COOKIE_KEY);
        if (fromCookie) {
            try {
                const parsed = JSON.parse(fromCookie);
                return new Set(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                return new Set(DEFAULT_FAVORITES);
            }
        }
        return new Set(DEFAULT_FAVORITES);
    });

    useEffect(() => {
        setCookie(FAVORITES_COOKIE_KEY, JSON.stringify(Array.from(favorites)), 365);
    }, [favorites]);

    const toggleFavorite = useCallback((program: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(program)) {
                newFavorites.delete(program);
            } else {
                newFavorites.add(program);
            }
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((program: string) => {
        return favorites.has(program);
    }, [favorites]);

    return {favorites, toggleFavorite, isFavorite};
};


interface OverviewProps {
    data: ProcessedData;
    theme: 'dark' | 'light';
}

const Overview: React.FC<OverviewProps> = ({data, theme}) => {
    // Lifted state from ProgramsTable
    const {favorites, toggleFavorite, isFavorite} = useFavorites();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('favorites');
    const [sortConfig, setSortConfig] = useState<SortConfig>({key: 'waiting', direction: 'descending'});

    // Lifted filtering logic
    const filteredData = useMemo(() => {
        return data.totals.filter(row => {
            const matchesSearch = row.programFull.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesCategory = false;
            if (categoryFilter === 'all') {
                matchesCategory = true;
            } else if (categoryFilter === 'favorites') {
                matchesCategory = favorites.has(row.program);
            } else if (categoryFilter === 'refugees-') {
                matchesCategory = row.program.includes('refugees') || row.program.includes('protected-persons');
            } else {
                matchesCategory = row.program.startsWith(categoryFilter);
            }

            return matchesSearch && matchesCategory;
        });
    }, [data.totals, searchTerm, categoryFilter, favorites]);

    // Lifted sorting logic
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === null) return 0;

                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
                }

                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    return (
        <>
            <div className="space-y-8">
                <div
                    className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Programs Breakdown</h2>
                    <ProgramsTable
                        data={sortedData}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        sortConfig={sortConfig}
                        setSortConfig={setSortConfig}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                    />
                </div>

                <div
                    className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Applications in Progress (Headcount)
                    </h2>
                    <div>
                        <TopProgramsChart data={sortedData} theme={theme}/>
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Applications in Progress by Month
                    </h2>
                    <p>
                        This chart shows how many applicants waiting for a decision, categorized by the month they
                        initially
                        applied (YYYY/MM)
                    </p>
                    <br/>
                    <PeopleAheadChart data={data.categoryMonth} theme={theme} isFavorite={isFavorite}/>
                </div>

                <div
                    className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Monthly Increase in New Applications Filed
                    </h2>
                    <ol className="text-sm text-gray-900 dark:text-white mb-6 list-decimal list-inside space-y-2">
                        <li>
                            Shows an approx percentage and numerical increase in headcount for newly filed applications compared to the
                            previous month, highlighting growth momentum.
                        </li>
                        <li>Click on program names to see detailed monthly breakdowns.</li>
                    </ol>
                    <TrendAnalysisTable allTrends={data.peopleAheadTrends} categoryMonthData={data.categoryMonth}/>
                </div>
            </div>
        </>
    );
};

export default Overview;