import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useAuth } from '../providers/AuthProvider'

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha mínima de 8 caracteres'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={handleSubmit(async (values) => {
          try {
            await signIn(values)
            navigate('/dashboard')
          } catch {
            toast.error('Credenciais inválidas')
          }
        })}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h1 className="mb-4 text-2xl font-bold">Sistema de Moeda Estudantil</h1>
        <input {...register('email')} className="mb-2 w-full rounded border p-2" placeholder="Email" />
        <p className="mb-2 text-xs text-red-500">{formState.errors.email?.message}</p>
        <input type="password" {...register('senha')} className="mb-2 w-full rounded border p-2" placeholder="Senha" />
        <p className="mb-3 text-xs text-red-500">{formState.errors.senha?.message}</p>
        <button className="w-full rounded bg-indigo-600 p-2 font-semibold text-white">Entrar</button>
        <div className="mt-3 flex justify-between text-sm">
          <Link to="/cadastro/aluno">Cadastrar aluno</Link>
          <Link to="/cadastro/empresa">Cadastrar empresa</Link>
        </div>
      </form>
    </main>
  )
}
