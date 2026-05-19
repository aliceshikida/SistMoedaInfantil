/**
 * Apaga todas as vantagens (cupons, resgates) e remove envios/recebimentos de 7 moedas,
 * revertendo saldos de professor e aluno.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const MOEDAS = 7;

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

  const refundResgateByAluno = new Map();
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
    refundResgateByAluno.set(alunoId, (refundResgateByAluno.get(alunoId) || 0) + t.quantidadeMoedas);
  }

  const envios7 = await prisma.transacao.findMany({
    where: { tipo: "ENVIO", quantidadeMoedas: MOEDAS },
    select: {
      id: true,
      professorId: true,
      alunoDestinoId: true,
      quantidadeMoedas: true,
    },
  });

  const professorRefund = new Map();
  const alunoDebit = new Map();
  for (const e of envios7) {
    if (e.professorId) {
      professorRefund.set(
        e.professorId,
        (professorRefund.get(e.professorId) || 0) + e.quantidadeMoedas,
      );
    }
    if (e.alunoDestinoId) {
      alunoDebit.set(e.alunoDestinoId, (alunoDebit.get(e.alunoDestinoId) || 0) + e.quantidadeMoedas);
    }
  }

  const summary = await prisma.$transaction(async (tx) => {
    for (const [alunoId, moedas] of refundResgateByAluno) {
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

    for (const [professorId, moedas] of professorRefund) {
      await tx.professor.update({
        where: { id: professorId },
        data: { saldoMoedas: { increment: moedas } },
      });
    }
    for (const [alunoId, moedas] of alunoDebit) {
      const aluno = await tx.aluno.findUnique({ where: { id: alunoId }, select: { saldoMoedas: true } });
      if (!aluno) continue;
      await tx.aluno.update({
        where: { id: alunoId },
        data: { saldoMoedas: { decrement: Math.min(moedas, aluno.saldoMoedas) } },
      });
    }

    const delEnviosReceb = await tx.transacao.deleteMany({
      where: {
        quantidadeMoedas: MOEDAS,
        tipo: { in: ["ENVIO", "RECEBIMENTO"] },
      },
    });

    return {
      delResgates: delResgates.count,
      delCupons: delCupons.count,
      delVantagens: delVantagens.count,
      delEnviosReceb: delEnviosReceb.count,
      envios7Encontrados: envios7.length,
    };
  });

  console.log(
    JSON.stringify(
      {
        moedasAlvo: MOEDAS,
        vantagensApagadas: summary.delVantagens,
        cuponsApagados: summary.delCupons,
        resgatesApagados: summary.delResgates,
        moedasDevolvidasResgates: Object.fromEntries(refundResgateByAluno),
        enviosDe7Encontrados: summary.envios7Encontrados,
        transacoesEnvioRecebApagadas: summary.delEnviosReceb,
        moedasDevolvidasProfessores: Object.fromEntries(professorRefund),
        moedasRetiradasAlunos: Object.fromEntries(alunoDebit),
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
