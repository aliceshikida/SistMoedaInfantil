import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentSemesterKey } from "../src/utils/semester.js";

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

  const professores = [
    {
      nome: "professor",
      email: "professor@dominio.com",
      senha: "12345678",
      cpf: "11111111111",
      departamento: "Tecnologia",
    },
    {
      nome: "Professor 2",
      email: "professor2@sme.local",
      senha: "12345678",
      cpf: "11111111112",
      departamento: "Tecnologia",
    },
  ];

  for (const professor of professores) {
    const senhaHash = await bcrypt.hash(professor.senha, 10);
    const existingProfessor = await prisma.professor.findUnique({
      where: { cpf: professor.cpf },
      include: { usuario: true },
    });

    if (existingProfessor) {
      const emailOwner = await prisma.usuario.findUnique({
        where: { email: professor.email },
      });
      if (emailOwner && emailOwner.id !== existingProfessor.usuarioId) {
        await prisma.usuario.update({
          where: { id: emailOwner.id },
          data: { email: `legacy-${Date.now()}-${professor.email}` },
        });
      }
      await prisma.usuario.update({
        where: { id: existingProfessor.usuarioId },
        data: {
          nome: professor.nome,
          email: professor.email,
          senhaHash,
          role: Role.PROFESSOR,
        },
      });
      await prisma.professor.update({
        where: { id: existingProfessor.id },
        data: {
          departamento: professor.departamento,
          ultimoSemestreCredito: getCurrentSemesterKey(),
          instituicaoId: instituicoes[0].id,
        },
      });
      continue;
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome: professor.nome,
        email: professor.email,
        senhaHash,
        role: Role.PROFESSOR,
      },
    });

    await prisma.professor.create({
      data: {
        usuarioId: usuario.id,
        cpf: professor.cpf,
        departamento: professor.departamento,
        ultimoSemestreCredito: getCurrentSemesterKey(),
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
