import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onAddTransaction: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onVoiceInput: () => void;
  onScanReceipt: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTransaction, theme, setTheme, onVoiceInput, onScanReceipt }) => {
  return (
    <header className="bg-card-bg dark:bg-dark-card-bg shadow-sm sticky top-0 z-10 border-b border-border-color dark:border-dark-border-color">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">
          MoneyMind AI 💸
        </h1>
        <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button onClick={onVoiceInput} className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Voice Input">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button onClick={onScanReceipt} className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Scan Receipt">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button
            onClick={onAddTransaction}
            className="bg-primary hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hidden sm:inline-block"
            >
            + Add Transaction
            </button>
             <button
            onClick={onAddTransaction}
            className="bg-primary hover:bg-indigo-700 text-white font-semibold p-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 sm:hidden"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;