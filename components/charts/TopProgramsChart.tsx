import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ProgramRow } from '../../types';
import { formatInt } from '../../services/parsingUtils';

interface TopProgramsChartProps {
  data: ProgramRow[];
  theme: 'dark' | 'light';
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3 shadow-lg">
        <p className="font-bold text-gray-900 dark:text-white">{label}</p>
        <p className="text-cyan-400">{`People Applied: ${formatInt(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};


const TopProgramsChart: React.FC<TopProgramsChartProps> = ({ data, theme }) => {
  const chartData = data
    .map(d => ({ name: d.programFull, waiting: d.waiting || 0 }))
    .sort((a,b) => a.waiting - b.waiting);

  const chartHeight = Math.max(384, chartData.length * 25);
  
  const gridColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const tickColor = theme === 'dark' ? '#D1D5DB' : '#374151';

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart 
        layout="vertical" 
        data={chartData}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis type="number" stroke={axisColor} tick={{ fill: tickColor, fontSize: 12 }} tickFormatter={(tick) => formatInt(tick)} />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke={axisColor}
          width={150}
          tick={{ fontSize: 10, fill: tickColor }} 
          tickFormatter={(value) => value.length > 25 ? `${value.substring(0, 25)}...` : value}
          interval={0}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}/>
        <Bar dataKey="waiting" fill="#22D3EE" barSize={15} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopProgramsChart;