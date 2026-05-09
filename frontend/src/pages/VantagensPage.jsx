import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

export function VantagensPage() {
  const [items, setItems] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    api.get('/vantagens').then((res) => setItems(res.data))
  }, [])

  return (
    <Layout title="Vantagens">
      <div className="grid gap-4 md:grid-cols-3">
        {items.length === 0 && <div className="rounded border p-4">Nenhuma vantagem cadastrada.</div>}
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border p-4 dark:border-slate-700">
            <h3 className="font-semibold">{item.titulo}</h3>
            <p className="text-sm text-slate-500">{item.descricao}</p>
            <p className="mt-2 text-indigo-600">{item.custoMoedas} moedas</p>
            {user?.role === 'ALUNO' && (
              <button
                className="mt-3 rounded bg-emerald-600 px-3 py-2 text-sm text-white"
                onClick={async () => {
                  try {
                    await api.post('/aluno/resgatar', { vantagemId: item.id })
                    toast.success('Resgate realizado')
                  } catch {
                    toast.error('Não foi possível resgatar')
                  }
                }}
              >
                Resgatar
              </button>
            )}
          </article>
        ))}
      </div>
    </Layout>
  )
}
