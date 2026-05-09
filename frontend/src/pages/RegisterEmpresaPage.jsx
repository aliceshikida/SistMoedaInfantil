import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useAuth } from '../providers/AuthProvider'

const schema = z
  .object({
    nome: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
    cnpj: z.string().min(14),
    descricao: z.string().min(8),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não conferem',
    path: ['confirmacaoSenha'],
  })

export function RegisterEmpresaPage() {
  const navigate = useNavigate()
  const { registerEmpresa } = useAuth()
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="mb-3 text-2xl font-bold">Cadastro de Empresa</h1>
      <form
        className="grid gap-2 rounded-xl bg-white p-4 shadow"
        onSubmit={handleSubmit(async (values) => {
          try {
            await registerEmpresa(values)
            toast.success('Empresa cadastrada com sucesso')
            navigate('/dashboard')
          } catch {
            toast.error('Erro ao cadastrar empresa')
          }
        })}
      >
        <input {...register('nome')} className="rounded border p-2" placeholder="Nome da empresa" />
        <input {...register('email')} className="rounded border p-2" placeholder="Email" />
        <input type="password" {...register('senha')} className="rounded border p-2" placeholder="Senha" />
        <input type="password" {...register('confirmacaoSenha')} className="rounded border p-2" placeholder="Confirmação de senha" />
        <input {...register('cnpj')} className="rounded border p-2" placeholder="CNPJ" />
        <textarea {...register('descricao')} className="rounded border p-2" placeholder="Descrição da empresa" />
        <p className="text-xs text-red-500">{Object.values(formState.errors)[0]?.message}</p>
        <button className="rounded bg-indigo-600 p-2 text-white">Cadastrar Empresa</button>
      </form>
    </main>
  )
}
