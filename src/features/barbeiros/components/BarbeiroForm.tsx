import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { barbeiroFormSchema, type BarbeiroFormValues } from '../schemas/barbeiroSchema'

interface BarbeiroFormProps {
  defaultValues?: Partial<BarbeiroFormValues>
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: BarbeiroFormValues) => void
}

export function BarbeiroForm({ defaultValues, isSubmitting, submitLabel, onSubmit }: BarbeiroFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BarbeiroFormValues>({
    resolver: zodResolver(barbeiroFormSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      instagram: '',
      dataNascimento: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="barbeiro-nome">Nome</label>
        <input id="barbeiro-nome" type="text" autoComplete="name" {...register('nome')} />
        {errors.nome && <p role="alert">{errors.nome.message}</p>}
      </div>

      <div>
        <label htmlFor="barbeiro-email">E-mail</label>
        <input id="barbeiro-email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="barbeiro-telefone">Telefone</label>
        <input id="barbeiro-telefone" type="tel" autoComplete="tel" {...register('telefone')} />
        {errors.telefone && <p role="alert">{errors.telefone.message}</p>}
      </div>

      <div>
        <label htmlFor="barbeiro-instagram">Instagram</label>
        <input id="barbeiro-instagram" type="text" {...register('instagram')} />
        {errors.instagram && <p role="alert">{errors.instagram.message}</p>}
      </div>

      <div>
        <label htmlFor="barbeiro-nascimento">Data de nascimento</label>
        <input id="barbeiro-nascimento" type="date" {...register('dataNascimento')} />
        {errors.dataNascimento && <p role="alert">{errors.dataNascimento.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}
