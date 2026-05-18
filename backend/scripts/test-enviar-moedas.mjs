import { prisma } from "../src/prisma/client.js";
import { enviarMoedas } from "../src/services/business.service.js";

async function ensureProfessor() {
  const professorEmail = "professor-teste@sme.local";
  const existingProfessor = await prisma.professor.findFirst({
    where: { usuario: { email: professorEmail } },
    include: { usuario: true },
  });
  if (existingProfessor) {
    return existingProfessor;
  }

  const usuario = await prisma.usuario.create({
    data: {
      nome: "Professor de Teste",
      email: professorEmail,
      senhaHash: "test", // valor irrelevante para este script
      role: "PROFESSOR",
    },
  });

  const instituicao = await prisma.instituicao.findFirst();
  if (!instituicao) {
    throw new Error("Nenhuma instituição encontrada no banco. Rode prisma seed primeiro.");
  }

  return prisma.professor.create({
    data: {
      usuarioId: usuario.id,
      cpf: `99999999990`,
      departamento: "Teste",
      saldoMoedas: 1000,
      instituicaoId: instituicao.id,
    },
    include: { usuario: true },
  });
}

async function ensureAluno() {
  const alunoEmail = "aliceshikida12@gmail.com";
  const existingAluno = await prisma.aluno.findFirst({
    where: { usuario: { email: alunoEmail } },
    include: { usuario: true },
  });
  if (existingAluno) {
    return existingAluno;
  }

  const usuario = await prisma.usuario.create({
    data: {
      nome: "Aluno de Teste",
      email: alunoEmail,
      senhaHash: "test",
      role: "ALUNO",
    },
  });

  const instituicao = await prisma.instituicao.findFirst();
  if (!instituicao) {
    throw new Error("Nenhuma instituição encontrada no banco. Rode prisma seed primeiro.");
  }

  return prisma.aluno.create({
    data: {
      usuarioId: usuario.id,
      cpf: `88888888880`,
      rg: "1234567",
      endereco: "Rua de Teste, 123",
      curso: "Engenharia",
      saldoMoedas: 0,
      instituicaoId: instituicao.id,
    },
    include: { usuario: true },
  });
}

async function main() {
  try {
    const professor = await ensureProfessor();
    const aluno = await ensureAluno();

    console.log("Professor:", professor.usuario.email, "Aluno:", aluno.usuario.email);
    console.log("Saldo atual do aluno:", aluno.saldoMoedas);

    await enviarMoedas({
      professorUserId: professor.usuarioId,
      alunoId: aluno.id,
      quantidade: 10,
      mensagem: "Teste automático de envio de moedas e notificação.",
    });

    const updatedAluno = await prisma.aluno.findUnique({
      where: { id: aluno.id },
      include: { usuario: true },
    });

    console.log("Saldo atualizado do aluno:", updatedAluno.saldoMoedas);
    console.log("Teste concluído. Verifique o e-mail do aluno.");
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
