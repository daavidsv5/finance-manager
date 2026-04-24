'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, MonthlyExpense, EducationExpense, Income, Investment } from '@/types';
import { initialMonthlyExpenses, initialEducationExpenses, initialIncomes, initialInvestments } from './initialData';

const STORAGE_KEY = 'finance_manager_data';

const defaultState: AppState = {
  monthlyExpenses: initialMonthlyExpenses,
  educationExpenses: initialEducationExpenses,
  incomes: initialIncomes,
  investments: initialInvestments,
};

interface StoreContextType {
  state: AppState;
  addMonthlyExpense: (expense: Omit<MonthlyExpense, 'id'>) => void;
  addEducationExpense: (expense: Omit<EducationExpense, 'id'>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  deleteMonthlyExpense: (id: string) => void;
  deleteEducationExpense: (id: string) => void;
  deleteIncome: (id: string) => void;
  deleteInvestment: (id: string) => void;
  updateIncome: (id: string, updates: Partial<Omit<Income, 'id'>>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const addMonthlyExpense = (expense: Omit<MonthlyExpense, 'id'>) => {
    setState(prev => ({
      ...prev,
      monthlyExpenses: [...prev.monthlyExpenses, { ...expense, id: `me-${Date.now()}` }],
    }));
  };

  const addEducationExpense = (expense: Omit<EducationExpense, 'id'>) => {
    setState(prev => ({
      ...prev,
      educationExpenses: [...prev.educationExpenses, { ...expense, id: `edu-${Date.now()}` }],
    }));
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    setState(prev => ({
      ...prev,
      incomes: [...prev.incomes, { ...income, id: `inc-${Date.now()}` }],
    }));
  };

  const addInvestment = (investment: Omit<Investment, 'id'>) => {
    setState(prev => ({
      ...prev,
      investments: [...prev.investments, { ...investment, id: `inv-${Date.now()}` }],
    }));
  };

  const deleteMonthlyExpense = (id: string) => {
    setState(prev => ({ ...prev, monthlyExpenses: prev.monthlyExpenses.filter(e => e.id !== id) }));
  };

  const deleteEducationExpense = (id: string) => {
    setState(prev => ({ ...prev, educationExpenses: prev.educationExpenses.filter(e => e.id !== id) }));
  };

  const deleteIncome = (id: string) => {
    setState(prev => ({ ...prev, incomes: prev.incomes.filter(e => e.id !== id) }));
  };

  const deleteInvestment = (id: string) => {
    setState(prev => ({ ...prev, investments: prev.investments.filter(e => e.id !== id) }));
  };

  const updateIncome = (id: string, updates: Partial<Omit<Income, 'id'>>) => {
    setState(prev => ({
      ...prev,
      incomes: prev.incomes.map(inc => inc.id === id ? { ...inc, ...updates } : inc),
    }));
  };

  return (
    <StoreContext.Provider value={{
      state,
      addMonthlyExpense,
      addEducationExpense,
      addIncome,
      addInvestment,
      deleteMonthlyExpense,
      deleteEducationExpense,
      deleteIncome,
      deleteInvestment,
      updateIncome,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
