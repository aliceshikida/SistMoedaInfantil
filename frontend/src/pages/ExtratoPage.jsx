import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../lib/api'

export function ExtratoPage() {
  const [data, setData] = useState({ items: [] })
  useEffect(() => {
    api.get('/extrato').then((res) => setData(res.data))
  }, [])

  return (
    <Layout title="Extrato e Transações">
      <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Moedas</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-t dark:border-slate-700">
                <td className="p-3">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="p-3">{item.tipo}</td>
                <td className="p-3">{item.descricao}</td>
                <td className="p-3">{item.quantidadeMoedas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
