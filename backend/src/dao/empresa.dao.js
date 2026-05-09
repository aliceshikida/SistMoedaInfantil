import { prisma } from "../prisma/client.js";

export const EmpresaDAO = {
  findByUsuarioId(usuarioId, include = {}) {
    return prisma.empresa.findUnique({ where: { usuarioId }, include });
  },
};
