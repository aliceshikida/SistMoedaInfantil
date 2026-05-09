import { useState } from 'react'
import { toast } from 'react-toastify'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'

export function EnvioMoedasPage() {
  const [form, setForm] = useState({ alunoId: '', quantidade: 0, mensagem: '' })

  return (
    <Layout title="Enviar Moedas">
      <form
        className="grid max-w-lg gap-2 rounded-xl border p-4 dark:border-slate-700"
        onSubmit={async (event) => {
          event.preventDefault()
          try {
            await api.post('/professor/enviar-moedas', form)
            toast.success('Moedas enviadas')
          } catch {
            toast.error('Falha ao enviar moedas')
          }
        }}
      >
        <input
          className="rounded border p-2"
          placeholder="ID do aluno"
          value={form.alunoId}
          onChange={(event) => setForm((prev) => ({ ...prev, alunoId: event.target.value }))}
        />
        <input
          type="number"
          className="rounded border p-2"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={(event) => setForm((prev) => ({ ...prev, quantidade: Number(event.target.value) }))}
        />
        <textarea
          className="rounded border p-2"
          placeholder="Mensagem obrigatória"
          value={form.mensagem}
          onChange={(event) => setForm((prev) => ({ ...prev, mensagem: event.target.value }))}
        />
        <button className="rounded bg-indigo-600 p-2 text-white">Enviar</button>
      </form>
    </Layout>
  )
}
