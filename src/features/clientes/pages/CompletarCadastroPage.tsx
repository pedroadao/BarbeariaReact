import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { HttpError } from '../../../lib/http/httpClient'
import { useAuth } from '../../../lib/auth/useAuth'
import { getMeCliente } from '../api/clientesApi'
import { useCompletarCadastro } from '../hooks/useClientes'
import { PhoneField } from '../../../components/form/PhoneField'
import {
  completarCadastroFormSchema,
  type CompletarCadastroFormValues,
} from '../schemas/completarCadastroSchema'

const TIPO_USUARIO_CLIENTE = 2

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Não foi possível salvar o cadastro. Tente novamente.'
}

export function CompletarCadastroPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/agendamentos'

  const {
    data: cliente,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['clientes', 'me'],
    queryFn: ({ signal }) => getMeCliente(signal),
    retry: false,
  })

  const clienteNaoExisteAinda = error instanceof HttpError && error.kind === 'notFound'
  const contaDeOutroTipo = error instanceof HttpError && error.kind === 'conflict'

  useEffect(() => {
    if (contaDeOutroTipo) navigate(returnTo, { replace: true })
  }, [contaDeOutroTipo, navigate, returnTo])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompletarCadastroFormValues>({
    resolver: zodResolver(completarCadastroFormSchema),
    defaultValues: {
      nome: user?.name ?? '',
      email: user?.email ?? '',
      telefone: '',
      instagram: '',
      dataNascimento: '',
    },
  })

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        instagram: cliente.instagram ?? '',
        dataNascimento: cliente.dataNascimento,
      })
    }
  }, [cliente, reset])

  const salvarMutation = useCompletarCadastro(cliente)

  function submit(values: CompletarCadastroFormValues) {
    salvarMutation.mutate(
      {
        ...values,
        instagram: values.instagram || null,
        idTipoUsuario: TIPO_USUARIO_CLIENTE,
        mostrarCadastroSempre: true,
      },
      { onSuccess: () => navigate(returnTo, { replace: true }) },
    )
  }

  if (isLoading || contaDeOutroTipo) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Carregando seus dados…</Typography>
      </Box>
    )
  }

  if (isError && !clienteNaoExisteAinda) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="error">{errorMessage(error)}</Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit(submit)} noValidate>
          <Stack spacing={0.5}>
            <Typography variant="h5" component="h1">
              {clienteNaoExisteAinda ? 'Complete seu cadastro' : 'Atualize seus dados'}
            </Typography>
            <Typography color="text.secondary">
              Precisamos de alguns dados para continuar.
            </Typography>
          </Stack>

          <TextField
            id="cadastro-nome"
            label="Nome"
            type="text"
            autoComplete="name"
            error={!!errors.nome}
            helperText={errors.nome?.message}
            {...register('nome')}
          />

          <TextField
            id="cadastro-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />

          <PhoneField
            control={control}
            name="telefone"
            idPrefix="cadastro"
            error={errors.telefone?.message}
          />

          <TextField
            id="cadastro-instagram"
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
            id="cadastro-nascimento"
            label="Data de nascimento"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.dataNascimento}
            helperText={errors.dataNascimento?.message}
            {...register('dataNascimento')}
          />

          {salvarMutation.isError && <Alert severity="error">{errorMessage(salvarMutation.error)}</Alert>}

          <Button type="submit" variant="contained" disabled={salvarMutation.isPending}>
            {salvarMutation.isPending ? 'Salvando...' : 'Salvar e continuar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
