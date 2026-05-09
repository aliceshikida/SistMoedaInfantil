import { prisma } from "../prisma/client.js";

export const TransacaoDAO = {
  create(data, tx = prisma) {
    return tx.transacao.create({ data });
  },
  listByUsuario(usuarioId, { page = 1, size = 10 } = {}) {
    return prisma.transacao.findMany({
      where: { usuarioId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * size,
      take: size,
    });
  },
  countByUsuario(usuarioId) {
    return prisma.transacao.count({ where: { usuarioId } });
  },
  countEnviosByUsuario(usuarioId) {
    return prisma.transacao.count({ where: { usuarioId, tipo: "ENVIO" } });
  },
  listRecentByUsuario(usuarioId, take = 10) {
    return prisma.transacao.findMany({ where: { usuarioId }, orderBy: { createdAt: "desc" }, take });
  },
  listRecentEnviosByUsuario(usuarioId, take = 10) {
    return prisma.transacao.findMany({
      where: { usuarioId, tipo: "ENVIO" },
      orderBy: { createdAt: "desc" },
      take,
    });
  },
  listDistinctAlunosReconhecidos(usuarioId) {
    return prisma.transacao.findMany({
      where: { usuarioId, tipo: "ENVIO", alunoDestinoId: { not: null } },
      distinct: ["alunoDestinoId"],
    });
  },
  sumMoedasDistribuidas() {
    return prisma.transacao.aggregate({ _sum: { quantidadeMoedas: true } });
  },
};
