import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

const schema = z
  .object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
    cpf: z.string().min(11),
    rg: z.string().min(4),
    endereco: z.string().min(5),
    instituicaoId: z.string().min(1),
    curso: z.string().min(2),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não conferem',
    path: ['confirmacaoSenha'],
  })

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
    <main className="auth-shell py-8">
      <div className="auth-card">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigate('/login')} className="btn-clean">
            Voltar
          </button>
        </div>
      <h1 className="mb-3 text-center text-2xl font-extrabold text-slate-900 dark:text-white">Cadastro de Aluno</h1>
      <form
        className="grid gap-2"
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
        <input {...register('nome')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Nome completo" />
        <input {...register('email')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Email" />
        <input type="password" {...register('senha')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Senha" />
        <input type="password" {...register('confirmacaoSenha')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Confirmação de senha" />
        <input {...register('cpf')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="CPF" />
        <input {...register('rg')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="RG" />
        <input {...register('endereco')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Endereço" />
        <input {...register('curso')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Curso" />
        <select {...register('instituicaoId')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
          <option value="">Selecione a instituição</option>
          {instituicoes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
        <p className="min-h-5 text-xs font-medium text-red-600 dark:text-red-400">{Object.values(formState.errors)[0]?.message}</p>
        <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
          {submitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      </div>
    </main>
  )
}
