import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Layout } from '../components/Layout'
import { api, resolvePublicFileUrl } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

const statusCupomLabel = {
  GERADO: 'Cupom gerado',
  UTILIZADO: 'Utilizado',
  EXPIRADO: 'Expirado',
}

/** Só trata como foto quando a empresa enviou arquivo (string não vazia). */
function vantagemTemFoto(foto) {
  return typeof foto === 'string' && foto.trim().length > 0
}

export function VantagensPage() {
  const [items, setItems] = useState([])
  const [cuponsResgatados, setCuponsResgatados] = useState([])
  const [form, setForm] = useState({ titulo: '', descricao: '', custoMoedas: 0, foto: null })
  const [submitting, setSubmitting] = useState(false)
  const [rescuingId, setRescuingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [fotoModal, setFotoModal] = useState(null)
  const { user } = useAuth()

  const fotoFormPreviewUrl = useMemo(
    () => (form.foto instanceof File ? URL.createObjectURL(form.foto) : null),
    [form.foto],
  )
  useEffect(() => {
    return () => {
      if (fotoFormPreviewUrl) URL.revokeObjectURL(fotoFormPreviewUrl)
    }
  }, [fotoFormPreviewUrl])

  async function loadData() {
    const endpoint = user?.role === 'EMPRESA' ? '/empresa/vantagens' : '/vantagens'
    const res = await api.get(endpoint)
    setItems(res.data)
  }

  async function loadCuponsAluno() {
    if (user?.role !== 'ALUNO') return
    const res = await api.get('/aluno/cupons')
    setCuponsResgatados(res.data)
  }

  useEffect(() => {
    if (!user) return undefined
    let cancelled = false
    const endpoint = user.role === 'EMPRESA' ? '/empresa/vantagens' : '/vantagens'
    api.get(endpoint).then((res) => {
      if (!cancelled) setItems(res.data)
    })
    if (user.role === 'ALUNO') {
      api.get('/aluno/cupons').then((res) => {
        if (!cancelled) setCuponsResgatados(res.data)
      })
    }
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <Layout title="Vantagens">
      {user?.role === 'EMPRESA' && (
        <form
          className="surface-card mb-8 grid gap-4"
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
              await loadData()
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
          <h2 className="text-lg font-semibold text-slate-900">Cadastrar nova vantagem</h2>
          <input
            className="input-pill"
            placeholder="Título"
            value={form.titulo}
            onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
          />
          <textarea
            className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Descrição"
            value={form.descricao}
            onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
          />
          <input
            type="number"
            className="input-pill"
            placeholder="Custo em moedas"
            value={form.custoMoedas}
            onChange={(event) => setForm((prev) => ({ ...prev, custoMoedas: Number(event.target.value) }))}
          />
          <input
            type="file"
            accept="image/*"
            className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
            onChange={(event) => setForm((prev) => ({ ...prev, foto: event.target.files?.[0] || null }))}
          />
          {fotoFormPreviewUrl ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
              <p className="mb-2 text-xs font-medium text-slate-600">Pré-visualização (será enviada ao salvar)</p>
              <img
                src={fotoFormPreviewUrl}
                alt=""
                className="mx-auto max-h-40 w-full max-w-md rounded-lg object-contain"
              />
            </div>
          ) : null}
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar vantagem'}
          </button>
        </form>
      )}
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && (
          <div className="surface-card col-span-full text-center text-sm text-slate-500">Nenhuma vantagem cadastrada.</div>
        )}
        {items.map((item) => {
          const temFoto = vantagemTemFoto(item.foto)
          return (
          <article
            key={item.id}
            className={`surface-card flex flex-col ${temFoto ? 'cursor-zoom-in transition hover:ring-2 hover:ring-blue-200/80' : ''}`}
            onClick={() => {
              if (temFoto) setFotoModal({ url: resolvePublicFileUrl(item.foto), titulo: item.titulo, vantagemId: item.id })
            }}
          >
            {temFoto ? (
              <div className="-mx-1 -mt-1 mb-3 overflow-hidden rounded-xl border border-slate-100">
                <img
                  src={resolvePublicFileUrl(item.foto)}
                  alt=""
                  className="pointer-events-none h-28 w-full object-cover sm:h-32"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error('[SME] Falha ao carregar foto da vantagem', item.id, e.currentTarget.src)
                  }}
                />
                <p className="border-t border-slate-100 bg-slate-50 px-2 py-1.5 text-center text-[11px] font-medium text-slate-600 sm:px-3 sm:py-2 sm:text-xs">
                  Clique para ver a foto em tamanho maior
                </p>
              </div>
            ) : null}
            <h3 className="font-semibold text-slate-900">{item.titulo}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-slate-500">{item.descricao}</p>
            <p className="mt-3 text-sm font-semibold text-blue-600">{item.custoMoedas} moedas</p>
            {user?.role === 'EMPRESA' && (
              <button
                type="button"
                className="btn-danger mt-4 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={deletingId === item.id}
                onClick={async (e) => {
                  e.stopPropagation()
                  if (
                    !window.confirm(
                      'Excluir esta vantagem? Não será possível se já existirem cupons gerados para ela.',
                    )
                  ) {
                    return
                  }
                  const toastId = toast.loading('Excluindo...')
                  setDeletingId(item.id)
                  try {
                    await api.delete(`/empresa/vantagens/${item.id}`)
                    if (fotoModal?.vantagemId === item.id) setFotoModal(null)
                    toast.update(toastId, { render: 'Vantagem excluída', type: 'success', isLoading: false, autoClose: 1200 })
                    await loadData()
                  } catch (error) {
                    toast.update(toastId, {
                      render: error?.response?.data?.message || 'Não foi possível excluir',
                      type: 'error',
                      isLoading: false,
                      autoClose: 2800,
                    })
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                {deletingId === item.id ? 'Excluindo...' : 'Excluir vantagem'}
              </button>
            )}
            {user?.role === 'ALUNO' && (
              <button
                type="button"
                className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={rescuingId === item.id}
                onClick={async (e) => {
                  e.stopPropagation()
                  const toastId = toast.loading('Processando resgate...')
                  setRescuingId(item.id)
                  try {
                    await api.post('/aluno/resgatar', { vantagemId: item.id })
                    toast.update(toastId, { render: 'Resgate realizado', type: 'success', isLoading: false, autoClose: 1200 })
                    await loadCuponsAluno()
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
          )
        })}
      </div>

      {user?.role === 'ALUNO' && (
        <section className="mt-10" aria-labelledby="vantagens-resgatadas-heading">
          <h2 id="vantagens-resgatadas-heading" className="mb-4 text-lg font-semibold text-slate-900">
            Vantagens resgatadas
          </h2>
          {cuponsResgatados.length === 0 ? (
            <div className="surface-card text-center text-sm text-slate-500">Você ainda não resgatou nenhuma vantagem.</div>
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cuponsResgatados.map((cupom) => (
                <article key={cupom.id} className="surface-card flex flex-col gap-2">
                  {vantagemTemFoto(cupom.vantagem?.foto) ? (
                    <div
                      className="-mx-1 -mt-1 mb-2 cursor-zoom-in overflow-hidden rounded-xl border border-slate-100 transition hover:ring-2 hover:ring-blue-200/80"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setFotoModal({
                          url: resolvePublicFileUrl(cupom.vantagem.foto),
                          titulo: cupom.vantagem?.titulo ?? 'Vantagem',
                          vantagemId: cupom.vantagem?.id,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return
                        e.preventDefault()
                        setFotoModal({
                          url: resolvePublicFileUrl(cupom.vantagem.foto),
                          titulo: cupom.vantagem?.titulo ?? 'Vantagem',
                          vantagemId: cupom.vantagem?.id,
                        })
                      }}
                    >
                      <img
                        src={resolvePublicFileUrl(cupom.vantagem.foto)}
                        alt=""
                        className="pointer-events-none h-28 w-full object-cover sm:h-32"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.error('[SME] Falha ao carregar foto do cupom', cupom.id, e.currentTarget.src)
                        }}
                      />
                      <p className="border-t border-slate-100 bg-slate-50 px-2 py-1.5 text-center text-[11px] font-medium text-slate-600 sm:text-xs">
                        Clique para ver a foto em tamanho maior
                      </p>
                    </div>
                  ) : null}
                  <h3 className="font-semibold text-slate-900">{cupom.vantagem?.titulo ?? 'Vantagem'}</h3>
                  {cupom.vantagem?.descricao ? (
                    <p className="line-clamp-3 text-sm text-slate-500">{cupom.vantagem.descricao}</p>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    Empresa:{' '}
                    <span className="font-medium text-slate-700">
                      {cupom.vantagem?.empresa?.usuario?.nome ?? '—'}
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-blue-700">{cupom.codigo}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <time dateTime={cupom.createdAt}>{new Date(cupom.createdAt).toLocaleString('pt-BR')}</time>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {statusCupomLabel[cupom.status] ?? cupom.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {fotoModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setFotoModal(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={fotoModal.titulo}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{fotoModal.titulo}</h3>
              <button
                type="button"
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setFotoModal(null)}
              >
                Fechar
              </button>
            </div>
            <img
              src={fotoModal.url}
              alt=""
              className="mx-auto max-h-[calc(92vh-5rem)] w-auto max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </Layout>
  )
}
