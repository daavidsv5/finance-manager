import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, category, amount, date } = await req.json();
  await sql`UPDATE monthly_expenses SET name=${name}, category=${category}, amount=${amount}, date=${date} WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM monthly_expenses WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
