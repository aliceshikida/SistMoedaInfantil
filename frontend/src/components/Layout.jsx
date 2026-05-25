import { Link, NavLink, useNavigate } from 'react-router-dom'
import { SmeLogo } from './SmeLogo.jsx'
import { useAuth } from '../providers/AuthProvider'

function navClass({ isActive }) {
  return [isActive ? 'sidebar-nav-link sidebar-nav-link-active' : 'sidebar-nav-link'].join(' ')
}

export function Layout({ title, subtitle, children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-screen bg-app-bg">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a365d] p-1 shadow-sm ring-1 ring-amber-300/35">
              <SmeLogo size="sm" showRing={false} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Moeda Estudantil</p>
              <p className="text-xs text-slate-500">Reconhecimento escolar</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/login" className="btn-primary px-5 py-2 text-sm">
              Entrar
            </Link>
            <Link to="/cadastro/aluno" className="btn-secondary px-4 py-2 text-sm">
              Cadastro
            </Link>
          </div>
        </header>
        <div className="border-b border-slate-100 bg-white px-5 py-6 md:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">{children}</main>
      </div>
    )
  }

  return (
    <div className="app-shell flex min-h-screen flex-col md:flex-row">
      <aside className="flex min-h-0 shrink-0 flex-col border-b border-amber-500/20 bg-gradient-to-b from-[#1a365d] via-[#1e3a5f] to-[#0f2744] text-white md:min-h-screen md:w-60 md:border-b-0 md:border-r md:border-amber-500/15">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="app-logo-wrap h-12 w-12 p-1">
            <SmeLogo size="sm" showRing={false} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Moeda Estudantil</p>
            <p className="text-xs text-amber-200/90">Reconhecimento escolar</p>
          </div>
        </div>

        <nav className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:px-3 md:pb-2">
          <NavLink to="/dashboard" className={navClass} end>
            Dashboard
          </NavLink>
          {user?.role !== 'EMPRESA' && (
            <NavLink to="/extrato" className={navClass}>
              Extrato
            </NavLink>
          )}
          <NavLink to="/vantagens" className={navClass}>
            Vantagens
          </NavLink>
          {user?.role === 'PROFESSOR' && (
            <NavLink to="/professor/enviar" className={navClass}>
              Enviar moedas
            </NavLink>
          )}
        </nav>

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <p className="truncate text-sm font-semibold text-white">{user?.nome}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-200/90">{user?.role}</p>
          <button
            type="button"
            className="btn-danger mt-3 w-full"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-100 bg-white px-5 py-6 md:border-0 md:bg-transparent md:px-8 md:pt-10 md:pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle ?? user?.nome}</p>
        </header>
        <main className="flex-1 px-4 pb-10 pt-2 md:px-8">{children}</main>
      </div>
    </div>
  )
}
