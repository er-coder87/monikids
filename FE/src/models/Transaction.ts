import { Category } from './Category';

export interface Transaction {
  id: string | undefined;
  transactionDate: string; // Maps from DateTime
  description: string;
  amount: number; // Maps from decimal
  category: Category | undefined; // Maps from Category?
}
