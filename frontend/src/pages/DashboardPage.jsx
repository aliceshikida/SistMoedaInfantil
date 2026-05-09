import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

export function DashboardPage() {
  const [data, setData] = useState(null)
  const [cupons, setCupons] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data))
    if (user?.role === 'ALUNO') {
      api.get('/aluno/cupons').then((res) => setCupons(res.data))
    }
    if (user?.role === 'EMPRESA') {
      api.get('/empresa/cupons').then((res) => setCupons(res.data))
    }
  }, [user?.role])

  const chartData =
    user?.role === 'PROFESSOR'
      ? [
          { nome: 'Saldo', valor: data?.saldo || 0 },
          { nome: 'Envios', valor: data?.envios || 0 },
        ]
      : [{ nome: 'Saldo', valor: data?.saldo || 0 }]

  return (
    <Layout title={`Dashboard ${user?.role || ''}`}>
      {!data ? (
        <div className="mx-auto w-full max-w-5xl animate-pulse rounded-lg bg-slate-800 p-6">Carregando indicadores...</div>
      ) : (
        <div className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500">Indicador principal</p>
            <h2 className="text-2xl font-bold">{data.saldo ?? data.usuarios ?? data.vantagens ?? 0}</h2>
            {user?.role === 'ALUNO' && <p className="mt-2 text-sm">Trocas realizadas: {data.trocas?.length || 0}</p>}
            {user?.role === 'PROFESSOR' && (
              <p className="mt-2 text-sm">Alunos reconhecidos: {data.alunosReconhecidos || 0}</p>
            )}
            {user?.role === 'EMPRESA' && <p className="mt-2 text-sm">Resgates totais: {data.resgates || 0}</p>}
          </div>
          <div className="h-60 rounded-xl border p-3 dark:border-slate-700">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                  wrapperStyle={{ outline: 'none' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="valor" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {user?.role === 'ALUNO' && (
            <div className="rounded-xl border p-4 dark:border-slate-700 md:col-span-2">
              <h3 className="mb-2 text-lg font-semibold">Últimas trocas (cupons)</h3>
              {cupons.slice(0, 5).map((cupom) => (
                <p key={cupom.id} className="text-sm">
                  {cupom.codigo} - {cupom.vantagem.titulo}
                </p>
              ))}
            </div>
          )}
          {user?.role === 'EMPRESA' && (
            <div className="rounded-xl border p-4 dark:border-slate-700 md:col-span-2">
              <h3 className="mb-2 text-lg font-semibold">Cupons resgatados</h3>
              {cupons.slice(0, 5).map((cupom) => (
                <p key={cupom.id} className="text-sm">
                  {cupom.codigo} - {cupom.usuario.nome} ({cupom.vantagem.titulo})
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
