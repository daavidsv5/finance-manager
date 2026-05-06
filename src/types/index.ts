export type ExpenseCategory = 'Rodina' | 'Auto' | 'Investice' | 'Práce' | 'Předplatné' | 'Daně';

export interface MonthlyExpense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date string
}

export type EducationType = 'Kurz' | 'Webinář' | 'Kniha' | 'Software' | 'Ostatní';

export interface EducationExpense {
  id: string;
  name: string;
  type: EducationType;
  paidBy: string;
  amount: number;
  date: string;
}

export type IncomeType = 'Příjem' | 'Výdej';

export interface Income {
  id: string;
  year: number;
  month: string;
  client: string;
  amount: number;
  type: IncomeType;
  invoiceSent?: boolean;
  paid?: boolean;
}

export interface Investment {
  id: string;
  year: number;
  date: string;
  amount: number;
  description: string;
  type: string;
}

export interface AppState {
  monthlyExpenses: MonthlyExpense[];
  educationExpenses: EducationExpense[];
  incomes: Income[];
  investments: Investment[];
  childrenInvestments: Investment[];
}
