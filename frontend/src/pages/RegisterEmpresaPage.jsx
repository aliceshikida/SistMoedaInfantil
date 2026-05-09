import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useAuth } from '../providers/AuthProvider'

const schema = z
  .object({
    nome: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
    cnpj: z.string().min(14),
    descricao: z.string().min(8),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não conferem',
    path: ['confirmacaoSenha'],
  })

export function RegisterEmpresaPage() {
  const navigate = useNavigate()
  const { registerEmpresa } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  return (
    <main className="auth-shell py-8">
      <div className="auth-card">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => navigate('/login')} className="btn-clean">
          Voltar
        </button>
      </div>
      <h1 className="mb-3 text-center text-2xl font-extrabold text-slate-900 dark:text-white">Cadastro de Empresa</h1>
      <form
        className="grid gap-2"
        onSubmit={handleSubmit(async (values) => {
          const toastId = toast.loading('Criando cadastro...')
          setSubmitting(true)
          try {
            await registerEmpresa(values)
            toast.update(toastId, { render: 'Empresa cadastrada com sucesso', type: 'success', isLoading: false, autoClose: 1200 })
            navigate('/dashboard')
          } catch (error) {
            toast.update(toastId, {
              render: error?.response?.data?.message || 'Erro ao cadastrar empresa',
              type: 'error',
              isLoading: false,
              autoClose: 2500,
            })
          } finally {
            setSubmitting(false)
          }
        })}
      >
        <input {...register('nome')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Nome da empresa" />
        <input {...register('email')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Email" />
        <input type="password" {...register('senha')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Senha" />
        <input type="password" {...register('confirmacaoSenha')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Confirmação de senha" />
        <input {...register('cnpj')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="CNPJ" />
        <textarea {...register('descricao')} className="rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100" placeholder="Descrição da empresa" />
        <p className="min-h-5 text-xs font-medium text-red-600 dark:text-red-400">{Object.values(formState.errors)[0]?.message}</p>
        <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
          {submitting ? 'Cadastrando...' : 'Cadastrar Empresa'}
        </button>
      </form>
      </div>
    </main>
  )
}
