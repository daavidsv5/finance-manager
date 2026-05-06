import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { id, year, date, amount, description, type } = await req.json();
  await sql`INSERT INTO investments (id, year, date, amount, description, type) VALUES (${id}, ${year}, ${date}, ${amount}, ${description ?? ''}, ${type})`;
  return NextResponse.json({ ok: true });
}
