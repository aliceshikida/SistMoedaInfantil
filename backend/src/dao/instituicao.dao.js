import { prisma } from "../prisma/client.js";

export const InstituicaoDAO = {
  listAll() {
    return prisma.instituicao.findMany({ orderBy: { nome: "asc" } });
  },
};
