export function notFoundHandler(_req, _res, next) {
  next({ status: 404, message: "Rota não encontrada." });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor.";
  if (process.env.NODE_ENV !== "test" && status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message, details: err.details || null });
}
