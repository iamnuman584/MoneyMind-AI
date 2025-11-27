
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType, Category } from '../../types';
import { categorizeTransaction } from '../../services/geminiService';
import { DEFAULT_CATEGORIES } from '../../constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'category'>, category: Category) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  existingTransaction: Transaction | null;
  isProcessing?: boolean;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAddTransaction, onUpdateTransaction, existingTransaction, isProcessing }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('Uncategorized');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [error, setError] = useState('');

  const isNewViaAi = existingTransaction?.id === 0;

  useEffect(() => {
    if (existingTransaction) {
      setDescription(existingTransaction.description);
      setAmount(String(existingTransaction.amount || ''));
      setDate(new Date(existingTransaction.date).toISOString().split('T')[0]);
      setType(existingTransaction.type);
      setCategory(existingTransaction.category);
       if(existingTransaction.description) {
           handleAutoCategorize(existingTransaction.description);
       }
    } else {
      // Reset form for new transaction
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('expense');
      setCategory('Uncategorized');
    }
  }, [existingTransaction, isOpen]);

  const handleAutoCategorize = useCallback(async (text: string) => {
    if (text.trim().length > 3) {
      setIsCategorizing(true);
      const resultCategory = await categorizeTransaction(text);
      setCategory(resultCategory);
      setIsCategorizing(false);
    }
  }, []);

  const handleDescriptionBlur = () => {
      // Only auto-categorize if it's a completely new entry, not one from voice/scan
    if (!existingTransaction) {
        handleAutoCategorize(description);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) {
      setError('Please fill in all fields with valid values.');
      return;
    }
    setError('');

    const transactionData = {
      description,
      amount: parseFloat(amount),
      date,
      type,
    };
    
    if (existingTransaction && !isNewViaAi) {
        onUpdateTransaction({ ...transactionData, id: existingTransaction.id, category });
    } else {
        onAddTransaction(transactionData, category);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card-bg dark:bg-dark-card-bg rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        {isProcessing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-10 rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">Scanning Receipt...</p>
            </div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-text-primary dark:text-dark-text-primary">{existingTransaction && !isNewViaAi ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"
              placeholder="e.g., Dinner with friends"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"
              placeholder="e.g., 1500"
              required
            />
          </div>
           <div>
            <label htmlFor="category" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Category</label>
            <div className="relative">
                <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary appearance-none text-text-primary dark:text-dark-text-primary"
                    >
                    {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     <option value="Uncategorized">Uncategorized</option>
                </select>
                {isCategorizing && <span className="absolute right-3 top-2.5 animate-spin">🧠</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"
                  required
                />
              </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Type</label>
                <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-border-color dark:border-dark-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-primary dark:text-dark-text-primary"
                >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                </select>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {existingTransaction && !isNewViaAi ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
