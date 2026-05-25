import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { api } from '../lib/api'
import { cepDigits, fetchAddressByCep, formatCep } from '../lib/viacep'
import { AuthBrand } from '../components/AuthBrand.jsx'
import { AuthShell } from '../components/AuthShell.jsx'
import { useAuth } from '../providers/AuthProvider'

function cpfDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

const schema = z
  .object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
    cpf: z.string().min(1),
    rg: z.string().min(4),
    cep: z.string().min(1),
    endereco: z.string().min(5),
    instituicaoId: z.string().min(1),
    curso: z.string().min(2),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não conferem',
    path: ['confirmacaoSenha'],
  })
  .refine((data) => cpfDigits(data.cpf).length === 11, {
    message: 'CPF deve ter 11 dígitos',
    path: ['cpf'],
  })
  .refine((data) => cepDigits(data.cep).length === 8, {
    message: 'CEP deve ter 8 dígitos',
    path: ['cep'],
  })

export function RegisterAlunoPage() {
  const navigate = useNavigate()
  const { registerAluno } = useAuth()
  const [instituicoes, setInstituicoes] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const { register, handleSubmit, formState, setValue } = useForm({ resolver: zodResolver(schema) })
  const cepField = register('cep')

  useEffect(() => {
    api.get('/instituicoes').then((res) => setInstituicoes(res.data))
  }, [])

  async function lookupCep(cepValue) {
    const digits = cepDigits(cepValue)
    if (digits.length !== 8) return

    setLoadingCep(true)
    try {
      const result = await fetchAddressByCep(digits)
      if (result?.endereco) {
        setValue('endereco', result.endereco, { shouldValidate: true })
      }
    } catch {
      toast.error('CEP não encontrado')
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <AuthShell className="py-10">
      <AuthBrand
        title="Cadastro de aluno"
        subtitle="Preencha os dados para criar sua conta na escola."
        badge="Novo aluno"
      />

      <div className="auth-card auth-card-scroll max-h-[min(80vh,720px)] w-full max-w-xl">
        <div className="mb-4">
          <button type="button" onClick={() => navigate('/login')} className="btn-secondary text-sm">
            Voltar ao login
          </button>
        </div>
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">Dados do cadastro</h2>
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (values) => {
            const toastId = toast.loading('Criando cadastro...')
            setSubmitting(true)
            try {
              const { cep: _cep, ...payload } = values
              await registerAluno(payload)
              toast.update(toastId, { render: 'Cadastro realizado com sucesso', type: 'success', isLoading: false, autoClose: 1200 })
              navigate('/dashboard')
            } catch (error) {
              toast.update(toastId, {
                render: error?.response?.data?.message || 'Erro ao cadastrar aluno',
                type: 'error',
                isLoading: false,
                autoClose: 2500,
              })
            } finally {
              setSubmitting(false)
            }
          })}
        >
          <input {...register('nome')} className="input-pill" placeholder="Nome completo" />
          <input {...register('email')} className="input-pill" placeholder="Email" />
          <input type="password" {...register('senha')} className="input-pill" placeholder="Senha" />
          <input type="password" {...register('confirmacaoSenha')} className="input-pill" placeholder="Confirmação de senha" />
          <input {...register('cpf')} className="input-pill" placeholder="CPF" />
          <input {...register('rg')} className="input-pill" placeholder="RG" />
          <div className="relative">
            <input
              {...cepField}
              className="input-pill w-full"
              placeholder="CEP"
              inputMode="numeric"
              maxLength={9}
              onChange={(event) => {
                const formatted = formatCep(event.target.value)
                event.target.value = formatted
                cepField.onChange(event)
                if (cepDigits(formatted).length === 8) lookupCep(formatted)
              }}
              onBlur={(event) => lookupCep(event.target.value)}
            />
            {loadingCep ? (
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-slate-500">
                Buscando...
              </span>
            ) : null}
          </div>
          <input {...register('endereco')} className="input-pill" placeholder="Endereço (número e complemento)" />
          <input {...register('curso')} className="input-pill" placeholder="Curso" />
          <select {...register('instituicaoId')} className="input-pill appearance-none bg-white">
            <option value="">Selecione a instituição</option>
            {instituicoes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
          <p className="min-h-5 text-xs font-medium text-red-600">{Object.values(formState.errors)[0]?.message}</p>
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
            {submitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
