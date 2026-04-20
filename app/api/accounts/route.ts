import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const accounts = await prisma.account.findMany({ include: { user: true } });
  const serializedAccounts = accounts.map((account) => ({
    ...account,
    balance: Number(account.balance)
  }));
  return NextResponse.json({ data: serializedAccounts });
}

export async function POST(req: Request) {
  const { name, type, balance, userId } = await req.json();
  const account = await prisma.account.create({
    data: {
      name,
      type,
      balance: balance ?? 0,
      userId
    }
  });

  const serializedAccount = {
    ...account,
    balance: Number(account.balance)
  };

  return NextResponse.json({ data: serializedAccount }, { status: 201 });
}
