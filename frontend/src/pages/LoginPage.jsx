import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useAuth } from '../providers/AuthProvider'

const schema = z.object({
  email: z.string().min(3, 'Informe seu email'),
  senha: z.string().min(8, 'Senha mínima de 8 caracteres'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  return (
    <main className="auth-shell">
      <form
        onSubmit={handleSubmit(async (values) => {
          const toastId = toast.loading('Entrando...')
          setSubmitting(true)
          try {
            await signIn(values)
            toast.update(toastId, { render: 'Login realizado com sucesso', type: 'success', isLoading: false, autoClose: 1200 })
            navigate('/dashboard')
          } catch (error) {
            toast.update(toastId, {
              render: error?.response?.data?.message || 'Credenciais inválidas',
              type: 'error',
              isLoading: false,
              autoClose: 2500,
            })
          } finally {
            setSubmitting(false)
          }
        })}
        className="auth-card max-w-md"
      >
        <h1 className="mb-1 text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Sistema de Moeda Estudantil
        </h1>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Acesse com seu email e senha</p>

        <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Email</label>
        <input
          {...register('email')}
          className="mb-1 w-full rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 outline-none ring-indigo-600 transition focus:ring-2 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder="seuemail@dominio.com"
        />
        <p className="mb-2 min-h-5 text-xs font-medium text-red-600 dark:text-red-400">
          {formState.errors.email?.message}
        </p>

        <label className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Senha</label>
        <input
          type="password"
          {...register('senha')}
          className="mb-1 w-full rounded-lg border border-slate-400 bg-white p-2.5 text-slate-900 placeholder-slate-500 outline-none ring-indigo-600 transition focus:ring-2 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder="********"
        />
        <p className="mb-3 min-h-5 text-xs font-medium text-red-600 dark:text-red-400">
          {formState.errors.senha?.message}
        </p>

        <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="mt-4 flex justify-between text-sm font-medium">
          <Link className="text-indigo-700 hover:underline dark:text-indigo-300" to="/cadastro/aluno">
            Cadastrar aluno
          </Link>
          <Link className="text-indigo-700 hover:underline dark:text-indigo-300" to="/cadastro/empresa">
            Cadastrar empresa
          </Link>
        </div>
      </form>
    </main>
  )
}
