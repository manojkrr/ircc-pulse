import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
    data: { index: number, value: number }[];
    color: string;
}

export const SparkLine: React.FC<SparkLineProps> = ({ data, color }) => {
  return (
    <div style={{ width: '100px', height: '30px' }}>
        <ResponsiveContainer>
            <LineChart data={data}>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};
