import { useEffect, useMemo, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

function StatCard({ label, value, hint, accent }) {
  const accents = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    violet: 'bg-violet-600',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
  }
  return (
    <div className="surface-card flex flex-col gap-3">
      <div className={`h-10 w-10 rounded-xl ${accents[accent] ?? accents.blue} shadow-sm`} aria-hidden />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </div>
    </div>
  )
}

function buildPieData(role, data) {
  if (!data || !role) return []

  if (role === 'PROFESSOR') {
    const saldo = Math.max(0, Number(data.saldo) || 0)
    const gastas = Math.max(0, Number(data.moedasGastas) || 0)
    const slices = []
    if (saldo > 0) slices.push({ name: 'Saldo', value: saldo, fill: '#2563eb' })
    if (gastas > 0) slices.push({ name: 'Moedas gastas', value: gastas, fill: '#38bdf8' })
    if (slices.length === 0) slices.push({ name: 'Sem movimento', value: 1, fill: '#e2e8f0' })
    return slices
  }

  if (role === 'ALUNO') {
    const recebidas = Math.max(0, Number(data.moedasRecebidas) || 0)
    const gastas = Math.max(0, Number(data.moedasGastas) || 0)
    const slices = []
    if (recebidas > 0) slices.push({ name: 'Moedas recebidas', value: recebidas, fill: '#2563eb' })
    if (gastas > 0) slices.push({ name: 'Moedas gastas', value: gastas, fill: '#38bdf8' })
    if (slices.length === 0) slices.push({ name: 'Sem movimento', value: 1, fill: '#e2e8f0' })
    return slices
  }

  if (role === 'EMPRESA') {
    const v = Math.max(0, Number(data.vantagens) || 0)
    const r = Math.max(0, Number(data.resgates) || 0)
    const slices = []
    if (v > 0) slices.push({ name: 'Vantagens cadastradas', value: v, fill: '#2563eb' })
    if (r > 0) slices.push({ name: 'Resgates (cupons)', value: r, fill: '#6366f1' })
    if (slices.length === 0) slices.push({ name: 'Sem dados', value: 1, fill: '#e2e8f0' })
    return slices
  }

  const distribuidas = Math.max(0, Number(data.moedasDistribuidas) || 0)
  const gastas = Math.max(0, Number(data.moedasGastas) || 0)
  const slices = []
  if (distribuidas > 0) slices.push({ name: 'Moedas distribuídas', value: distribuidas, fill: '#2563eb' })
  if (gastas > 0) slices.push({ name: 'Moedas gastas (resgates)', value: gastas, fill: '#38bdf8' })
  if (slices.length === 0) slices.push({ name: 'Sem dados', value: 1, fill: '#e2e8f0' })
  return slices
}

