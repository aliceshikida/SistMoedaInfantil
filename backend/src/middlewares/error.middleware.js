import { Prisma } from "@prisma/client";

export function notFoundHandler(_req, _res, next) {
  next({ status: 404, message: "Rota não encontrada." });
}

function messageForUniqueViolation(meta) {
  const target = meta?.target;
  const fields = Array.isArray(target) ? target : target != null ? [String(target)] : [];
  const joined = fields.join(" ");
  if (joined.includes("cpf")) return "CPF já cadastrado.";
  if (joined.includes("cnpj")) return "CNPJ já cadastrado.";
  if (joined.includes("email")) return "Email já cadastrado.";
  return "Este dado já está cadastrado no sistema.";
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ message: messageForUniqueViolation(err.meta), details: null });
  }
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor.";
  if (process.env.NODE_ENV !== "test" && status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message, details: err.details || null });
}
