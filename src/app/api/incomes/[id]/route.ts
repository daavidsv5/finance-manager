import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { year, month, client, amount, type, invoiceSent, paid } = await req.json();
  await sql`UPDATE incomes SET year=${year}, month=${month}, client=${client}, amount=${amount}, type=${type}, invoice_sent=${invoiceSent ?? false}, paid=${paid ?? false} WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM incomes WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
