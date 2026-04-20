import prisma from '../lib/prisma';

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@wealthgallery.com' },
    update: {},
    create: {
      email: 'demo@wealthgallery.com',
      name: 'Alex Mercer'
    }
  });

  const categories = await Promise.all(
    [
      { name: 'Alimentación', color: '#ef4444' },
      { name: 'Transporte', color: '#0ea5e9' },
      { name: 'Salud', color: '#10b981' },
      { name: 'Ocio', color: '#84cc16' },
      { name: 'Ingresos', color: '#14b8a6' },
      { name: 'Electrónicos', color: '#6366f1' }
    ].map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: { color: category.color },
        create: category
      })
    )
  );

  const accounts = await Promise.all(
    [
      { name: 'Cuenta Corriente', type: 'CHECKING', balance: 4200000 },
      { name: 'Cuenta Ahorros', type: 'SAVINGS', balance: 8200000 },
      { name: 'Tarjeta Platinum', type: 'CREDIT', balance: -1830000 }
    ].map((account) =>
      prisma.account.upsert({
        where: { name_userId: { name: account.name, userId: user.id } },
        update: { balance: account.balance },
        create: { ...account, userId: user.id }
      })
    )
  );

  const [alimentacion, transporte, salud, ocio, ingresos, electronicos] = categories;
  const [corriente, ahorros, tarjeta] = accounts;

  await prisma.transaction.createMany({
    data: [
      { amount: 125400, type: 'EXPENSE', description: 'Supermercado Central', date: new Date('2026-04-20'), accountId: tarjeta.id, categoryId: alimentacion.id, userId: user.id },
      { amount: 2600000, type: 'INCOME', description: 'Nómina Mensual', date: new Date('2026-04-18'), accountId: corriente.id, categoryId: ingresos.id, userId: user.id },
      { amount: 65000, type: 'EXPENSE', description: 'Gasolinera Shell', date: new Date('2026-04-17'), accountId: tarjeta.id, categoryId: transporte.id, userId: user.id },
      { amount: 15990, type: 'EXPENSE', description: 'Suscripción Netflix', date: new Date('2026-04-15'), accountId: tarjeta.id, categoryId: ocio.id, userId: user.id }
    ]
  });

  await prisma.budget.upsert({
    where: { categoryId_userId: { categoryId: alimentacion.id, userId: user.id } },
    update: { spent: 450000, limit: 500000, period: 'MONTHLY' },
    create: { categoryId: alimentacion.id, limit: 500000, period: 'MONTHLY', spent: 450000, userId: user.id }
  });

  await prisma.budget.upsert({
    where: { categoryId_userId: { categoryId: ocio.id, userId: user.id } },
    update: { spent: 200000, limit: 500000, period: 'MONTHLY' },
    create: { categoryId: ocio.id, limit: 500000, period: 'MONTHLY', spent: 200000, userId: user.id }
  });

  await prisma.debt.upsert({
    where: { name_userId: { name: 'Hipoteca Residencia Principal', userId: user.id } },
    update: { remaining: 185000000, interestRate: 2.5, dueDate: new Date('2026-10-12'), status: 'URGENT' },
    create: { name: 'Hipoteca Residencia Principal', principal: 250000000, remaining: 185000000, interestRate: 2.5, dueDate: new Date('2026-10-12'), status: 'URGENT', userId: user.id }
  });

  await prisma.debt.upsert({
    where: { name_userId: { name: 'Préstamo Coche', userId: user.id } },
    update: { remaining: 42500000, interestRate: 3.1, dueDate: new Date('2026-10-28'), status: 'UPCOMING' },
    create: { name: 'Préstamo Coche', principal: 58000000, remaining: 42500000, interestRate: 3.1, dueDate: new Date('2026-10-28'), status: 'UPCOMING', userId: user.id }
  });

  await prisma.debt.upsert({
    where: { name_userId: { name: 'Tarjeta de Crédito', userId: user.id } },
    update: { remaining: 1830000, interestRate: 19.9, dueDate: new Date('2026-11-05'), status: 'UPCOMING' },
    create: { name: 'Tarjeta de Crédito', principal: 1830000, remaining: 1830000, interestRate: 19.9, dueDate: new Date('2026-11-05'), status: 'UPCOMING', userId: user.id }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
