import React from 'react';
import { ProcessedData } from '../services/dataProcessor';
import PeopleAheadChart from './charts/PeopleAheadChart';
import TrendAnalysisTable from './tables/TrendAnalysisTable';

interface InsightsProps {
  data: ProcessedData;
  theme: 'dark' | 'light';
}

const Insights: React.FC<InsightsProps> = ({ data, theme }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">People Ahead Breakdown Over Time</h2>
        <PeopleAheadChart data={data.categoryMonth} theme={theme} />
      </div>

      <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend Analytics</h2>
        <TrendAnalysisTable allTrends={data.peopleAheadTrends} />
      </div>
    </div>
  );
};

export default Insights;