
import React, { useMemo } from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import SummaryCard from './SummaryCard';
import CategoryPieChart from './CategoryPieChart';
import MonthlyBarChart from './MonthlyBarChart';

interface DashboardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ totalIncome, totalExpenses, balance, transactions }) => {
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Income"
          amount={formatCurrency(totalIncome)}
          color="bg-green-100"
          darkColor="dark:bg-green-900/50"
          emoji="💰"
        />
        <SummaryCard
          title="Total Expenses"
          amount={formatCurrency(totalExpenses)}
          color="bg-red-100"
          darkColor="dark:bg-red-900/50"
          emoji="💸"
        />
        <SummaryCard
          title="Current Balance"
          amount={formatCurrency(balance)}
          color="bg-blue-100"
          darkColor="dark:bg-blue-900/50"
          emoji="🏦"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-dark-text-primary">Expense Categories</h3>
            <CategoryPieChart data={currentMonthTransactions} />
        </div>
        <div className="md:col-span-3 bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-dark-text-primary">Monthly Overview</h3>
            <MonthlyBarChart data={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
