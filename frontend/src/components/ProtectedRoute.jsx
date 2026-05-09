import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  if (loading) return <div className="p-6">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
