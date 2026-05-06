import { sql } from './db';
import {
  initialMonthlyExpenses,
  initialEducationExpenses,
  initialIncomes,
  initialInvestments,
  initialChildrenInvestments,
} from './initialData';

let initialized = false;

export async function setupDB() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS monthly_expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS education_expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      paid_by TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS incomes (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      month TEXT NOT NULL,
      client TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      invoice_sent BOOLEAN NOT NULL DEFAULT FALSE,
      paid BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS children_investments (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL
    )
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM monthly_expenses`;

  if (count === 0) {
    await sql`
      INSERT INTO monthly_expenses (id, name, category, amount, date)
      SELECT unnest(${initialMonthlyExpenses.map(e => e.id)}::text[]),
             unnest(${initialMonthlyExpenses.map(e => e.name)}::text[]),
             unnest(${initialMonthlyExpenses.map(e => e.category)}::text[]),
             unnest(${initialMonthlyExpenses.map(e => e.amount)}::int[]),
             unnest(${initialMonthlyExpenses.map(e => e.date)}::text[])
    `;

    await sql`
      INSERT INTO education_expenses (id, name, type, paid_by, amount, date)
      SELECT unnest(${initialEducationExpenses.map(e => e.id)}::text[]),
             unnest(${initialEducationExpenses.map(e => e.name)}::text[]),
             unnest(${initialEducationExpenses.map(e => e.type)}::text[]),
             unnest(${initialEducationExpenses.map(e => e.paidBy)}::text[]),
             unnest(${initialEducationExpenses.map(e => e.amount)}::int[]),
             unnest(${initialEducationExpenses.map(e => e.date)}::text[])
    `;

    await sql`
      INSERT INTO incomes (id, year, month, client, amount, type, invoice_sent, paid)
      SELECT unnest(${initialIncomes.map(e => e.id)}::text[]),
             unnest(${initialIncomes.map(e => e.year)}::int[]),
             unnest(${initialIncomes.map(e => e.month)}::text[]),
             unnest(${initialIncomes.map(e => e.client)}::text[]),
             unnest(${initialIncomes.map(e => e.amount)}::int[]),
             unnest(${initialIncomes.map(e => e.type)}::text[]),
             unnest(${initialIncomes.map(e => e.invoiceSent ?? false)}::bool[]),
             unnest(${initialIncomes.map(e => e.paid ?? false)}::bool[])
    `;

    await sql`
      INSERT INTO investments (id, year, date, amount, description, type)
      SELECT unnest(${initialInvestments.map(e => e.id)}::text[]),
             unnest(${initialInvestments.map(e => e.year)}::int[]),
             unnest(${initialInvestments.map(e => e.date)}::text[]),
             unnest(${initialInvestments.map(e => e.amount)}::int[]),
             unnest(${initialInvestments.map(e => e.description)}::text[]),
             unnest(${initialInvestments.map(e => e.type)}::text[])
    `;

    await sql`
      INSERT INTO children_investments (id, year, date, amount, description, type)
      SELECT unnest(${initialChildrenInvestments.map(e => e.id)}::text[]),
             unnest(${initialChildrenInvestments.map(e => e.year)}::int[]),
             unnest(${initialChildrenInvestments.map(e => e.date)}::text[]),
             unnest(${initialChildrenInvestments.map(e => e.amount)}::int[]),
             unnest(${initialChildrenInvestments.map(e => e.description)}::text[]),
             unnest(${initialChildrenInvestments.map(e => e.type)}::text[])
    `;
  }

  initialized = true;
}
