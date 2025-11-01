import React, {useState, useMemo, useRef, useEffect} from 'react';
import {PeopleAheadTrend} from '../../types';
import {Badge} from '../ui/Badge';
import {ProcessedData} from '../../services/dataProcessor';
import TrendDetailTable from './TrendDetailTable';

interface TrendAnalysisTableProps {
    allTrends: PeopleAheadTrend[];
    categoryMonthData: ProcessedData['categoryMonth'];
}

type SortConfig = {
    key: keyof PeopleAheadTrend | null;
    direction: 'ascending' | 'descending';
};

const TrendAnalysisTable: React.FC<TrendAnalysisTableProps> = ({allTrends, categoryMonthData}) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({key: 'cmgrPct', direction: 'descending'});
    const [filter, setFilter] = useState<'all' | 'up' | 'down' | 'flat'>('all');
    const [selectedTrend, setSelectedTrend] = useState<PeopleAheadTrend | null>(null);
    const detailRef = useRef<HTMLDivElement | null>(null);

    // Scroll into view when selectedTrend changes
    useEffect(() => {
        if (selectedTrend && detailRef.current) {
            detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedTrend]);

    const sortedAndFilteredData = useMemo(() => {
        let sortableItems = [...allTrends];

        if (filter !== 'all') {
            sortableItems = sortableItems.filter(item => item.direction === filter);
        }

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key!] ?? -Infinity;
                const bVal = b[sortConfig.key!] ?? -Infinity;

                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [allTrends, sortConfig, filter]);

    const requestSort = (key: keyof PeopleAheadTrend) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({key, direction});
    };

    const getSortIndicator = (key: keyof PeopleAheadTrend) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const formatPercent = (val?: number) => {
        if (val === undefined || val === null || !isFinite(val)) return '—';
        const color = val > 0 ? 'text-green-500 dark:text-green-400' : val < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';
        return <span className={color}>{val.toFixed(2)}%</span>;
    };

    const handleRowClick = (trend: PeopleAheadTrend) => {
        if (selectedTrend?.program === trend.program) {
            setSelectedTrend(null); // Toggle off if clicking the same row
        } else {
            setSelectedTrend(trend);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {(['all', 'up', 'down', 'flat'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                                }`}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Default window: {allTrends[0]?.window || 6} months. MoM is Month-over-Month. CMGR is Compound
                    Monthly Growth Rate.
                </p>
            </div>
            <div
                className="overflow-x-auto max-h-[30vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                    <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6 cursor-pointer"
                            onClick={() => requestSort('programFull')}>Program {getSortIndicator('programFull')}</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Direction</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
                            onClick={() => requestSort('momPct')}>MoM % {getSortIndicator('momPct')}</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
                            onClick={() => requestSort('cmgrPct')}>CMGR % {getSortIndicator('cmgrPct')}</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer"
                            onClick={() => requestSort('slopePerMonth')}>Slope {getSortIndicator('slopePerMonth')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                    {sortedAndFilteredData.map((trend) => (
                        <tr key={trend.program} onClick={() => handleRowClick(trend)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                            <td className="whitespace-normal py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{trend.programFull}</td>
                            <td className="px-3 py-4 text-sm">
                                <Badge
                                    variant={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'destructive' : 'default'}>{trend.direction}</Badge>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">{formatPercent(trend.momPct)}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">{formatPercent(trend.cmgrPct)}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{trend.slopePerMonth?.toFixed(2) ?? '—'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {sortedAndFilteredData.length === 0 &&
                    <p className="text-center p-4 text-gray-500 dark:text-gray-400">No trends match your filters.</p>}
            </div>
            {selectedTrend && (
                <div ref={detailRef}>
                    <TrendDetailTable
                        key={selectedTrend.program}
                        programName={selectedTrend.programFull}
                        seriesData={categoryMonthData.series[selectedTrend.program] || []}
                    />
                </div>
            )}
        </div>
    );
};


export default TrendAnalysisTable;