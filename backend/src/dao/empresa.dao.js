import { prisma } from "../prisma/client.js";

export const EmpresaDAO = {
  findByCnpj(cnpj) {
    return prisma.empresa.findUnique({ where: { cnpj } });
  },
  findByUsuarioId(usuarioId, include = {}) {
    return prisma.empresa.findUnique({ where: { usuarioId }, include });
  },
};
