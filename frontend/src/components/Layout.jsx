import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export function Layout({ title, children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl flex-col md:min-h-[calc(100vh-3rem)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-500">{user?.nome}</p>
          </div>
          <div className="flex gap-2">
            <Link className="btn-clean" to="/dashboard">
              Dashboard
            </Link>
            {user?.role !== 'EMPRESA' && (
              <Link className="btn-clean" to="/extrato">
                Extrato
              </Link>
            )}
            <Link className="btn-clean" to="/vantagens">
              Vantagens
            </Link>
            {user?.role === 'PROFESSOR' && (
              <Link className="btn-clean" to="/professor/enviar">
                Enviar moedas
              </Link>
            )}
            <button
              className="btn-danger"
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
            >
              Sair
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 items-start justify-center pt-2 md:pt-4">
          <div className="w-full max-w-4xl">{children}</div>
        </div>
      </div>
    </div>
  )
}
