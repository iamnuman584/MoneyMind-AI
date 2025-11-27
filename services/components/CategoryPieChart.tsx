

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface CategoryPieChartProps {
  data: Transaction[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const expenseData = data.filter(t => t.type === 'expense');
    const categoryTotals = expenseData.reduce((acc, transaction) => {
      const category = transaction.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      // FIX: Explicitly cast values to numbers to prevent type errors during subtraction.
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-secondary">No expense data for this month.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {/* FIX: The value from the formatter is not guaranteed to be a number. Coerce it to a number before formatting. */}
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
