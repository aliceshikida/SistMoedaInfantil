import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

function GradCapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 3L2 8l10 5 8-4v8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 10.5V15c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <GradCapIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Moeda Estudantil</p>
              <p className="text-xs text-slate-500">Gestão e reconhecimento</p>
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
      <aside className="flex min-h-0 shrink-0 flex-col border-b border-blue-800/80 bg-gradient-to-b from-blue-900 via-blue-900 to-blue-950 text-white md:min-h-screen md:w-60 md:border-b-0 md:border-r md:border-blue-800/60">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-inner ring-1 ring-white/20">
            <GradCapIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Moeda Estudantil</p>
            <p className="text-xs text-blue-200">Gestão e reconhecimento</p>
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
