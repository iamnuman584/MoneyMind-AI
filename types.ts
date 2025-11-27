
export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Food'
  | 'Travel'
  | 'Bills'
  | 'Shopping'
  | 'Rent'
  | 'Groceries'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Salary'
  | 'Investment'
  | 'Other Income'
  | 'Other Expense'
  | 'Uncategorized';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

export interface Budget {
  amount: number;
  month: number;
}
