'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, MonthlyExpense, EducationExpense, Income, Investment } from '@/types';
import { initialMonthlyExpenses, initialEducationExpenses, initialIncomes, initialInvestments, initialChildrenInvestments } from './initialData';

const defaultState: AppState = {
  monthlyExpenses: initialMonthlyExpenses,
  educationExpenses: initialEducationExpenses,
  incomes: initialIncomes,
  investments: initialInvestments,
  childrenInvestments: initialChildrenInvestments,
};

interface StoreContextType {
  state: AppState;
  dbLoaded: boolean;
  addMonthlyExpense: (expense: Omit<MonthlyExpense, 'id'>) => void;
  addEducationExpense: (expense: Omit<EducationExpense, 'id'>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  addChildInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateEducationExpense: (id: string, updates: Partial<Omit<EducationExpense, 'id'>>) => void;
  updateInvestment: (id: string, updates: Partial<Omit<Investment, 'id'>>) => void;
  updateChildInvestment: (id: string, updates: Partial<Omit<Investment, 'id'>>) => void;
  deleteMonthlyExpense: (id: string) => void;
  deleteEducationExpense: (id: string) => void;
  deleteIncome: (id: string) => void;
  deleteInvestment: (id: string) => void;
  deleteChildInvestment: (id: string) => void;
  updateIncome: (id: string, updates: Partial<Omit<Income, 'id'>>) => void;
  updateMonthlyExpense: (id: string, updates: Partial<Omit<MonthlyExpense, 'id'>>) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const call = (path: string, method: string, body?: unknown) => {
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {});
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(data => { setState(data); setDbLoaded(true); })
      .catch(() => setDbLoaded(true));
  }, []);

  const addMonthlyExpense = (expense: Omit<MonthlyExpense, 'id'>) => {
    const item = { ...expense, id: `me-${Date.now()}` };
    setState(prev => ({ ...prev, monthlyExpenses: [...prev.monthlyExpenses, item] }));
    call('/api/monthly-expenses', 'POST', item);
  };

  const addEducationExpense = (expense: Omit<EducationExpense, 'id'>) => {
    const item = { ...expense, id: `edu-${Date.now()}` };
    setState(prev => ({ ...prev, educationExpenses: [...prev.educationExpenses, item] }));
    call('/api/education-expenses', 'POST', item);
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const item = { ...income, id: `inc-${Date.now()}` };
    setState(prev => ({ ...prev, incomes: [...prev.incomes, item] }));
    call('/api/incomes', 'POST', item);
  };

  const addInvestment = (investment: Omit<Investment, 'id'>) => {
    const item = { ...investment, id: `inv-${Date.now()}` };
    setState(prev => ({ ...prev, investments: [...prev.investments, item] }));
    call('/api/investments', 'POST', item);
  };

  const addChildInvestment = (investment: Omit<Investment, 'id'>) => {
    const item = { ...investment, id: `cinv-${Date.now()}` };
    setState(prev => ({ ...prev, childrenInvestments: [...(prev.childrenInvestments ?? []), item] }));
    call('/api/children-investments', 'POST', item);
  };

  const deleteMonthlyExpense = (id: string) => {
    setState(prev => ({ ...prev, monthlyExpenses: prev.monthlyExpenses.filter(e => e.id !== id) }));
    call(`/api/monthly-expenses/${id}`, 'DELETE');
  };

  const deleteEducationExpense = (id: string) => {
    setState(prev => ({ ...prev, educationExpenses: prev.educationExpenses.filter(e => e.id !== id) }));
    call(`/api/education-expenses/${id}`, 'DELETE');
  };

  const deleteIncome = (id: string) => {
    setState(prev => ({ ...prev, incomes: prev.incomes.filter(e => e.id !== id) }));
    call(`/api/incomes/${id}`, 'DELETE');
  };

  const deleteInvestment = (id: string) => {
    setState(prev => ({ ...prev, investments: prev.investments.filter(e => e.id !== id) }));
    call(`/api/investments/${id}`, 'DELETE');
  };

  const deleteChildInvestment = (id: string) => {
    setState(prev => ({ ...prev, childrenInvestments: (prev.childrenInvestments ?? []).filter(e => e.id !== id) }));
    call(`/api/children-investments/${id}`, 'DELETE');
  };

  const updateMonthlyExpense = (id: string, updates: Partial<Omit<MonthlyExpense, 'id'>>) => {
    const full = { ...state.monthlyExpenses.find(e => e.id === id)!, ...updates };
    setState(prev => ({ ...prev, monthlyExpenses: prev.monthlyExpenses.map(e => e.id === id ? full : e) }));
    call(`/api/monthly-expenses/${id}`, 'PUT', full);
  };

  const updateIncome = (id: string, updates: Partial<Omit<Income, 'id'>>) => {
    const full = { ...state.incomes.find(e => e.id === id)!, ...updates };
    setState(prev => ({ ...prev, incomes: prev.incomes.map(e => e.id === id ? full : e) }));
    call(`/api/incomes/${id}`, 'PUT', full);
  };

  const updateEducationExpense = (id: string, updates: Partial<Omit<EducationExpense, 'id'>>) => {
    const full = { ...state.educationExpenses.find(e => e.id === id)!, ...updates };
    setState(prev => ({ ...prev, educationExpenses: prev.educationExpenses.map(e => e.id === id ? full : e) }));
    call(`/api/education-expenses/${id}`, 'PUT', full);
  };

  const updateInvestment = (id: string, updates: Partial<Omit<Investment, 'id'>>) => {
    const full = { ...state.investments.find(e => e.id === id)!, ...updates };
    setState(prev => ({
      ...prev,
      investments: prev.investments.map(e => e.id === id ? full : e),
    }));
    call(`/api/investments/${id}`, 'PUT', full);
  };

  const updateChildInvestment = (id: string, updates: Partial<Omit<Investment, 'id'>>) => {
    const full = { ...(state.childrenInvestments ?? []).find(e => e.id === id)!, ...updates };
    setState(prev => ({ ...prev, childrenInvestments: (prev.childrenInvestments ?? []).map(e => e.id === id ? full : e) }));
    call(`/api/children-investments/${id}`, 'PUT', full);
  };

  return (
    <StoreContext.Provider value={{
      state,
      dbLoaded,
      addMonthlyExpense,
      addEducationExpense,
      addIncome,
      addInvestment,
      addChildInvestment,
      updateEducationExpense,
      updateInvestment,
      updateChildInvestment,
      deleteMonthlyExpense,
      deleteEducationExpense,
      deleteIncome,
      deleteInvestment,
      deleteChildInvestment,
      updateIncome,
      updateMonthlyExpense,
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
