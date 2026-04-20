import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { balance } = await request.json();

    if (balance === undefined || balance === null) {
      return NextResponse.json(
        { error: 'Balance is required' },
        { status: 400 }
      );
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      return NextResponse.json(
        { error: 'Balance must be a valid number' },
        { status: 400 }
      );
    }

    console.log(`Updating account ${params.id} with balance:`, numBalance);

    const account = await prisma.account.update({
      where: { id: params.id },
      data: { balance: numBalance },
      include: {
        user: true,
        transactions: true
      }
    });

    console.log(`Account ${params.id} updated successfully`);
    const serializedAccount = {
      ...account,
      balance: Number(account.balance),
      transactions: account.transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount)
      }))
    };

    return NextResponse.json({ data: serializedAccount });
  } catch (error) {
    console.error('Error updating account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = await prisma.account.delete({
      where: { id: params.id }
    });

    const serializedAccount = {
      ...account,
      balance: Number(account.balance)
    };

    return NextResponse.json({ data: serializedAccount });
  } catch (error) {
    console.error('Error deleting account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
