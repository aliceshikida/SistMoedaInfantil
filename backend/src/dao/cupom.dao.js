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
};
