import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { PhoneField } from '../../../components/form/PhoneField'
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
    control,
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
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <TextField
          id="barbeiro-nome"
          label="Nome"
          type="text"
          autoComplete="name"
          error={!!errors.nome}
          helperText={errors.nome?.message}
          {...register('nome')}
        />

        <TextField
          id="barbeiro-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <PhoneField control={control} name="telefone" idPrefix="barbeiro" error={errors.telefone?.message} />

        <TextField
          id="barbeiro-instagram"
          label="Instagram"
          type="text"
          error={!!errors.instagram}
          helperText={errors.instagram?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">@</InputAdornment> } }}
          {...register('instagram', {
            onChange: (event) => {
              event.target.value = event.target.value.replace(/^@+/, '')
            },
          })}
        />

        <TextField
          id="barbeiro-nascimento"
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
