/** Garante que há saldo suficiente para a operação; senão, lança erro 400. */
export function assertSaldoSuficiente(saldoAtual, valorNecessario) {
  if (saldoAtual < valorNecessario) {
    throw { status: 400, message: "Saldo insuficiente." };
  }
}
