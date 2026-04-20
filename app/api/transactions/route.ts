import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: {
        account: true,
        category: true,
        user: true
      }
    });

    const serializedTransactions = transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount)
    }));

    return NextResponse.json({ data: serializedTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const { amount, type, description, date, accountId, userId, categoryId } = await req.json();
    
    // Validate required fields
    if (!amount || !type || !accountId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, type, accountId, userId' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return NextResponse.json(
        { error: 'Type must be INCOME or EXPENSE' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    console.log('Creating transaction:', { amount: numAmount, type, accountId, userId });

    const transaction = await prisma.transaction.create({
      data: {
        amount: numAmount,
        type,
        description,
        date: new Date(date),
        accountId,
        userId,
        categoryId: categoryId || null
      },
      include: {
        account: true,
        category: true,
        user: true
      }
    });

    console.log('Transaction created successfully:', transaction.id);
    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
