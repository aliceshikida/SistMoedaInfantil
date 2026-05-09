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
  listInstituicoes,
  listVantagens,
  resgatarVantagemHandler,
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
router.post("/professor/enviar-moedas", authenticate, authorize("PROFESSOR"), enviarMoedasHandler);
router.post("/aluno/resgatar", authenticate, authorize("ALUNO"), resgatarVantagemHandler);
router.post(
  "/empresa/vantagens",
  authenticate,
  authorize("EMPRESA"),
  upload.single("foto"),
  createVantagem,
);

export default router;
