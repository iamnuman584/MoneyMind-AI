
import React, { useState, useCallback, useEffect } from 'react';
import { generateFinancialInsights } from '../../services/geminiService';
import { Transaction } from '../../types';

interface InsightsProps {
  transactions: Transaction[];
}

const Insights: React.FC<InsightsProps> = ({ transactions }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const previousMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      });

      const result = await generateFinancialInsights(currentMonthTransactions, previousMonthTransactions);
      setInsights(result);
    } catch (err) {
      setError('Failed to fetch insights.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);
  
  // Auto-fetch insights on component mount if there are transactions
  useEffect(() => {
    if (transactions.length > 0 && insights.length === 0) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]); // Note: fetchInsights is memoized and doesn't need to be in deps

  const insightIcons = ['📊', '📈', '💡', '🔍', '🔮'];

  return (
    <div className="bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">AI Insights 🧠</h3>
        <button onClick={fetchInsights} disabled={isLoading} className="text-sm text-primary hover:text-indigo-700 disabled:opacity-50">
          {isLoading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>
      {isLoading ? (
        <div className="text-center text-text-secondary dark:text-dark-text-secondary">Generating insights...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : insights.length > 0 ? (
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start space-x-3 text-sm text-text-primary dark:text-dark-text-primary">
              <span className="mt-1">{insightIcons[index % insightIcons.length]}</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary dark:text-dark-text-secondary text-center py-4">Click 'Refresh' to get your financial insights.</p>
      )}
    </div>
  );
};

export default Insights;
