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

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" strokeLinecap="round" />
      <path d="M9.9 5.1A10.4 10.4 0 0112 5c6 0 10 7 10 7a18.5 18.5 0 01-5 5M6.3 6.3A18.1 18.1 0 002 12s4 7 10 7a9.8 9.8 0 004-.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('login')
  const [showSenha, setShowSenha] = useState(false)
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const [panelAnim, setPanelAnim] = useState(null)

  const goLogin = () => {
    if (tab === 'login') return
    setTab('login')
    setPanelAnim('from-left')
  }

  const goCadastrar = () => {
    if (tab === 'cadastrar') return
    setTab('cadastrar')
    setPanelAnim('from-right')
  }

  const panelAnimClass =
    panelAnim === 'from-right' ? 'auth-tab-panel--from-right' : panelAnim === 'from-left' ? 'auth-tab-panel--from-left' : ''

  return (
    <main className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-icon text-blue-600">
          <GradCapIcon className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-white drop-shadow-sm md:text-3xl">Sistema de Moeda Estudantil</h1>
        <p className="mt-2 max-w-md text-sm font-medium text-white/90">
          Plataforma de reconhecimento acadêmico, saldo em moedas e trocas por vantagens.
        </p>
      </div>

      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={tab === 'login' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={goLogin}
          >
            Login
          </button>
          <button
            type="button"
            className={tab === 'cadastrar' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={goCadastrar}
          >
            Cadastrar
          </button>
        </div>

        <div key={tab} className={panelAnimClass}>
        {tab === 'login' ? (
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
          >
            <p className="mb-5 text-center text-sm text-slate-500">Acesse com seu email e senha</p>

            <label className="field-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              {...register('email')}
              className="input-pill mb-1"
              placeholder="seuemail@dominio.com"
              autoComplete="email"
            />
            <p className="mb-3 min-h-5 text-xs font-medium text-red-600">{formState.errors.email?.message}</p>

            <label className="field-label" htmlFor="login-senha">
              Senha
            </label>
            <div className="input-pill-wrap mb-1">
              <input
                id="login-senha"
                type={showSenha ? 'text' : 'password'}
                {...register('senha')}
                className="input-pill pr-12"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setShowSenha((v) => !v)}
                aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showSenha ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <p className="mb-5 min-h-5 text-xs font-medium text-red-600">{formState.errors.senha?.message}</p>

            <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="mt-6 text-center text-sm text-slate-600">
              Não tem uma conta?{' '}
              <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={goCadastrar}>
                Cadastre-se
              </button>
            </p>
          </form>
        ) : (
          <div>
            <p className="mb-5 text-center text-sm text-slate-500">Escolha o tipo de cadastro</p>
            <div className="grid gap-3">
              <Link to="/cadastro/aluno" className="btn-primary block text-center no-underline">
                Cadastrar aluno
              </Link>
              <Link to="/cadastro/empresa" className="btn-secondary block text-center no-underline">
                Cadastrar empresa
              </Link>
            </div>
            <p className="mt-6 text-center text-sm text-slate-600">
              Já tem conta?{' '}
              <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={goLogin}>
                Fazer login
              </button>
            </p>
          </div>
        )}
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-white/75">© {new Date().getFullYear()} Sistema de Moeda Estudantil</p>
    </main>
  )
}
