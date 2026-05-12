import fs from "node:fs";
import path from "node:path";
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
import { UPLOADS_DIR } from "../config/paths.js";

export async function listInstituicoes(req, res, next) {
  try {
    const items = await InstituicaoDAO.listAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
}

function tryRemoveVantagemUploadFile(fotoPath) {
  if (!fotoPath || typeof fotoPath !== "string" || !fotoPath.startsWith("/uploads/")) return;
  const name = path.basename(fotoPath);
  if (!name || name === "." || name === "..") return;
  const filePath = path.join(UPLOADS_DIR, name);
  if (!filePath.startsWith(UPLOADS_DIR)) return;
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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

export async function deleteVantagemHandler(req, res, next) {
  try {
    const empresa = await EmpresaDAO.findByUsuarioId(req.user.id);
    if (!empresa) throw { status: 404, message: "Empresa não encontrada." };
    const { id } = req.params;
    const vantagem = await VantagemDAO.findByIdAndEmpresa(id, empresa.id);
    if (!vantagem) throw { status: 404, message: "Vantagem não encontrada." };
    const cupons = await CupomDAO.countByVantagemId(id);
    if (cupons > 0) {
      throw {
        status: 400,
        message: "Não é possível excluir: já existem cupons gerados para esta vantagem.",
      };
    }
    await VantagemDAO.deleteById(id);
    tryRemoveVantagemUploadFile(vantagem.foto);
    res.status(204).send();
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
      const aluno = await AlunoDAO.findByUsuarioId(req.user.id);
      const [extrato, trocas, gastoResgates, recebidosAgg] = await Promise.all([
        TransacaoDAO.listRecentByUsuario(req.user.id, 10),
        prisma.cupom.findMany({ where: { usuarioId: req.user.id }, include: { vantagem: true }, orderBy: { createdAt: "desc" }, take: 5 }),
        aluno?.id
          ? TransacaoDAO.sumMoedasResgatesAluno(req.user.id, aluno.id)
          : Promise.resolve({ _sum: { quantidadeMoedas: 0 } }),
        TransacaoDAO.sumMoedasByUsuarioAndTipo(req.user.id, "RECEBIMENTO"),
      ]);
      const moedasGastas = gastoResgates._sum.quantidadeMoedas || 0;
      const moedasRecebidas = recebidosAgg._sum.quantidadeMoedas || 0;
      return res.json({
        saldo: aluno?.saldoMoedas || 0,
        moedasRecebidas,
        moedasGastas,
        extrato,
        trocas,
      });
    }
    if (req.user.role === "PROFESSOR") {
      const professor = await creditSemesterCoinsIfNeeded(req.user.id);
      const [envios, alunosReconhecidos, historicoEnvio, gastoEnvios] = await Promise.all([
        TransacaoDAO.countEnviosByUsuario(req.user.id),
        TransacaoDAO.listDistinctAlunosReconhecidos(req.user.id),
        TransacaoDAO.listRecentEnviosByUsuario(req.user.id, 10),
        TransacaoDAO.sumMoedasEnviosProfessor(req.user.id),
      ]);
      const moedasGastas = gastoEnvios._sum.quantidadeMoedas || 0;
      return res.json({
        saldo: professor?.saldoMoedas || 0,
        moedasGastas,
        envios,
        alunosReconhecidos: alunosReconhecidos.length,
        historicoEnvio,
      });
    }
    if (req.user.role === "EMPRESA") {
      const empresa = await EmpresaDAO.findByUsuarioId(req.user.id);
      const agg = empresa?.id ? await TransacaoDAO.sumMoedasResgatesPorEmpresa(empresa.id) : { _sum: { quantidadeMoedas: 0 } };
      let moedasGastas = agg._sum.quantidadeMoedas || 0;
      if (!moedasGastas && empresa?.id) {
        moedasGastas = await CupomDAO.sumMoedasResgatadasByEmpresa(empresa.id);
      }
      const [vantagens, resgates] = await Promise.all([
        VantagemDAO.countByEmpresa(empresa?.id),
        CupomDAO.countByEmpresa(empresa?.id),
      ]);
      return res.json({ vantagens, resgates, moedasGastas });
    }
    const [usuarios, transacoes, gastoResgates] = await Promise.all([
      UsuarioDAO.count(),
      TransacaoDAO.sumMoedasDistribuidas(),
      TransacaoDAO.sumMoedasByTipo("RESGATE"),
    ]);
    return res.json({
      usuarios,
      moedasDistribuidas: transacoes._sum.quantidadeMoedas || 0,
      moedasGastas: gastoResgates._sum.quantidadeMoedas || 0,
    });
  } catch (error) {
    next(error);
  }
}

export async function extratoHandler(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 10);
    let include;
    if (req.user.role === "PROFESSOR") {
      include = { alunoDestino: { include: { usuario: { select: { nome: true, email: true } } } } };
    } else if (req.user.role === "ALUNO") {
      include = { professor: { include: { usuario: { select: { nome: true, email: true } } } } };
    }

    if (req.user.role === "PROFESSOR") {
      const [professor, totalBase] = await Promise.all([
        ProfessorDAO.findByUsuarioId(req.user.id, { usuario: { select: { createdAt: true } } }),
        TransacaoDAO.countByUsuario(req.user.id),
      ]);
      const usuarioCreated = professor?.usuario?.createdAt
        ? new Date(professor.usuario.createdAt)
        : new Date(0);
      const linhaSaldoInicial = {
        id: "__professor_saldo_inicial__",
        tipo: "SALDO_INICIAL",
        descricao: "Saldo inicial ao começar o uso do sistema",
        quantidadeMoedas: 1000,
        createdAt: new Date(usuarioCreated.getTime() - 60_000).toISOString(),
        usuarioId: req.user.id,
        professorId: null,
        alunoOrigemId: null,
        alunoDestinoId: null,
        vantagemId: null,
        alunoDestino: null,
      };
      const total = totalBase + 1;
      let items;
      if (page === 1) {
        const takeDb = Math.max(0, size - 1);
        const dbItems = await TransacaoDAO.listByUsuario(req.user.id, {
          include,
          order: "asc",
          skip: 0,
          take: takeDb,
        });
        items = [linhaSaldoInicial, ...dbItems];
      } else {
        const skip = (page - 1) * size - 1;
        items = await TransacaoDAO.listByUsuario(req.user.id, {
          include,
          order: "asc",
          skip,
          take: size,
        });
      }
      return res.json({ total, page, size, items });
    }

    const [total, items] = await Promise.all([
      TransacaoDAO.countByUsuario(req.user.id),
      TransacaoDAO.listByUsuario(req.user.id, { page, size, include }),
    ]);
    res.json({ total, page, size, items });
  } catch (error) {
    next(error);
  }
}
