

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface MonthlyBarChartProps {
  data: Transaction[];
}

const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {};
    
    data.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[month].income += transaction.amount;
      } else {
        monthlyTotals[month].expenses += transaction.amount;
      }
    });

    return Object.entries(monthlyTotals).map(([name, values]) => ({
      name,
      ...values,
    })).reverse(); // Show most recent months first
  }, [data]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-secondary">No transaction data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="income" fill="#10B981" name="Income" />
        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyBarChart;
