import React, {useMemo, useState} from 'react';
import {CategoryMonthRow} from '../../types';
import {formatInt} from '../../services/parsingUtils';
import {trackButtonClick} from "@/utils/analytics.ts";

interface TrendDetailTableProps {
    programName: string;
    seriesData: { ym: string; value?: number; bound?: CategoryMonthRow['bound'] }[];
}

const TrendDetailTable: React.FC<TrendDetailTableProps> = ({programName, seriesData}) => {
    const [monthsToShow, setMonthsToShow] = useState(6);

    const reversedData = useMemo(() => {
        return [...seriesData].filter(d => d.value !== undefined).reverse();
    }, [seriesData]);

    const paginatedData = useMemo(() => {
        return reversedData.slice(0, monthsToShow);
    }, [reversedData, monthsToShow]);

    const canShowMore = monthsToShow < reversedData.length;

    return (
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Monthly Breakdown for: <span className="text-blue-600 dark:text-blue-400">{programName}</span>
            </h3>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Month
                        </th>
                        <th scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Applications
                            in Progress (Headcount)
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                    {paginatedData.map((row) => (
                        <tr key={row.ym}>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{row.ym}</td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800 dark:text-white font-medium">{formatInt(row.value!)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {canShowMore && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => {
                            setMonthsToShow(prev => prev + 6)
                            trackButtonClick("Show More Months", programName, monthsToShow);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                    >
                        Show Previous 6 Months
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrendDetailTable;
