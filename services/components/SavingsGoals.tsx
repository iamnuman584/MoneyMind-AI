
import React, { useState } from 'react';
import { Goal } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface SavingsGoalsProps {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: number, amount: number) => void;
  deleteGoal: (id: number) => void;
  balance: number;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, addGoal, updateGoal, deleteGoal }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && parseFloat(targetAmount) > 0) {
      addGoal({ name, targetAmount: parseFloat(targetAmount) });
      setName('');
      setTargetAmount('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Savings Goals 🏆</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="text-sm text-primary hover:text-indigo-700">
          {showAddForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Goal Name (e.g., Dubai Trip)" className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md text-text-primary dark:text-dark-text-primary" />
          <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount (₹)" className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md text-text-primary dark:text-dark-text-primary" />
          <button type="submit" className="w-full px-3 py-1 bg-primary text-white rounded-md">Add Goal</button>
        </form>
      )}

      <div className="space-y-4">
        {goals.length > 0 ? goals.map(goal => {
          const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
          return (
            <div key={goal.id}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-text-primary dark:text-dark-text-primary">{goal.name}</span>
                <button onClick={() => deleteGoal(goal.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</p>
            </div>
          );
        }) : <p className="text-text-secondary dark:text-dark-text-secondary text-center py-4">No savings goals yet. Add one to start saving!</p>}
      </div>
    </div>
  );
};

export default SavingsGoals;
