import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useEffect, useState } from 'react'

export function Layout({ title, children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(localStorage.getItem('sme_dark') === '1')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('sme_dark', dark ? '1' : '0')
  }, [dark])

  return (
    <div className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-500">{user?.nome}</p>
          </div>
          <div className="flex gap-2">
            <Link className="rounded-lg bg-slate-200 px-3 py-2 text-sm" to="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-lg bg-slate-200 px-3 py-2 text-sm" to="/extrato">
              Extrato
            </Link>
            <Link className="rounded-lg bg-slate-200 px-3 py-2 text-sm" to="/vantagens">
              Vantagens
            </Link>
            <button className="rounded-lg bg-slate-200 px-3 py-2 text-sm" onClick={() => setDark((v) => !v)}>
              {dark ? 'Claro' : 'Escuro'}
            </button>
            <button
              className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
            >
              Sair
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
