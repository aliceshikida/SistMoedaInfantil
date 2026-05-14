import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { api } from '../lib/api'
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

function GradCapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 10 12 6l8 4-8 4-8-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 12v3.5c0 1.5 2.2 2.5 4 2.5s4-1 4-2.5V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function RegisterAlunoPage() {
  const navigate = useNavigate()
  const { registerAluno } = useAuth()
  const [instituicoes, setInstituicoes] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    api.get('/instituicoes').then((res) => setInstituicoes(res.data))
  }, [])

  return (
    <main className="auth-shell py-10">
      <div className="auth-brand">
        <div className="auth-brand-icon text-blue-600">
          <GradCapIcon className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Cadastro de aluno</h1>
        <p className="mt-2 max-w-md text-sm font-medium text-white/90">Preencha os dados para criar sua conta.</p>
      </div>

      <div className="auth-card auth-card-scroll max-h-[min(80vh,720px)] max-w-xl">
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
              await registerAluno(values)
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
          <input {...register('endereco')} className="input-pill" placeholder="Endereço" />
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
    </main>
  )
}
