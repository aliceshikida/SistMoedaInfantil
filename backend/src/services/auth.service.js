import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { AlunoDAO } from "../dao/aluno.dao.js";
import { EmpresaDAO } from "../dao/empresa.dao.js";
import { UsuarioDAO } from "../dao/usuario.dao.js";
import { cpfHasElevenDigits, isValidCnpj, onlyDigits } from "../utils/docValidator.js";
import { signToken } from "../utils/token.js";
import { sendMail } from "./email.service.js";
import { creditSemesterCoinsIfNeeded } from "./professor.service.js";

function authResponse(user) {
  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } };
}

export async function registerAluno(data) {
  const {
    nome,
    email,
    senha,
    confirmacaoSenha,
    cpf,
    rg,
    endereco,
    instituicaoId,
    curso,
  } = data;
  if (senha !== confirmacaoSenha) throw { status: 400, message: "Confirmação de senha inválida." };
  if (!cpfHasElevenDigits(cpf)) throw { status: 400, message: "CPF deve ter 11 dígitos." };
  const cpfDigits = onlyDigits(cpf);
  const cpfEmUso = await AlunoDAO.findByCpf(cpfDigits);
  if (cpfEmUso) throw { status: 409, message: "CPF já cadastrado. Use outro CPF ou faça login se já possui conta." };
  const exists = await UsuarioDAO.findByEmail(email);
  if (exists) throw { status: 409, message: "Email já cadastrado." };
  const senhaHash = await bcrypt.hash(senha, 10);
  const user = await UsuarioDAO.create({
    nome,
    email,
    senhaHash,
    role: Role.ALUNO,
    aluno: {
      create: {
        cpf: cpfDigits,
        rg,
        endereco,
        instituicaoId,
        curso,
      },
    },
  });
  await sendMail({
    to: email,
    subject: "Bem-vindo ao Sistema de Moeda Estudantil",
    title: `Olá, ${nome}!`,
    body: "<p>Seu cadastro foi concluído com sucesso.</p>",
  });
  return authResponse(user);
}

export async function registerEmpresa(data) {
  const { nome, email, senha, confirmacaoSenha, cnpj, descricao } = data;
  if (senha !== confirmacaoSenha) throw { status: 400, message: "Confirmação de senha inválida." };
  if (!isValidCnpj(cnpj)) throw { status: 400, message: "CNPJ inválido." };
  const cnpjDigits = onlyDigits(cnpj);
  const cnpjEmUso = await EmpresaDAO.findByCnpj(cnpjDigits);
  if (cnpjEmUso) throw { status: 409, message: "CNPJ já cadastrado. Use outro CNPJ ou faça login se já possui conta." };
  const exists = await UsuarioDAO.findByEmail(email);
  if (exists) throw { status: 409, message: "Email já cadastrado." };
  const senhaHash = await bcrypt.hash(senha, 10);
  const user = await UsuarioDAO.create({
    nome,
    email,
    senhaHash,
    role: Role.EMPRESA,
    empresa: { create: { cnpj: cnpjDigits, descricao } },
  });
  await sendMail({
    to: email,
    subject: "Cadastro de empresa realizado",
    title: `Bem-vinda, ${nome}`,
    body: "<p>Agora sua empresa já pode cadastrar vantagens.</p>",
  });
  return authResponse(user);
}

export async function login({ email, senha }) {
  const user = await UsuarioDAO.findByEmailOrNome(email);
  if (!user) throw { status: 401, message: "Credenciais inválidas." };
  const ok = await bcrypt.compare(senha, user.senhaHash);
  if (!ok) throw { status: 401, message: "Credenciais inválidas." };
  if (user.role === Role.PROFESSOR) {
    await creditSemesterCoinsIfNeeded(user.id);
  }
  return authResponse(user);
}
