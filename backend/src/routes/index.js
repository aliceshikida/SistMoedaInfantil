import { Router } from "express";
import {
  loginHandler,
  meHandler,
  registerAlunoHandler,
  registerEmpresaHandler,
} from "../controllers/auth.controller.js";
import {
  createVantagem,
  dashboardHandler,
  enviarMoedasHandler,
  extratoHandler,
  listAlunosParaProfessor,
  listCuponsAluno,
  listCuponsEmpresa,
  listVantagensEmpresa,
  listInstituicoes,
  listVantagens,
  resgatarVantagemHandler,
  deleteVantagemHandler,
} from "../controllers/core.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.get("/instituicoes", listInstituicoes);
router.get("/vantagens", listVantagens);

router.post("/auth/register/aluno", registerAlunoHandler);
router.post("/auth/register/empresa", registerEmpresaHandler);
router.post("/auth/login", loginHandler);
router.get("/auth/me", authenticate, meHandler);

router.get("/dashboard", authenticate, dashboardHandler);
router.get("/extrato", authenticate, extratoHandler);
router.get("/aluno/cupons", authenticate, authorize("ALUNO"), listCuponsAluno);
router.get("/professor/alunos", authenticate, authorize("PROFESSOR"), listAlunosParaProfessor);
router.post("/professor/enviar-moedas", authenticate, authorize("PROFESSOR"), enviarMoedasHandler);
router.post("/aluno/resgatar", authenticate, authorize("ALUNO"), resgatarVantagemHandler);
router.get("/empresa/vantagens", authenticate, authorize("EMPRESA"), listVantagensEmpresa);
router.get("/empresa/cupons", authenticate, authorize("EMPRESA"), listCuponsEmpresa);
router.post(
  "/empresa/vantagens",
  authenticate,
  authorize("EMPRESA"),
  upload.single("foto"),
  createVantagem,
);
router.delete("/empresa/vantagens/:id", authenticate, authorize("EMPRESA"), deleteVantagemHandler);

export default router;
