import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json({ data: users });
}

export async function POST(req: Request) {
  const { email, name } = await req.json();
  const user = await prisma.user.create({
    data: {
      email,
      name
    }
  });

  return NextResponse.json({ data: user }, { status: 201 });
}
