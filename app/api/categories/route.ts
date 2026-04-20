import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany();
  return NextResponse.json({ data: categories });
}

export async function POST(req: Request) {
  const { name, color } = await req.json();
  const category = await prisma.category.create({
    data: {
      name,
      color
    }
  });

  return NextResponse.json({ data: category }, { status: 201 });
}
