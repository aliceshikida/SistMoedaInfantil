import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { login, registerAluno, registerEmpresa } from "../services/auth.service.js";

const alunoSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(8),
  confirmacaoSenha: z.string().min(8),
  cpf: z.string().min(11),
  rg: z.string().min(4),
  endereco: z.string().min(5),
  instituicaoId: z.string().min(1),
  curso: z.string().min(2),
});

const empresaSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
  confirmacaoSenha: z.string().min(8),
  cnpj: z.string().min(14),
  descricao: z.string().min(8),
});

const loginSchema = z.object({ email: z.string().email(), senha: z.string().min(8) });

export async function registerAlunoHandler(req, res, next) {
  try {
    const data = alunoSchema.parse(req.body);
    const result = await registerAluno(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function registerEmpresaHandler(req, res, next) {
  try {
    const data = empresaSchema.parse(req.body);
    const result = await registerEmpresa(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await login(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function meHandler(req, res, next) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        aluno: true,
        professor: true,
        empresa: true,
      },
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
