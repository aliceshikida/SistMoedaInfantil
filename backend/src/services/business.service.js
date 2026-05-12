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

function cupomCodigoHtml(codigo) {
  return `<p style="margin:16px 0;padding:16px;background:#f1f5f9;border-radius:10px;text-align:center;font-size:20px;letter-spacing:0.12em;font-weight:700;color:#0f172a;font-family:ui-monospace,monospace">${codigo}</p>`;
}

/** Professores que já enviaram moedas a este aluno (transações de recebimento). */
async function listProfessoresQueEnviaramMoedasAluno(usuarioIdAluno) {
  const rows = await prisma.transacao.findMany({
    where: {
      usuarioId: usuarioIdAluno,
      tipo: TipoTransacao.RECEBIMENTO,
      professorId: { not: null },
    },
    select: {
      professorId: true,
      professor: { include: { usuario: { select: { email: true, nome: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  const seen = new Set();
  const usuarios = [];
  for (const row of rows) {
    if (!row.professorId || seen.has(row.professorId)) continue;
    seen.add(row.professorId);
    const u = row.professor?.usuario;
    if (u?.email) usuarios.push(u);
  }
  return usuarios;
}

export async function resgatarVantagem({ alunoUserId, vantagemId }) {
  const aluno = await AlunoDAO.findByUsuarioId(alunoUserId, { usuario: true });
  const vantagem = await VantagemDAO.findById(vantagemId, { empresa: { include: { usuario: true } } });
  if (!aluno || !vantagem) throw { status: 404, message: "Aluno ou vantagem inválida." };
  if (aluno.saldoMoedas < vantagem.custoMoedas) throw { status: 400, message: "Saldo insuficiente." };

  const cupom = await prisma.$transaction(async (tx) => {
    await tx.aluno.update({
      where: { id: aluno.id },
      data: { saldoMoedas: { decrement: vantagem.custoMoedas } },
    });
    const created = await CupomDAO.create(
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
        vantagemId: vantagem.id,
      },
      tx,
    );
    return created;
  });

  const codigoBloco = cupomCodigoHtml(cupom.codigo);
  const nomeAluno = aluno.usuario.nome;

  await sendMail({
    to: aluno.usuario.email,
    subject: "Seu cupom — troca presencial",
    title: "Cupom para troca presencial",
    body: `<p>Olá, ${nomeAluno},</p>
<p>Você resgatou a vantagem <strong>${vantagem.titulo}</strong>.</p>
<p>Use o código abaixo na <strong>troca presencial</strong> (apresente na hora da retirada ou validação):</p>
${codigoBloco}
<p style="font-size:13px;color:#64748b">Guarde este e-mail ou anote o código. Ele é o mesmo informado à escola para conferência.</p>`,
  });

  const professores = await listProfessoresQueEnviaramMoedasAluno(aluno.usuarioId);
  for (const prof of professores) {
    await sendMail({
      to: prof.email,
      subject: `Cupom de resgate — ${cupom.codigo}`,
      title: "Cupom do aluno (troca presencial)",
      body: `<p>Olá, ${prof.nome},</p>
<p>O aluno <strong>${nomeAluno}</strong> resgatou a vantagem <strong>${vantagem.titulo}</strong>.</p>
<p>O código do cupom para validação na troca presencial é o <strong>mesmo</strong> enviado ao aluno:</p>
${codigoBloco}
<p style="font-size:13px;color:#64748b">Empresa parceira: ${vantagem.empresa.usuario.nome}.</p>`,
    });
  }

  await sendMail({
    to: vantagem.empresa.usuario.email,
    subject: "Novo resgate em sua vantagem",
    title: "Um aluno resgatou sua vantagem",
    body: `<p>Vantagem: <strong>${vantagem.titulo}</strong></p>
<p>Aluno: ${nomeAluno}</p>
<p>Código do cupom: <strong>${cupom.codigo}</strong> (troca presencial)</p>`,
  });

  return cupom;
}
