import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
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
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <TextField
          id="cliente-nome"
          label="Nome"
          type="text"
          autoComplete="name"
          error={!!errors.nome}
          helperText={errors.nome?.message}
          {...register('nome')}
        />

        <TextField
          id="cliente-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <TextField
          id="cliente-telefone"
          label="Telefone"
          type="tel"
          autoComplete="tel"
          error={!!errors.telefone}
          helperText={errors.telefone?.message}
          {...register('telefone')}
        />

        <TextField
          id="cliente-instagram"
          label="Instagram"
          type="text"
          error={!!errors.instagram}
          helperText={errors.instagram?.message}
          {...register('instagram')}
        />

        <TextField
          id="cliente-nascimento"
          label="Data de nascimento"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.dataNascimento}
          helperText={errors.dataNascimento?.message}
          {...register('dataNascimento')}
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </Stack>
    </form>
  )
}
