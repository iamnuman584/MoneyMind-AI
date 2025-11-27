
import { Transaction, Goal, Budget } from '../types';

interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  budget: Budget;
}

const STORAGE_KEY = 'moneyMindAI';

export const loadData = (): AppData => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData === null) {
      return { transactions: [], goals: [], budget: { amount: 50000, month: new Date().getMonth() } };
    }
    const data = JSON.parse(serializedData);
    // Ensure transactions have dates
    data.transactions = data.transactions.map((t: Transaction) => ({
      ...t,
      date: t.date || new Date().toISOString(),
    }));
    return data;
  } catch (error) {
    console.error("Could not load data from localStorage", error);
    return { transactions: [], goals: [], budget: { amount: 50000, month: new Date().getMonth() } };
  }
};

export const saveData = (data: AppData): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    console.error("Could not save data to localStorage", error);
  }
};
