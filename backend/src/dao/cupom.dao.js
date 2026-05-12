import { prisma } from "../prisma/client.js";

export const CupomDAO = {
  create(data, tx = prisma) {
    return tx.cupom.create({ data });
  },
  listByUsuario(usuarioId, include = {}) {
    return prisma.cupom.findMany({ where: { usuarioId }, include, orderBy: { createdAt: "desc" } });
  },
  listByEmpresa(empresaId, include = {}) {
    return prisma.cupom.findMany({
      where: { vantagem: { empresaId } },
      include,
      orderBy: { createdAt: "desc" },
    });
  },
  countByEmpresa(empresaId) {
    return prisma.cupom.count({ where: { vantagem: { empresaId } } });
  },
  countByVantagemId(vantagemId) {
    return prisma.cupom.count({ where: { vantagemId } });
  },
  /** Soma dos custos em moedas de todos os cupons resgatados nas vantagens da empresa. */
  async sumMoedasResgatadasByEmpresa(empresaId) {
    const rows = await prisma.cupom.findMany({
      where: { vantagem: { empresaId } },
      select: { vantagem: { select: { custoMoedas: true } } },
    });
    return rows.reduce((acc, row) => acc + row.vantagem.custoMoedas, 0);
  },
};
