import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { exportTransactionsToPDF } from '../../utils/pdfExporter';
import { DEFAULT_CATEGORIES } from '../../constants';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  onEdit: (transaction: Transaction) => void;
}

const categoryIcons: Record<Category, string> = {
    Food: '🍕',
    Travel: '✈️',
    Bills: '🧾',
    Shopping: '🛍️',
    Rent: '🏠',
    Groceries: '🛒',
    Entertainment: '🎬',
    Health: '❤️‍🩹',
    Education: '🎓',
    Salary: '💼',
    Investment: '📈',
    'Other Income': '🪙',
    'Other Expense': '🤷',
    Uncategorized: '❓',
};

const TransactionItem: React.FC<{ transaction: Transaction; onDelete: (id: number) => void; onEdit: (transaction: Transaction) => void; }> = React.memo(({ transaction, onDelete, onEdit }) => {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? 'text-secondary' : 'text-red-500';
    const amountSign = isIncome ? '+' : '-';
  
    return (
        <li className="flex items-center justify-between p-4 bg-card-bg dark:bg-dark-card-bg/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
                <span className="text-2xl">{categoryIcons[transaction.category] || '❓'}</span>
                <div>
                    <p className="font-semibold text-text-primary dark:text-dark-text-primary">{transaction.description}</p>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <p className={`font-bold text-lg ${amountColor}`}>{`${amountSign} ${formatCurrency(transaction.amount)}`}</p>
                <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-blue-500">✏️</button>
                <button onClick={() => onDelete(transaction.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
            </div>
        </li>
    );
});

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);

        if (filterStartDate) {
            if (transactionDate < new Date(filterStartDate)) return false;
        }
        if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            if (transactionDate > endDate) return false;
        }

        if (filterCategory !== 'all' && transaction.category !== filterCategory) {
            return false;
        }
        if (filterType !== 'all' && transaction.type !== filterType) {
            return false;
        }
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort after filtering
  }, [transactions, searchTerm, filterType, filterCategory, filterStartDate, filterEndDate]);

  return (
    <div className="bg-card-bg dark:bg-dark-card-bg p-6 rounded-2xl shadow-md">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Transactions</h3>
        <div className="flex items-center space-x-2">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-primary/20 text-primary' : 'text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                aria-label="Toggle Filters"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
            </button>
            <button 
              onClick={() => exportTransactionsToPDF(filteredTransactions)}
              className="flex items-center space-x-2 text-sm text-primary hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={filteredTransactions.length === 0}
              aria-label="Export filtered transactions to PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export PDF</span>
            </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-card-bg/50 rounded-lg border border-border-color dark:border-dark-border-color">
            <div className="sm:col-span-2 lg:col-span-4">
                <label htmlFor="search" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Search Description</label>
                <input id="search" type="text" placeholder="e.g., Coffee" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"/>
            </div>
            <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Start Date</label>
                <input id="start-date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"/>
            </div>
            <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">End Date</label>
                <input id="end-date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"/>
            </div>
            <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Type</label>
                <select id="type-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary">
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
            </div>
            <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Category</label>
                <select id="category-filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as Category)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary">
                    <option value="all">All</option>
                    {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="Uncategorized">Uncategorized</option>
                </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button onClick={handleResetFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">Reset Filters</button>
            </div>
        </div>
      )}

      {filteredTransactions.length > 0 ? (
        <ul className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary dark:text-dark-text-secondary text-center py-4">
            {transactions.length > 0 ? "No transactions match your filters. 🧐" : "No transactions yet. Add one to get started! 🚀"}
        </p>
      )}
    </div>
  );
};

export default TransactionList;
