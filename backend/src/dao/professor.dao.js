import { prisma } from "../prisma/client.js";

export const ProfessorDAO = {
  findByUsuarioId(usuarioId, include = {}) {
    return prisma.professor.findUnique({ where: { usuarioId }, include });
  },
  updateById(id, data) {
    return prisma.professor.update({ where: { id }, data });
  },
  updateSaldo(id, delta) {
    return prisma.professor.update({
      where: { id },
      data: { saldoMoedas: delta >= 0 ? { increment: delta } : { decrement: Math.abs(delta) } },
    });
  },
};
