import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useForm } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { HttpError } from '../../../lib/http/httpClient'
import { useAuth } from '../../../lib/auth/useAuth'
import { loginFormSchema, type LoginFormValues } from '../schemas/loginSchema'

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Não foi possível entrar. Tente novamente.'
}

export function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', senha: '' },
  })

  async function submit(values: LoginFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/barbeiros'
      // Em caso de sucesso, a página é substituída pela navegação ao
      // Authentication (/connect/authorize) e depois pelo /callback; não há
      // "retorno" para tratar aqui além de um eventual erro.
      await login(values, redirectTo)
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
              Barbearia
            </Typography>
            <Typography color="text.secondary">Entre com sua conta para continuar.</Typography>
          </Stack>

          <TextField
            id="login-email"
            label="E-mail"
            type="email"
            autoComplete="username"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />

          <TextField
            id="login-senha"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
