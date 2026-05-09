import { prisma } from "../prisma/client.js";
import { InstituicaoDAO } from "../dao/instituicao.dao.js";
import { EmpresaDAO } from "../dao/empresa.dao.js";
import { VantagemDAO } from "../dao/vantagem.dao.js";
import { AlunoDAO } from "../dao/aluno.dao.js";
import { CupomDAO } from "../dao/cupom.dao.js";
import { UsuarioDAO } from "../dao/usuario.dao.js";
import { TransacaoDAO } from "../dao/transacao.dao.js";
import { ProfessorDAO } from "../dao/professor.dao.js";
import { enviarMoedas, resgatarVantagem } from "../services/business.service.js";
import { creditSemesterCoinsIfNeeded } from "../services/professor.service.js";

export async function listInstituicoes(req, res, next) {
  try {
    const items = await InstituicaoDAO.listAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createVantagem(req, res, next) {
  try {
    const empresa = await EmpresaDAO.findByUsuarioId(req.user.id);
    if (!empresa) throw { status: 404, message: "Empresa não encontrada." };
    const vantagem = await VantagemDAO.create({
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      custoMoedas: Number(req.body.custoMoedas),
      foto: req.file ? `/uploads/${req.file.filename}` : null,
      empresaId: empresa.id,
    });
    res.status(201).json(vantagem);
  } catch (error) {
    next(error);
  }
}

export async function listVantagens(_req, res, next) {
  try {
    const items = await VantagemDAO.listPublic();
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function listAlunosParaProfessor(req, res, next) {
  try {
    const alunos = await AlunoDAO.listAll({
      usuario: { select: { id: true, nome: true, email: true } },
      instituicao: { select: { nome: true } },
    });
    res.json(alunos);
  } catch (error) {
    next(error);
  }
}

export async function listCuponsAluno(req, res, next) {
  try {
    const cupons = await CupomDAO.listByUsuario(req.user.id, {
      usuario: { select: { nome: true, email: true } },
      vantagem: { include: { empresa: { include: { usuario: true } } } },
    });
    res.json(cupons);
  } catch (error) {
    next(error);
  }
}

export async function listVantagensEmpresa(req, res, next) {
  try {
    const empresa = await EmpresaDAO.findByUsuarioId(req.user.id);
    if (!empresa) throw { status: 404, message: "Empresa não encontrada." };
    const vantagens = await VantagemDAO.listByEmpresa(empresa.id);
    res.json(vantagens);
  } catch (error) {
    next(error);
  }
}

export async function listCuponsEmpresa(req, res, next) {
  try {
    const empresa = await EmpresaDAO.findByUsuarioId(req.user.id);
    if (!empresa) throw { status: 404, message: "Empresa não encontrada." };
    const cupons = await CupomDAO.listByEmpresa(empresa.id, {
      usuario: { select: { nome: true, email: true } },
      vantagem: true,
    });
    res.json(cupons);
  } catch (error) {
    next(error);
  }
}

export async function enviarMoedasHandler(req, res, next) {
  try {
    await enviarMoedas({
      professorUserId: req.user.id,
      alunoId: req.body.alunoId,
      quantidade: Number(req.body.quantidade),
      mensagem: req.body.mensagem,
    });
    res.status(201).json({ message: "Moedas enviadas com sucesso." });
  } catch (error) {
    next(error);
  }
}

export async function resgatarVantagemHandler(req, res, next) {
  try {
    const cupom = await resgatarVantagem({
      alunoUserId: req.user.id,
      vantagemId: req.body.vantagemId,
    });
    res.status(201).json(cupom);
  } catch (error) {
    next(error);
  }
}

export async function dashboardHandler(req, res, next) {
  try {
    if (req.user.role === "ALUNO") {
      const [aluno, extrato, trocas] = await Promise.all([
        AlunoDAO.findByUsuarioId(req.user.id),
        TransacaoDAO.listRecentByUsuario(req.user.id, 10),
        prisma.cupom.findMany({ where: { usuarioId: req.user.id }, include: { vantagem: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      ]);
      return res.json({ saldo: aluno?.saldoMoedas || 0, extrato, trocas });
    }
    if (req.user.role === "PROFESSOR") {
      const professor = await creditSemesterCoinsIfNeeded(req.user.id);
      const [envios, alunosReconhecidos, historicoEnvio] = await Promise.all([
        TransacaoDAO.countEnviosByUsuario(req.user.id),
        TransacaoDAO.listDistinctAlunosReconhecidos(req.user.id),
        TransacaoDAO.listRecentEnviosByUsuario(req.user.id, 10),
      ]);
      return res.json({
        saldo: professor?.saldoMoedas || 0,
        envios,
        alunosReconhecidos: alunosReconhecidos.length,
        historicoEnvio,
      });
    }
    if (req.user.role === "EMPRESA") {
      const empresa = await EmpresaDAO.findByUsuarioId(req.user.id);
      const [vantagens, resgates] = await Promise.all([
        VantagemDAO.countByEmpresa(empresa?.id),
        CupomDAO.countByEmpresa(empresa?.id),
      ]);
      return res.json({ vantagens, resgates });
    }
    const [usuarios, transacoes] = await Promise.all([
      UsuarioDAO.count(),
      TransacaoDAO.sumMoedasDistribuidas(),
    ]);
    return res.json({
      usuarios,
      moedasDistribuidas: transacoes._sum.quantidadeMoedas || 0,
    });
  } catch (error) {
    next(error);
  }
}

export async function extratoHandler(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 10);
    const [total, items] = await Promise.all([
      TransacaoDAO.countByUsuario(req.user.id),
      TransacaoDAO.listByUsuario(req.user.id, { page, size }),
    ]);
    res.json({ total, page, size, items });
  } catch (error) {
    next(error);
  }
}
