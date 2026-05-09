import { prisma } from "../prisma/client.js";
import { verifyToken } from "../utils/token.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next({ status: 401, message: "Token ausente." });
    const payload = verifyToken(token);
    const user = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, email: true, nome: true },
    });
    if (!user || user.status !== "ATIVO") {
      return next({ status: 401, message: "Usuário inválido ou bloqueado." });
    }
    req.user = user;
    return next();
  } catch (_error) {
    return next({ status: 401, message: "Token inválido ou expirado." });
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next({ status: 401, message: "Não autenticado." });
    if (!roles.includes(req.user.role)) {
      return next({ status: 403, message: "Acesso negado para esse perfil." });
    }
    return next();
  };
}
