export function cepDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

export function formatCep(value) {
  const digits = cepDigits(value).slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export async function fetchAddressByCep(cep) {
  const digits = cepDigits(cep)
  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  if (!response.ok) throw new Error('CEP não encontrado')

  const data = await response.json()
  if (data.erro) throw new Error('CEP não encontrado')

  const parts = [data.logradouro, data.bairro, `${data.localidade} - ${data.uf}`].filter(Boolean)

  return {
    endereco: parts.join(', '),
  }
}
