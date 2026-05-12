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

export function RegisterEmpresaPage() {
  const navigate = useNavigate()
  const { registerEmpresa } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  return (
    <main className="auth-shell py-10">
      <div className="auth-brand">
        <div className="auth-brand-icon text-blue-600">
          <GradCapIcon className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Cadastro de empresa</h1>
        <p className="mt-2 max-w-md text-sm font-medium text-white/90">Parceiros que oferecem vantagens aos alunos.</p>
      </div>

      <div className="auth-card max-w-xl">
        <div className="mb-4">
          <button type="button" onClick={() => navigate('/login')} className="btn-secondary text-sm">
            Voltar ao login
          </button>
        </div>
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">Dados da empresa</h2>
        <form
          className="grid gap-3"
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
          <input {...register('nome')} className="input-pill" placeholder="Nome da empresa" />
          <input {...register('email')} className="input-pill" placeholder="Email" />
          <input type="password" {...register('senha')} className="input-pill" placeholder="Senha" />
          <input type="password" {...register('confirmacaoSenha')} className="input-pill" placeholder="Confirmação de senha" />
          <input {...register('cnpj')} className="input-pill" placeholder="CNPJ" />
          <textarea
            {...register('descricao')}
            className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Descrição da empresa"
          />
          <p className="min-h-5 text-xs font-medium text-red-600">{Object.values(formState.errors)[0]?.message}</p>
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
            {submitting ? 'Cadastrando...' : 'Cadastrar Empresa'}
          </button>
        </form>
      </div>
    </main>
  )
}
