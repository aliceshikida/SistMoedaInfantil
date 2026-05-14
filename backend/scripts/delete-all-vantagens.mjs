import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const result = await prisma.vantagem.deleteMany({});
  console.log("Vantagens apagadas:", result.count);
} finally {
  await prisma.$disconnect();
}
