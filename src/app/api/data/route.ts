import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { setupDB } from '@/lib/setupDB';

export async function GET() {
  await setupDB();

  const [monthlyExpenses, educationExpenses, incomes, investments, childrenInvestments] =
    await Promise.all([
      sql`SELECT id, name, category, amount, date FROM monthly_expenses ORDER BY name`,
      sql`SELECT id, name, type, paid_by AS "paidBy", amount, date FROM education_expenses ORDER BY date DESC`,
      sql`SELECT id, year, month, client, amount, type, invoice_sent AS "invoiceSent", paid FROM incomes ORDER BY year DESC, id`,
      sql`SELECT id, year, date, amount, description, type FROM investments ORDER BY date DESC`,
      sql`SELECT id, year, date, amount, description, type FROM children_investments ORDER BY date DESC`,
    ]);

  return NextResponse.json({ monthlyExpenses, educationExpenses, incomes, investments, childrenInvestments });
}
