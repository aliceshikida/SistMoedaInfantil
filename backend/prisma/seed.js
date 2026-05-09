import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const instituicoes = await Promise.all(
    ["Instituto Federal", "Universidade Estadual", "Faculdade Tecnica"].map(
      (nome) =>
        prisma.instituicao.upsert({
          where: { nome },
          update: {},
          create: { nome },
        }),
    ),
  );

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.usuario.upsert({
    where: { email: "admin@sme.local" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@sme.local",
      senhaHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  for (let i = 1; i <= 2; i += 1) {
    const email = `professor${i}@sme.local`;
    const senhaHash = await bcrypt.hash("Professor@123", 10);
    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        nome: `Professor ${i}`,
        email,
        senhaHash,
        role: Role.PROFESSOR,
      },
    });

    await prisma.professor.upsert({
      where: { usuarioId: usuario.id },
      update: {},
      create: {
        usuarioId: usuario.id,
        cpf: `1111111111${i}`,
        departamento: "Tecnologia",
        instituicaoId: instituicoes[0].id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
