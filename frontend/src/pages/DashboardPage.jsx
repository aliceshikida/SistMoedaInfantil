import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

export function DashboardPage() {
  const [data, setData] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data))
  }, [])

  const chartData = [{ nome: 'Saldo', valor: data?.saldo || 0 }]

  return (
    <Layout title={`Dashboard ${user?.role || ''}`}>
      {!data ? (
        <div className="animate-pulse rounded-lg bg-slate-200 p-6">Carregando indicadores...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500">Indicador principal</p>
            <h2 className="text-2xl font-bold">{data.saldo ?? data.usuarios ?? data.vantagens ?? 0}</h2>
          </div>
          <div className="h-60 rounded-xl border p-3 dark:border-slate-700">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Layout>
  )
}
