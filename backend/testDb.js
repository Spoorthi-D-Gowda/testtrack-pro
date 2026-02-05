const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log("Connected to DB ✅");
    console.log(users);
  } catch (err) {
    console.error("DB Error ❌", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
