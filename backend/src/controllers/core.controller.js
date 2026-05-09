import { prisma } from "../prisma/client.js";
import { enviarMoedas, resgatarVantagem } from "../services/business.service.js";

export async function listInstituicoes(req, res, next) {
  try {
    const items = await prisma.instituicao.findMany({ orderBy: { nome: "asc" } });
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createVantagem(req, res, next) {
  try {
    const empresa = await prisma.empresa.findUnique({ where: { usuarioId: req.user.id } });
    if (!empresa) throw { status: 404, message: "Empresa não encontrada." };
    const vantagem = await prisma.vantagem.create({
      data: {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        custoMoedas: Number(req.body.custoMoedas),
        foto: req.file ? `/uploads/${req.file.filename}` : null,
        empresaId: empresa.id,
      },
    });
    res.status(201).json(vantagem);
  } catch (error) {
    next(error);
  }
}

export async function listVantagens(_req, res, next) {
  try {
    const items = await prisma.vantagem.findMany({
      include: { empresa: { include: { usuario: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
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
      const aluno = await prisma.aluno.findUnique({ where: { usuarioId: req.user.id } });
      const extrato = await prisma.transacao.findMany({
        where: { usuarioId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return res.json({ saldo: aluno?.saldoMoedas || 0, extrato });
    }
    if (req.user.role === "PROFESSOR") {
      const professor = await prisma.professor.findUnique({ where: { usuarioId: req.user.id } });
      const envios = await prisma.transacao.count({
        where: { usuarioId: req.user.id, tipo: "ENVIO" },
      });
      return res.json({ saldo: professor?.saldoMoedas || 0, envios });
    }
    if (req.user.role === "EMPRESA") {
      const empresa = await prisma.empresa.findUnique({ where: { usuarioId: req.user.id } });
      const vantagens = await prisma.vantagem.count({ where: { empresaId: empresa?.id } });
      return res.json({ vantagens });
    }
    const [usuarios, transacoes] = await Promise.all([
      prisma.usuario.count(),
      prisma.transacao.aggregate({ _sum: { quantidadeMoedas: true } }),
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
      prisma.transacao.count({ where: { usuarioId: req.user.id } }),
      prisma.transacao.findMany({
        where: { usuarioId: req.user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);
    res.json({ total, page, size, items });
  } catch (error) {
    next(error);
  }
}
