import { prisma } from "../prisma/client.js";

export const VantagemDAO = {
  create(data) {
    return prisma.vantagem.create({ data });
  },
  findById(id, include = {}) {
    return prisma.vantagem.findUnique({ where: { id }, include });
  },
  listPublic() {
    return prisma.vantagem.findMany({
      include: { empresa: { include: { usuario: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  listByEmpresa(empresaId) {
    return prisma.vantagem.findMany({ where: { empresaId }, orderBy: { createdAt: "desc" } });
  },
  countByEmpresa(empresaId) {
    return prisma.vantagem.count({ where: { empresaId } });
  },
};
