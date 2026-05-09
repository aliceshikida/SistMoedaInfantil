import { prisma } from "../prisma/client.js";

export const AlunoDAO = {
  findById(id, include = {}) {
    return prisma.aluno.findUnique({ where: { id }, include });
  },
  findByUsuarioId(usuarioId, include = {}) {
    return prisma.aluno.findUnique({ where: { usuarioId }, include });
  },
  listAll(include = {}) {
    return prisma.aluno.findMany({ include, orderBy: { createdAt: "desc" } });
  },
  updateSaldo(id, delta) {
    return prisma.aluno.update({
      where: { id },
      data: { saldoMoedas: delta >= 0 ? { increment: delta } : { decrement: Math.abs(delta) } },
    });
  },
};
