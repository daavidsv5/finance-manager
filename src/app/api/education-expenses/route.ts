import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { id, name, type, paidBy, amount, date } = await req.json();
  await sql`INSERT INTO education_expenses (id, name, type, paid_by, amount, date) VALUES (${id}, ${name}, ${type}, ${paidBy}, ${amount}, ${date})`;
  return NextResponse.json({ ok: true });
}
