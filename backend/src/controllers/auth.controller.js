import { z } from "zod";
import { UsuarioDAO } from "../dao/usuario.dao.js";
import { onlyDigits } from "../utils/docValidator.js";
import { login, registerAluno, registerEmpresa } from "../services/auth.service.js";

const alunoSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(8),
  confirmacaoSenha: z.string().min(8),
  cpf: z.string().refine((val) => onlyDigits(val).length === 11, { message: "CPF deve ter 11 dígitos." }),
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

const loginSchema = z.object({ email: z.string().min(3), senha: z.string().min(8) });

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
    const user = await UsuarioDAO.findById(req.user.id, {
      aluno: true,
      professor: true,
      empresa: true,
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
