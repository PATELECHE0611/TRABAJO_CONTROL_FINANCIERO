import prisma from './lib/prisma.js';

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const accountCount = await prisma.account.count();
    const transactionCount = await prisma.transaction.count();

    console.log('Database check:');
    console.log(`Users: ${userCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Accounts: ${accountCount}`);
    console.log(`Transactions: ${transactionCount}`);
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();