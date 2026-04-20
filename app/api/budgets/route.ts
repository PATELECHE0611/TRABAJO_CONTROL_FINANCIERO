import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const budgets = await prisma.budget.findMany({
    include: {
      category: true,
      user: true
    }
  });

  const serializedBudgets = budgets.map((budget) => ({
    ...budget,
    limit: Number(budget.limit),
    spent: Number(budget.spent)
  }));

  return NextResponse.json({ data: serializedBudgets });
}

export async function POST(req: Request) {
  const { categoryId, limit, period, spent, userId } = await req.json();
  const budget = await prisma.budget.create({
    data: {
      categoryId,
      limit,
      period,
      spent: spent ?? 0,
      userId
    }
  });

  const serializedBudget = {
    ...budget,
    limit: Number(budget.limit),
    spent: Number(budget.spent)
  };

  return NextResponse.json({ data: serializedBudget }, { status: 201 });
}
