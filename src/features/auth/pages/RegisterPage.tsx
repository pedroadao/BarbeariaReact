import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { HttpError } from '../../../lib/http/httpClient'
import { register as registerAccount } from '../api/authApi'
import { registerFormSchema, type RegisterFormValues } from '../schemas/registerSchema'

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Não foi possível criar a conta. Tente novamente.'
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  })

  async function submit(values: RegisterFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await registerAccount(values)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
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
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit(submit)} noValidate>
          <Stack spacing={0.5}>
            <Typography variant="h5" component="h1">
              Criar conta
            </Typography>
            <Typography color="text.secondary">Preencha os dados para se cadastrar.</Typography>
          </Stack>

          <TextField
            id="register-nome"
            label="Nome"
            type="text"
            autoComplete="name"
            error={!!errors.nome}
            helperText={errors.nome?.message}
            {...register('nome')}
          />

          <TextField
            id="register-email"
            label="E-mail"
            type="email"
            autoComplete="username"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />

          <TextField
            id="register-senha"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.senha}
            helperText={errors.senha?.message}
            {...register('senha')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((value) => !value)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="register-confirmar-senha"
            label="Confirmar senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirmarSenha}
            helperText={errors.confirmarSenha?.message}
            {...register('confirmarSenha')}
          />

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <Link component={RouterLink} to="/login" variant="body2" sx={{ alignSelf: 'center' }}>
            Já tem uma conta? Entrar
          </Link>
        </Stack>
      </Paper>
    </Box>
  )
}
