import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { id, year, month, client, amount, type, invoiceSent, paid } = await req.json();
  await sql`INSERT INTO incomes (id, year, month, client, amount, type, invoice_sent, paid) VALUES (${id}, ${year}, ${month}, ${client}, ${amount}, ${type}, ${invoiceSent ?? false}, ${paid ?? false})`;
  return NextResponse.json({ ok: true });
}
