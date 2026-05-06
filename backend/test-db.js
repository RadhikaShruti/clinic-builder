// test-db.js
const prisma = require('./src/lib/prisma');

async function main() {
  try {
    // This will try to count the users in your DB
    const count = await prisma.user.count(); 
    console.log(`Successfully connected! User count: ${count}`);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();