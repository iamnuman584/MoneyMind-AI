
import React, { useState } from 'react';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface BudgetTrackerProps {
  budget: Budget;
  setBudget: (budget: Budget) => void;
  totalExpenses: number;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budget, setBudget, totalExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.amount.toString());

  const progress = budget.amount > 0 ? Math.min((totalExpenses / budget.amount) * 100, 100) : 0;
  const remaining = budget.amount - totalExpenses;
  const isOverBudget = remaining < 0;

  const handleSave = () => {
    const amount = parseFloat(newBudget);
    if (!isNaN(amount) && amount > 0) {
      setBudget({ ...budget, amount });
      setIsEditing(false);
    }
  };
  
  let progressColor = 'bg-primary';
  if (progress > 90) progressColor = 'bg-red-500';
  else if (progress > 75) progressColor = 'bg-yellow-500';

  return (
    <div className="bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Monthly Budget 🎯</h3>
        <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-primary hover:text-indigo-700">
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input 
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-border-color dark:border-dark-border-color rounded-md focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"
            placeholder="Enter new budget"
          />
          <button onClick={handleSave} className="px-3 py-1 bg-primary text-white rounded-md">Save</button>
        </div>
      ) : (
        <div className="space-y-3">
            <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{formatCurrency(totalExpenses)}</span>
                <span className="text-text-secondary dark:text-dark-text-secondary">/ {formatCurrency(budget.amount)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
            {isOverBudget ? (
                <p className="text-sm text-red-500 font-medium">🚨 You're {formatCurrency(Math.abs(remaining))} over budget!</p>
            ) : (
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{formatCurrency(remaining)} left to spend.</p>
            )}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
