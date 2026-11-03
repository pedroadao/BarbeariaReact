import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { clienteFormSchema, type ClienteFormValues } from '../schemas/clienteSchema'

interface ClienteFormProps {
  defaultValues?: Partial<ClienteFormValues>
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: ClienteFormValues) => void
}

export function ClienteForm({ defaultValues, isSubmitting, submitLabel, onSubmit }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
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
        <label htmlFor="cliente-nome">Nome</label>
        <input id="cliente-nome" type="text" autoComplete="name" {...register('nome')} />
        {errors.nome && <p role="alert">{errors.nome.message}</p>}
      </div>

      <div>
        <label htmlFor="cliente-email">E-mail</label>
        <input id="cliente-email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="cliente-telefone">Telefone</label>
        <input id="cliente-telefone" type="tel" autoComplete="tel" {...register('telefone')} />
        {errors.telefone && <p role="alert">{errors.telefone.message}</p>}
      </div>

      <div>
        <label htmlFor="cliente-instagram">Instagram</label>
        <input id="cliente-instagram" type="text" {...register('instagram')} />
        {errors.instagram && <p role="alert">{errors.instagram.message}</p>}
      </div>

      <div>
        <label htmlFor="cliente-nascimento">Data de nascimento</label>
        <input id="cliente-nascimento" type="date" {...register('dataNascimento')} />
        {errors.dataNascimento && <p role="alert">{errors.dataNascimento.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}
