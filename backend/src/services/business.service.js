import { TipoTransacao } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { createCouponCode } from "../utils/coupon.js";
import { sendMail } from "./email.service.js";

export async function enviarMoedas({ professorUserId, alunoId, quantidade, mensagem }) {
  const professor = await prisma.professor.findUnique({
    where: { usuarioId: professorUserId },
    include: { usuario: true },
  });
  if (!professor) throw { status: 404, message: "Professor não encontrado." };
  if (professor.saldoMoedas < quantidade) throw { status: 400, message: "Saldo insuficiente." };
  const aluno = await prisma.aluno.findUnique({
    where: { id: alunoId },
    include: { usuario: true },
  });
  if (!aluno) throw { status: 404, message: "Aluno não encontrado." };

  return prisma.$transaction(async (tx) => {
    await tx.professor.update({
      where: { id: professor.id },
      data: { saldoMoedas: { decrement: quantidade } },
    });
    await tx.aluno.update({
      where: { id: aluno.id },
      data: { saldoMoedas: { increment: quantidade } },
    });
    await tx.transacao.create({
      data: {
        tipo: TipoTransacao.ENVIO,
        descricao: mensagem,
        quantidadeMoedas: quantidade,
        usuarioId: professor.usuarioId,
        professorId: professor.id,
        alunoDestinoId: aluno.id,
      },
    });
    await tx.transacao.create({
      data: {
        tipo: TipoTransacao.RECEBIMENTO,
        descricao: `Recebimento de moedas de ${professor.usuario.nome}.`,
        quantidadeMoedas: quantidade,
        usuarioId: aluno.usuarioId,
        professorId: professor.id,
        alunoDestinoId: aluno.id,
      },
    });
    await sendMail({
      to: aluno.usuario.email,
      subject: "Você recebeu moedas",
      title: "Parabéns!",
      body: `<p>Você recebeu <strong>${quantidade}</strong> moedas.</p><p>Mensagem: ${mensagem}</p>`,
    });
  });
}

export async function resgatarVantagem({ alunoUserId, vantagemId }) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: alunoUserId },
    include: { usuario: true },
  });
  const vantagem = await prisma.vantagem.findUnique({
    where: { id: vantagemId },
    include: { empresa: { include: { usuario: true } } },
  });
  if (!aluno || !vantagem) throw { status: 404, message: "Aluno ou vantagem inválida." };
  if (aluno.saldoMoedas < vantagem.custoMoedas) throw { status: 400, message: "Saldo insuficiente." };

  return prisma.$transaction(async (tx) => {
    await tx.aluno.update({
      where: { id: aluno.id },
      data: { saldoMoedas: { decrement: vantagem.custoMoedas } },
    });
    const cupom = await tx.cupom.create({
      data: {
        codigo: createCouponCode(),
        usuarioId: aluno.usuarioId,
        vantagemId: vantagem.id,
      },
    });
    await tx.transacao.create({
      data: {
        tipo: TipoTransacao.RESGATE,
        descricao: `Resgate de vantagem: ${vantagem.titulo}`,
        quantidadeMoedas: vantagem.custoMoedas,
        usuarioId: aluno.usuarioId,
        alunoOrigemId: aluno.id,
      },
    });
    await sendMail({
      to: aluno.usuario.email,
      subject: "Cupom gerado com sucesso",
      title: "Seu resgate foi concluído",
      body: `<p>Vantagem: ${vantagem.titulo}</p><p>Código: <strong>${cupom.codigo}</strong></p>`,
    });
    await sendMail({
      to: vantagem.empresa.usuario.email,
      subject: "Novo resgate em sua vantagem",
      title: "Um aluno resgatou sua vantagem",
      body: `<p>Vantagem: ${vantagem.titulo}</p><p>Código: ${cupom.codigo}</p>`,
    });
    return cupom;
  });
}
