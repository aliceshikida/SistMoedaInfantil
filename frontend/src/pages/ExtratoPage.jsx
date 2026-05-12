import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

const tipoLabels = {
  SALDO_INICIAL: 'Saldo inicial',
}

function labelTipo(tipo) {
  return tipoLabels[tipo] ?? tipo
}

export function ExtratoPage() {
  const [data, setData] = useState({ items: [] })
  const { user } = useAuth()
  const isProfessor = user?.role === 'PROFESSOR'
  const isAluno = user?.role === 'ALUNO'

  useEffect(() => {
    api.get('/extrato').then((res) => setData(res.data))
  }, [])

  return (
    <Layout title="Extrato e Transações">
      <div className="surface-card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tipo</th>
              {isProfessor ? <th className="px-4 py-3">Aluno</th> : null}
              {isAluno ? <th className="px-4 py-3">Professor</th> : null}
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Moedas</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{labelTipo(item.tipo)}</td>
                {isProfessor ? (
                  <td className="max-w-[200px] px-4 py-3 text-slate-700">
                    {item.alunoDestino?.usuario?.nome ? (
                      <span className="font-medium">{item.alunoDestino.usuario.nome}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                ) : null}
                {isAluno ? (
                  <td className="max-w-[200px] px-4 py-3 text-slate-700">
                    {item.professor?.usuario?.nome ? (
                      <span className="font-medium">{item.professor.usuario.nome}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-slate-600">{item.descricao}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{item.quantidadeMoedas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
