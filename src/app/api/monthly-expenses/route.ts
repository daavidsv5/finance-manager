import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { id, name, category, amount, date } = await req.json();
  await sql`INSERT INTO monthly_expenses (id, name, category, amount, date) VALUES (${id}, ${name}, ${category}, ${amount}, ${date})`;
  return NextResponse.json({ ok: true });
}
