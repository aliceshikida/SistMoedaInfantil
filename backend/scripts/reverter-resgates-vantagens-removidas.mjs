/**
 * Devolve ao saldo dos alunos as moedas gastas em resgates cuja vantagem já não existe
 * (vantagemId null após apagar vantagens) e remove essas linhas de Transacao.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const resgates = await prisma.transacao.findMany({
    where: { tipo: "RESGATE", vantagemId: null },
    select: { id: true, alunoOrigemId: true, usuarioId: true, quantidadeMoedas: true },
  });

  const byAluno = new Map();

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
    byAluno.set(alunoId, (byAluno.get(alunoId) || 0) + t.quantidadeMoedas);
  }

  const deleted = await prisma.$transaction(async (tx) => {
    for (const [alunoId, moedas] of byAluno) {
      await tx.aluno.update({
        where: { id: alunoId },
        data: { saldoMoedas: { increment: moedas } },
      });
    }
    return tx.transacao.deleteMany({
      where: { tipo: "RESGATE", vantagemId: null },
    });
  });

  console.log(
    JSON.stringify(
      {
        resgatesEncontrados: resgates.length,
        alunosComCredito: byAluno.size,
        moedasDevolvidasPorAluno: Object.fromEntries(byAluno),
        transacoesApagadas: deleted.count,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
