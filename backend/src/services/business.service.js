import { TipoTransacao } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { AlunoDAO } from "../dao/aluno.dao.js";
import { ProfessorDAO } from "../dao/professor.dao.js";
import { VantagemDAO } from "../dao/vantagem.dao.js";
import { TransacaoDAO } from "../dao/transacao.dao.js";
import { CupomDAO } from "../dao/cupom.dao.js";
import { createCouponCode } from "../utils/coupon.js";
import { sendMail } from "./email.service.js";

export async function enviarMoedas({ professorUserId, alunoId, quantidade, mensagem }) {
  if (!mensagem?.trim()) throw { status: 400, message: "Mensagem é obrigatória." };
  if (!quantidade || Number.isNaN(quantidade) || quantidade <= 0) {
    throw { status: 400, message: "Quantidade de moedas inválida." };
  }
  const professor = await ProfessorDAO.findByUsuarioId(professorUserId, {
    usuario: true,
    instituicao: true,
  });
  if (!professor) throw { status: 404, message: "Professor não encontrado." };
  if (professor.saldoMoedas < quantidade) throw { status: 400, message: "Saldo insuficiente." };
  const aluno = await AlunoDAO.findById(alunoId, { usuario: true, instituicao: true });
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
    await TransacaoDAO.create(
      {
        tipo: TipoTransacao.ENVIO,
        descricao: mensagem,
        quantidadeMoedas: quantidade,
        usuarioId: professor.usuarioId,
        professorId: professor.id,
        alunoDestinoId: aluno.id,
      },
      tx,
    );
    await TransacaoDAO.create(
      {
        tipo: TipoTransacao.RECEBIMENTO,
        descricao: `Recebimento de moedas de ${professor.usuario.nome}.`,
        quantidadeMoedas: quantidade,
        usuarioId: aluno.usuarioId,
        professorId: professor.id,
        alunoDestinoId: aluno.id,
      },
      tx,
    );
    await sendMail({
      to: aluno.usuario.email,
      subject: "Você recebeu moedas",
      title: "Parabéns!",
      body: `<p>Você recebeu <strong>${quantidade}</strong> moedas.</p><p>Mensagem: ${mensagem}</p>`,
    });
  });
}

export async function resgatarVantagem({ alunoUserId, vantagemId }) {
  const aluno = await AlunoDAO.findByUsuarioId(alunoUserId, { usuario: true });
  const vantagem = await VantagemDAO.findById(vantagemId, { empresa: { include: { usuario: true } } });
  if (!aluno || !vantagem) throw { status: 404, message: "Aluno ou vantagem inválida." };
  if (aluno.saldoMoedas < vantagem.custoMoedas) throw { status: 400, message: "Saldo insuficiente." };

  return prisma.$transaction(async (tx) => {
    await tx.aluno.update({
      where: { id: aluno.id },
      data: { saldoMoedas: { decrement: vantagem.custoMoedas } },
    });
    const cupom = await CupomDAO.create(
      {
        codigo: createCouponCode(),
        usuarioId: aluno.usuarioId,
        vantagemId: vantagem.id,
      },
      tx,
    );
    await TransacaoDAO.create(
      {
        tipo: TipoTransacao.RESGATE,
        descricao: `Resgate de vantagem: ${vantagem.titulo}`,
        quantidadeMoedas: vantagem.custoMoedas,
        usuarioId: aluno.usuarioId,
        alunoOrigemId: aluno.id,
      },
      tx,
    );
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
