import { prisma } from "../prisma/client.js";

export const UsuarioDAO = {
  findById(id, include = {}) {
    return prisma.usuario.findUnique({ where: { id }, include });
  },
  findByEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },
  findByEmailOrNome(value) {
    return prisma.usuario.findFirst({ where: { OR: [{ email: value }, { nome: value }] } });
  },
  create(data) {
    return prisma.usuario.create({ data });
  },
  count() {
    return prisma.usuario.count();
  },
};