function DashboardPie({ user, data }) {
  const chartData = useMemo(() => buildPieData(user?.role, data), [user?.role, data])

  const title =
    user?.role === 'EMPRESA'
      ? 'Vantagens e resgates'
      : user?.role === 'ADMIN'
        ? 'Moedas no sistema'
        : user?.role === 'ALUNO'
          ? 'Moedas recebidas e gastas'
          : 'Saldo e moedas gastas'

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="mb-3 text-center text-sm font-medium text-slate-600">{title}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 8, left: 8, bottom: 4 }}>
            <Legend
              verticalAlign="top"
              align="center"
              layout="horizontal"
              wrapperStyle={{ fontSize: 12, paddingBottom: 4 }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="52%"
              innerRadius={48}
              outerRadius={82}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, i) => (
                <Cell key={entry.name + i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => Number(v).toLocaleString('pt-BR')} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

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

  const statCards = (() => {
    if (!data || !user) return []
    if (user.role === 'ALUNO') {
      return [
        { label: 'Saldo em moedas', value: data.saldo ?? 0, hint: 'Disponível para resgates', accent: 'blue' },
        {
          label: 'Moedas já recebidas',
          value: data.moedasRecebidas ?? 0,
          hint: 'Total enviado por professores',
          accent: 'indigo',
        },
        {
          label: 'Moedas já gastas',
          value: data.moedasGastas ?? 0,
          hint: 'Total usado em resgates (vantagens)',
          accent: 'sky',
        },
        { label: 'Trocas recentes', value: data.trocas?.length ?? 0, hint: 'Últimos cupons no sistema', accent: 'violet' },
        {
          label: 'Movimentações',
          value: Array.isArray(data.extrato) ? data.extrato.length : 0,
          hint: 'Lançamentos recentes',
          accent: 'amber',
        },
      ]
    }
    if (user.role === 'PROFESSOR') {
      return [
        { label: 'Saldo em moedas', value: data.saldo ?? 0, hint: 'Moedas para reconhecer alunos', accent: 'blue' },
        {
          label: 'Moedas gastas (enviadas)',
          value: data.moedasGastas ?? 0,
          hint: 'Soma enviada aos alunos',
          accent: 'sky',
        },
        { label: 'Envios realizados', value: data.envios ?? 0, hint: 'Quantidade de envios', accent: 'violet' },
        {
          label: 'Alunos reconhecidos',
          value: data.alunosReconhecidos ?? 0,
          hint: 'Alunos distintos',
          accent: 'amber',
        },
      ]
    }
    if (user.role === 'EMPRESA') {
      return [
        {
          label: 'Moedas gastas (resgates)',
          value: data.moedasGastas ?? 0,
          hint: 'Custo em moedas dos cupons gerados',
          accent: 'sky',
        },
        { label: 'Vantagens ativas', value: data.vantagens ?? 0, hint: 'Cadastradas pela empresa', accent: 'blue' },
        { label: 'Resgates totais', value: data.resgates ?? 0, hint: 'Cupons gerados', accent: 'indigo' },
      ]
    }
    return [
      { label: 'Usuários', value: data.usuarios ?? 0, hint: 'Total no sistema', accent: 'blue' },
      {
        label: 'Moedas distribuídas',
        value: data.moedasDistribuidas ?? 0,
        hint: 'Soma das transações',
        accent: 'indigo',
      },
      {
        label: 'Moedas gastas (resgates)',
        value: data.moedasGastas ?? 0,
        hint: 'Total resgatado em vantagens',
        accent: 'sky',
      },
    ]
  })()

  return (
    <Layout title={`Dashboard ${user?.role || ''}`}>
      {!data ? (
        <div className="surface-card animate-pulse text-center text-sm text-slate-500">Carregando indicadores...</div>
      ) : (
        <div className="flex flex-col gap-6">
          <div
            className={`grid gap-4 ${
              statCards.length >= 5
                ? 'sm:grid-cols-2 lg:grid-cols-5'
                : statCards.length >= 4
                  ? 'sm:grid-cols-2 lg:grid-cols-4'
                  : statCards.length === 3
                    ? 'sm:grid-cols-2 lg:grid-cols-3'
                    : 'sm:grid-cols-2'
            }`}
          >
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {user?.role === 'PROFESSOR' ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="surface-card p-5 lg:col-span-2">
                <h2 className="mb-2 text-sm font-semibold text-slate-700">Gráfico</h2>
                <DashboardPie user={user} data={data} />
              </div>
              <div className="surface-card flex flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">Envios realizados</p>
                <p className="text-4xl font-bold tabular-nums text-slate-900">{data.envios ?? 0}</p>
                <p className="text-xs text-slate-400">Quantidade de transferências</p>
              </div>
            </div>
          ) : (
            <div className="surface-card p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Gráfico</h2>
              <DashboardPie user={user} data={data} />
            </div>
          )}

          {user?.role === 'ALUNO' && (
            <div className="surface-card md:col-span-2">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Últimas trocas (cupons)</h3>
              <ul className="divide-y divide-slate-100">
                {cupons.slice(0, 5).map((cupom) => (
                  <li key={cupom.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                    <div>
                      <p className="font-semibold text-slate-900">{cupom.vantagem.titulo}</p>
                      <p className="text-xs text-slate-500">Código {cupom.codigo}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user?.role === 'EMPRESA' && (
            <div className="surface-card md:col-span-2">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Cupons resgatados</h3>
              <ul className="divide-y divide-slate-100">
                {cupons.slice(0, 5).map((cupom) => (
                  <li key={cupom.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                    <div>
                      <p className="font-semibold text-slate-900">{cupom.usuario.nome}</p>
                      <p className="text-xs text-slate-500">
                        {cupom.codigo} — {cupom.vantagem.titulo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
