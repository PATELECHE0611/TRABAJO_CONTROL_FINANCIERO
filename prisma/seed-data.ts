import prisma from '../lib/prisma';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando creación de datos de prueba...');

    // Clean existing data
    await prisma.transaction.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.debt.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'usuario@ejemplo.com',
        name: 'Usuario de Prueba'
      }
    });
    console.log('✅ Usuario creado:', user.email);

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Salario', color: '#10b981' }
      }),
      prisma.category.create({
        data: { name: 'Supermercado', color: '#ef4444' }
      }),
      prisma.category.create({
        data: { name: 'Servicios', color: '#f59e0b' }
      }),
      prisma.category.create({
        data: { name: 'Diversión', color: '#8b5cf6' }
      })
    ]);
    console.log('✅ Categorías creadas:', categories.length);

    // Create accounts
    const accounts = await Promise.all([
      prisma.account.create({
        data: {
          name: 'Cuenta Corriente Principal',
          type: 'CHECKING',
          balance: 5000000,
          userId: user.id
        }
      }),
      prisma.account.create({
        data: {
          name: 'Cuenta de Ahorros',
          type: 'SAVINGS',
          balance: 2000000,
          userId: user.id
        }
      }),
      prisma.account.create({
        data: {
          name: 'Tarjeta de Crédito',
          type: 'CREDIT',
          balance: -500000,
          userId: user.id
        }
      })
    ]);
    console.log('✅ Cuentas creadas:', accounts.length);

    // Create sample transactions
    const today = new Date();
    const transactions = await Promise.all([
      prisma.transaction.create({
        data: {
          amount: 3000000,
          type: 'INCOME',
          description: 'Salario mensual',
          date: new Date(today.getFullYear(), today.getMonth(), 1),
          accountId: accounts[0].id,
          categoryId: categories[0].id,
          userId: user.id
        }
      }),
      prisma.transaction.create({
        data: {
          amount: 500000,
          type: 'EXPENSE',
          description: 'Compras en supermercado',
          date: new Date(today.getFullYear(), today.getMonth(), 5),
          accountId: accounts[0].id,
          categoryId: categories[1].id,
          userId: user.id
        }
      }),
      prisma.transaction.create({
        data: {
          amount: 200000,
          type: 'EXPENSE',
          description: 'Servicios (luz, agua)',
          date: new Date(today.getFullYear(), today.getMonth(), 10),
          accountId: accounts[0].id,
          categoryId: categories[2].id,
          userId: user.id
        }
      })
    ]);
    console.log('✅ Transacciones creadas:', transactions.length);

    console.log('\n✨ Base de datos inicializada exitosamente!\n');
    console.log('Credenciales de prueba:');
    console.log(`Email: ${user.email}`);
    console.log(`ID Usuario: ${user.id}\n`);
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
