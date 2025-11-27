import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: string;
  color: string;
  darkColor: string;
  emoji: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color, darkColor, emoji }) => {
  return (
    <div className="bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105 duration-300">
      <div className={`text-3xl p-3 rounded-full ${color} ${darkColor}`}>
        {emoji}
      </div>
      <div>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary font-medium">{title}</p>
        <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{amount}</p>
      </div>
    </div>
  );
};

export default SummaryCard;