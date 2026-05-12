import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-sm font-medium text-slate-500">
        Carregando...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
