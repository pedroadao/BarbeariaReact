import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import BlockIcon from '@mui/icons-material/Block'
import { Link } from 'react-router-dom'

export function AccessDeniedPage() {
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
      <Paper elevation={3} sx={{ p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <BlockIcon color="error" sx={{ fontSize: 48 }} />
          <Typography variant="h5" component="h1">
            Acesso negado
          </Typography>
          <Typography color="text.secondary">
            Você não tem permissão para acessar esse recurso. Se acredita que isso é um erro, entre em contato com
            um administrador.
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Voltar ao início
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
