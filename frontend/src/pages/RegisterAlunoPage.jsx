import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { api } from '../lib/api'
import { useAuth } from '../providers/AuthProvider'

const schema = z
  .object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
    cpf: z.string().min(11),
    rg: z.string().min(4),
    endereco: z.string().min(5),
    instituicaoId: z.string().min(1),
    curso: z.string().min(2),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não conferem',
    path: ['confirmacaoSenha'],
  })

export function RegisterAlunoPage() {
  const navigate = useNavigate()
  const { registerAluno } = useAuth()
  const [instituicoes, setInstituicoes] = useState([])
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    api.get('/instituicoes').then((res) => setInstituicoes(res.data))
  }, [])

  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="mb-3 text-2xl font-bold">Cadastro de Aluno</h1>
      <form
        className="grid gap-2 rounded-xl bg-white p-4 shadow"
        onSubmit={handleSubmit(async (values) => {
          try {
            await registerAluno(values)
            toast.success('Cadastro realizado com sucesso')
            navigate('/dashboard')
          } catch {
            toast.error('Erro ao cadastrar aluno')
          }
        })}
      >
        <input {...register('nome')} className="rounded border p-2" placeholder="Nome completo" />
        <input {...register('email')} className="rounded border p-2" placeholder="Email" />
        <input type="password" {...register('senha')} className="rounded border p-2" placeholder="Senha" />
        <input type="password" {...register('confirmacaoSenha')} className="rounded border p-2" placeholder="Confirmação de senha" />
        <input {...register('cpf')} className="rounded border p-2" placeholder="CPF" />
        <input {...register('rg')} className="rounded border p-2" placeholder="RG" />
        <input {...register('endereco')} className="rounded border p-2" placeholder="Endereço" />
        <input {...register('curso')} className="rounded border p-2" placeholder="Curso" />
        <select {...register('instituicaoId')} className="rounded border p-2">
          <option value="">Selecione a instituição</option>
          {instituicoes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
        <p className="text-xs text-red-500">{Object.values(formState.errors)[0]?.message}</p>
        <button className="rounded bg-indigo-600 p-2 text-white">Cadastrar</button>
      </form>
    </main>
  )
}
