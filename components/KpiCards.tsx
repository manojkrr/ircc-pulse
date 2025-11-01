import React from 'react';
import { ProgramRow } from '../types';
import { formatInt } from '../services/parsingUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface KpiCardsProps {
  summary: ProgramRow[];
}

const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const totalPeopleWaiting = summary.reduce((acc, row) => acc + (row.waiting || 0), 0);
  
  const kpis = [
    { title: 'Total People Applied', value: formatInt(totalPeopleWaiting), icon: '👥' },
  ];

  return (
    <div className="grid gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.title}</CardTitle>
            <span className="text-2xl">{kpi.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;