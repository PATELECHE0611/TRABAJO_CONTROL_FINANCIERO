import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params;

    const deletedTransaction = await prisma.transaction.delete({
      where: { id }
    });

    const serializedTransaction = {
      ...deletedTransaction,
      amount: Number(deletedTransaction.amount)
    };

    return NextResponse.json({ data: serializedTransaction }, { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
