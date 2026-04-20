import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const debts = await prisma.debt.findMany({
    orderBy: { dueDate: 'asc' }
  });

  const serializedDebts = debts.map((debt) => ({
    ...debt,
    principal: Number(debt.principal),
    remaining: Number(debt.remaining)
  }));

  return NextResponse.json({ data: serializedDebts });
}

export async function POST(req: Request) {
  const { name, principal, remaining, interestRate, dueDate, status, userId } = await req.json();
  const debt = await prisma.debt.create({
    data: {
      name,
      principal,
      remaining,
      interestRate,
      dueDate: new Date(dueDate),
      status,
      userId
    }
  });

  const serializedDebt = {
    ...debt,
    principal: Number(debt.principal),
    remaining: Number(debt.remaining)
  };

  return NextResponse.json({ data: serializedDebt }, { status: 201 });
}
