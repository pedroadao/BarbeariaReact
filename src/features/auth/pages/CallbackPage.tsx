import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../lib/auth/useAuth'

export function CallbackPage() {
  const [searchParams] = useSearchParams()
  const { completeCallback } = useAuth()
  const [destination, setDestination] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ranOnce = useRef(false)

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const oauthError = searchParams.get('error_description') ?? searchParams.get('error')

    if (oauthError) {
      setError(oauthError)
      return
    }

    if (!code || !state) {
      setError('Retorno de autenticação inválido.')
      return
    }

    completeCallback(code, state)
      .then((returnTo) => setDestination(returnTo))
      .catch(() => setError('Não foi possível concluir o login. Tente novamente.'))
  }, [searchParams, completeCallback])

  if (destination) return <Navigate to={destination} replace />

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
        <Stack spacing={2}>
          {error ? (
            <>
              <Alert severity="error">{error}</Alert>
              <Button component={Link} to="/login" variant="contained">
                Voltar para o login
              </Button>
            </>
          ) : (
            <Typography>Concluindo login…</Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
