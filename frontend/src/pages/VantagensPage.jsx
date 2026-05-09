import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

export function VantagensPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ titulo: '', descricao: '', custoMoedas: 0, foto: null })
  const [submitting, setSubmitting] = useState(false)
  const [rescuingId, setRescuingId] = useState(null)
  const { user } = useAuth()

  async function loadData() {
    const endpoint = user?.role === 'EMPRESA' ? '/empresa/vantagens' : '/vantagens'
    const res = await api.get(endpoint)
    setItems(res.data)
  }

  useEffect(() => {
    if (user) loadData()
  }, [user])

  return (
    <Layout title="Vantagens">
      {user?.role === 'EMPRESA' && (
        <form
          className="mb-5 grid gap-2 rounded-xl border p-4 dark:border-slate-700"
          onSubmit={async (event) => {
            event.preventDefault()
            const toastId = toast.loading('Salvando vantagem...')
            setSubmitting(true)
            try {
              const payload = new FormData()
              payload.append('titulo', form.titulo)
              payload.append('descricao', form.descricao)
              payload.append('custoMoedas', String(form.custoMoedas))
              if (form.foto) payload.append('foto', form.foto)
              await api.post('/empresa/vantagens', payload)
              toast.update(toastId, { render: 'Vantagem cadastrada com sucesso', type: 'success', isLoading: false, autoClose: 1200 })
              setForm({ titulo: '', descricao: '', custoMoedas: 0, foto: null })
              loadData()
            } catch (error) {
              toast.update(toastId, {
                render: error?.response?.data?.message || 'Erro ao cadastrar vantagem',
                type: 'error',
                isLoading: false,
                autoClose: 2500,
              })
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <h2 className="text-lg font-semibold">Cadastrar nova vantagem</h2>
          <input
            className="rounded border p-2 dark:bg-slate-800"
            placeholder="Título"
            value={form.titulo}
            onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
          />
          <textarea
            className="rounded border p-2 dark:bg-slate-800"
            placeholder="Descrição"
            value={form.descricao}
            onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
          />
          <input
            type="number"
            className="rounded border p-2 dark:bg-slate-800"
            placeholder="Custo em moedas"
            value={form.custoMoedas}
            onChange={(event) => setForm((prev) => ({ ...prev, custoMoedas: Number(event.target.value) }))}
          />
          <input
            type="file"
            className="rounded border p-2 dark:bg-slate-800"
            onChange={(event) => setForm((prev) => ({ ...prev, foto: event.target.files?.[0] || null }))}
          />
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar vantagem'}
          </button>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {items.length === 0 && <div className="rounded border p-4">Nenhuma vantagem cadastrada.</div>}
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border p-4 dark:border-slate-700">
            <h3 className="font-semibold">{item.titulo}</h3>
            <p className="text-sm text-slate-500">{item.descricao}</p>
            <p className="mt-2 text-indigo-600">{item.custoMoedas} moedas</p>
            {user?.role === 'ALUNO' && (
              <button
                className="btn-primary mt-3 bg-emerald-600 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={rescuingId === item.id}
                onClick={async () => {
                  const toastId = toast.loading('Processando resgate...')
                  setRescuingId(item.id)
                  try {
                    await api.post('/aluno/resgatar', { vantagemId: item.id })
                    toast.update(toastId, { render: 'Resgate realizado', type: 'success', isLoading: false, autoClose: 1200 })
                  } catch (error) {
                    toast.update(toastId, {
                      render: error?.response?.data?.message || 'Não foi possível resgatar',
                      type: 'error',
                      isLoading: false,
                      autoClose: 2500,
                    })
                  } finally {
                    setRescuingId(null)
                  }
                }}
              >
                {rescuingId === item.id ? 'Resgatando...' : 'Resgatar'}
              </button>
            )}
          </article>
        ))}
      </div>
    </Layout>
  )
}
