import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'

export function EnvioMoedasPage() {
  const [form, setForm] = useState({ alunoId: '', quantidade: 0, mensagem: '' })
  const [alunos, setAlunos] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/professor/alunos').then((res) => setAlunos(res.data))
  }, [])

  return (
    <Layout title="Enviar Moedas">
      <form
        className="surface-card mx-auto grid w-full max-w-2xl gap-4"
        onSubmit={async (event) => {
          event.preventDefault()
          const toastId = toast.loading('Enviando moedas...')
          setSubmitting(true)
          try {
            await api.post('/professor/enviar-moedas', form)
            toast.update(toastId, { render: 'Moedas enviadas com sucesso', type: 'success', isLoading: false, autoClose: 1200 })
          } catch (error) {
            toast.update(toastId, {
              render: error?.response?.data?.message || 'Falha ao enviar moedas',
              type: 'error',
              isLoading: false,
              autoClose: 2500,
            })
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <select
          className="input-pill appearance-none bg-white"
          value={form.alunoId}
          onChange={(event) => setForm((prev) => ({ ...prev, alunoId: event.target.value }))}
        >
          <option value="">Selecione um aluno</option>
          {alunos.map((aluno) => (
            <option key={aluno.id} value={aluno.id}>
              {aluno.usuario.nome} - {aluno.instituicao.nome} - saldo: {aluno.saldoMoedas}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="input-pill"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={(event) => setForm((prev) => ({ ...prev, quantidade: Number(event.target.value) }))}
        />
        <textarea
          className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Mensagem obrigatória"
          value={form.mensagem}
          onChange={(event) => setForm((prev) => ({ ...prev, mensagem: event.target.value }))}
        />
        <button className="btn-primary mt-1 disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </Layout>
  )
}
