/**
 * Apaga todas as vantagens, cupons associados, transações de RESGATE com vantagem
 * e devolve ao saldo dos alunos as moedas gastas nesses resgates.
 * Remove ficheiros de foto em uploads/ referenciados pelas vantagens.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function tryRemoveUploadFile(fotoPath) {
  if (!fotoPath || typeof fotoPath !== "string" || !fotoPath.startsWith("/uploads/")) return;
  const name = path.basename(fotoPath);
  if (!name || name === "." || name === "..") return;
  const filePath = path.join(UPLOADS_DIR, name);
  if (!filePath.startsWith(UPLOADS_DIR)) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.warn("Não foi possível apagar ficheiro:", filePath, e.message);
  }
}

try {
  const vantagens = await prisma.vantagem.findMany({ select: { id: true, foto: true } });
  for (const v of vantagens) tryRemoveUploadFile(v.foto);

  const resgates = await prisma.transacao.findMany({
    where: { tipo: "RESGATE", vantagemId: { not: null } },
    select: { id: true, alunoOrigemId: true, usuarioId: true, quantidadeMoedas: true },
  });

  const refundByAlunoId = new Map();
  for (const t of resgates) {
    let alunoId = t.alunoOrigemId;
    if (!alunoId) {
      const aluno = await prisma.aluno.findUnique({
        where: { usuarioId: t.usuarioId },
        select: { id: true },
      });
      alunoId = aluno?.id;
    }
    if (!alunoId) continue;
    refundByAlunoId.set(alunoId, (refundByAlunoId.get(alunoId) || 0) + t.quantidadeMoedas);
  }

  const summary = await prisma.$transaction(async (tx) => {
    for (const [alunoId, moedas] of refundByAlunoId) {
      await tx.aluno.update({
        where: { id: alunoId },
        data: { saldoMoedas: { increment: moedas } },
      });
    }
    const delResgates = await tx.transacao.deleteMany({
      where: { tipo: "RESGATE", vantagemId: { not: null } },
    });
    const delCupons = await tx.cupom.deleteMany({});
    const delVantagens = await tx.vantagem.deleteMany({});
    return { delResgates: delResgates.count, delCupons: delCupons.count, delVantagens: delVantagens.count };
  });

  console.log(
    JSON.stringify(
      {
        vantagensComFotoRemovida: vantagens.filter((v) => v.foto).length,
        resgatesConsiderados: resgates.length,
        moedasDevolvidasPorAluno: Object.fromEntries(refundByAlunoId),
        transacoesResgateApagadas: summary.delResgates,
        cuponsApagados: summary.delCupons,
        vantagensApagadas: summary.delVantagens,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
