import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { year, date, amount, type } = await req.json();
  await sql`UPDATE children_investments SET year=${year}, date=${date}, amount=${amount}, type=${type} WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM children_investments WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
