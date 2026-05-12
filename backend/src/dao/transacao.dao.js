import { prisma } from "../prisma/client.js";

export const TransacaoDAO = {
  create(data, tx = prisma) {
    return tx.transacao.create({ data });
  },
  listByUsuario(usuarioId, { page = 1, size = 10, include, order = "desc", skip: skipOverride, take: takeOverride } = {}) {
    const ord = order === "asc" ? "asc" : "desc";
    const skip =
      skipOverride != null ? skipOverride : (page - 1) * size;
    const take = takeOverride != null ? takeOverride : size;
    return prisma.transacao.findMany({
      where: { usuarioId },
      orderBy: { createdAt: ord },
      skip,
      take,
      ...(include ? { include } : {}),
    });
  },
  countByUsuario(usuarioId) {
    return prisma.transacao.count({ where: { usuarioId } });
  },
  countEnviosByUsuario(usuarioId) {
    return prisma.transacao.count({
      where: { usuarioId, tipo: "ENVIO", alunoDestinoId: { not: null } },
    });
  },
  listRecentByUsuario(usuarioId, take = 10) {
    return prisma.transacao.findMany({ where: { usuarioId }, orderBy: { createdAt: "desc" }, take });
  },
  listRecentEnviosByUsuario(usuarioId, take = 10) {
    return prisma.transacao.findMany({
      where: { usuarioId, tipo: "ENVIO", alunoDestinoId: { not: null } },
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
  sumMoedasByUsuarioAndTipo(usuarioId, tipo) {
    return prisma.transacao.aggregate({
      where: { usuarioId, tipo },
      _sum: { quantidadeMoedas: true },
    });
  },
  /** Soma de moedas enviadas a alunos (ignora lançamentos sem destino). */
  sumMoedasEnviosProfessor(usuarioId) {
    return prisma.transacao.aggregate({
      where: { usuarioId, tipo: "ENVIO", alunoDestinoId: { not: null } },
      _sum: { quantidadeMoedas: true },
    });
  },
  /** Soma de resgates do aluno (amarrada ao registro do aluno). */
  sumMoedasResgatesAluno(usuarioId, alunoOrigemId) {
    return prisma.transacao.aggregate({
      where: { usuarioId, tipo: "RESGATE", alunoOrigemId },
      _sum: { quantidadeMoedas: true },
    });
  },
  sumMoedasResgatesPorEmpresa(empresaId) {
    return prisma.transacao.aggregate({
      where: { tipo: "RESGATE", vantagem: { empresaId } },
      _sum: { quantidadeMoedas: true },
    });
  },
  sumMoedasByTipo(tipo) {
    return prisma.transacao.aggregate({
      where: { tipo },
      _sum: { quantidadeMoedas: true },
    });
  },
  sumMoedasDistribuidas() {
    return prisma.transacao.aggregate({ _sum: { quantidadeMoedas: true } });
  },
};
