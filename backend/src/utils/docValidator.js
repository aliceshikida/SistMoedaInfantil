export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** CPF no cadastro: apenas 11 dígitos (não valida dígitos verificadores). */
export function cpfHasElevenDigits(rawCpf) {
  return onlyDigits(rawCpf).length === 11;
}

export function isValidCpf(rawCpf) {
  const cpf = onlyDigits(rawCpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (base, factor) =>
    base
      .split("")
      .reduce((acc, num) => acc + Number(num) * factor--, 0);
  const d1 = ((calc(cpf.slice(0, 9), 10) * 10) % 11) % 10;
  const d2 = ((calc(cpf.slice(0, 10), 11) * 10) % 11) % 10;
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

export function isValidCnpj(rawCnpj) {
  const cnpj = onlyDigits(rawCnpj);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calcDigit = (base, weights) => {
    const total = base.reduce((acc, num, idx) => acc + num * weights[idx], 0);
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const nums = cnpj.split("").map(Number);
  const d1 = calcDigit(nums.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit(
    [...nums.slice(0, 12), d1],
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  return d1 === nums[12] && d2 === nums[13];
}
