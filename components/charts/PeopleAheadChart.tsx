import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CategoryMonthRow } from '../../types';
import { NAME_MAPPING } from '../../constants';
import { formatInt } from '../../services/parsingUtils';
import { ProgramCategoryFilter } from '../ui/ProgramCategoryFilter';

interface PeopleAheadChartProps {
  data: {
    rows: CategoryMonthRow[];
    series: Record<string, { ym: string; value?: number; bound: CategoryMonthRow["bound"] }[]>;
    months: string[];
  };
  theme: 'dark' | 'light';
  isFavorite: (program: string) => boolean;
}

const COLORS = [
  '#3498db', '#e74c3c', '#9b59b6', '#2ecc71', '#f1c40f',
  '#1abc9c', '#e67e22', '#34495e', '#d35400', '#c0392b'
];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3 shadow-lg">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{`Month: ${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ color: pld.color }}>
            {pld.name}: {pld.value !== undefined ? formatInt(pld.value as number) : 'N/A'}
            <span className="text-xs text-gray-400 ml-2">({pld.payload[`${pld.dataKey}-bound`]})</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PeopleAheadChart: React.FC<PeopleAheadChartProps> = ({ data, theme, isFavorite }) => {
  const allProgramOptions = useMemo(() => Object.keys(data.series).sort(), [data.series]);

  const [dateRange, setDateRange] = useState<'2023' | 'all'>('2023');
  const [categoryFilter, setCategoryFilter] = useState('favorites');
  
  const filteredProgramOptions = useMemo(() => {
    return allProgramOptions.filter(prog => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'favorites') return isFavorite(prog);
      if (categoryFilter === 'refugees-') return prog.includes('refugees') || prog.includes('protected-persons');
      return prog.startsWith(categoryFilter);
    });
  }, [allProgramOptions, categoryFilter, isFavorite]);
  
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(filteredProgramOptions);
  const [maxYAxisValue, setMaxYAxisValue] = useState<number | undefined>(undefined);

  const setGraphMaxY = (value: number | undefined) => {
    if(value === undefined || isNaN(value) || !isFinite(value) || value <= 0) {
      return
    }
    if(maxYAxisValue === undefined || value > maxYAxisValue) {
        setMaxYAxisValue(value);
    }
  }

  const getGraphHeight = () => {

  }

  // When the available programs change via filter, update the selection to match
  useEffect(() => {
    setSelectedPrograms(filteredProgramOptions);
  }, [filteredProgramOptions]);

  const chartData = useMemo(() => {
    let visibleMonths = data.months;
    if (dateRange === '2023') {
        visibleMonths = data.months.filter(ym => new Date(ym).getFullYear() >= 2023);
    }

    return visibleMonths.map(month => {
      const entry: { ym: string; [key: string]: any } = { ym: month };
      selectedPrograms.forEach(prog => {
        const point = data.series[prog]?.find(p => p.ym === month);
        entry[prog] = point?.value;
        setGraphMaxY(point?.value);
        entry[`${prog}-bound`] = point?.bound;
      });
      return entry;
    });
  }, [data.months, data.series, selectedPrograms, dateRange]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    setSelectedPrograms(values);
  };
  
  const gridColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#374151';
  const legendColor = theme === 'dark' ? '#D1D5DB' : '#374151';

  if (!allProgramOptions.length) {
    return <p className="text-gray-500 dark:text-gray-400">No application processing data is available in the dataset.</p>;
  }

  return (
    <div className="space-y-4">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Date Range:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button type="button" onClick={() => setDateRange('2023')} className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${dateRange === '2023' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
              Since 2023
            </button>
            <button type="button" onClick={() => setDateRange('all')} className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${dateRange === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
              All Time
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter Programs:</label>
        <ProgramCategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
      </div>
      <div>
        <label htmlFor="program-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Programs (Ctrl/Cmd + Click for multiple)
        </label>
        <select
          id="program-select"
          multiple
          value={selectedPrograms}
          onChange={handleSelectChange}
          className="block w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white p-2"
          size={8}
        >
          {filteredProgramOptions.map(prog => (
            <option key={prog} value={prog}>
              {NAME_MAPPING[prog] || prog}
            </option>
          ))}
        </select>
         {filteredProgramOptions.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No programs match this filter.</p>}
      </div>
      <div className="h-[600px] w-full">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="ym" stroke={axisColor} tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis stroke={axisColor} tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(tick) => typeof tick === 'number' ? formatInt(tick) : tick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px", color: legendColor}}/>
            {selectedPrograms.map((prog, index) => (
              <Line
                key={prog}
                type="monotone"
                dataKey={prog}
                name={NAME_MAPPING[prog] || prog}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PeopleAheadChart;