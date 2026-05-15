/**
 * Lista vantagens na base apontada por DATABASE_URL (.env ou 1.º argumento).
 * Uso: node scripts/print-vantagens.mjs
 *       node scripts/print-vantagens.mjs "postgresql://..."
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const cli = process.argv[2]?.trim();
if (cli) {
  process.env.DATABASE_URL = cli;
  console.warn("[SME] DATABASE_URL = 1.º argumento (produção).\n");
}

function describeDb() {
  const u = process.env.DATABASE_URL || "";
  if (!u) return "(sem DATABASE_URL)";
  if (u.startsWith("file:")) return `SQLite: ${u.replace(/^file:\.?\//, "")}`;
  const host = u.match(/@([^/?]+)/)?.[1];
  return host ? `Postgres @ ${host}` : "Postgres";
}

const prisma = new PrismaClient();

try {
  console.log(`Base: ${describeDb()}\n`);
  const rows = await prisma.vantagem.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      titulo: true,
      custoMoedas: true,
      empresa: { select: { usuario: { select: { email: true, nome: true } } } },
    },
  });
  console.log(`Total: ${rows.length}\n`);
  for (const r of rows) {
    console.log(`- ${r.titulo} (${r.custoMoedas} moedas) id=${r.id}`);
    console.log(`  empresa: ${r.empresa?.usuario?.nome ?? "?"} <${r.empresa?.usuario?.email ?? "?"}>`);
  }
  if (rows.length === 0) {
    console.log("(Nenhuma vantagem nesta base.)");
  }
} finally {
  await prisma.$disconnect();
}
