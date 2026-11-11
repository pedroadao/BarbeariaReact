import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/useAuth'
import { isAdmin } from '../../lib/auth/roles'
import { useMeBarbeiro } from '../../features/barbeiros/hooks/useBarbeiros'

const AGENDAMENTOS_NAV_ITEM = { to: '/agendamentos', label: 'Agendamentos' }
const FILA_NAV_ITEM = { to: '/fila', label: 'Fila' }
const FILA_BARBEIRO_NAV_ITEM = { to: '/fila-barbeiro', label: 'Fila dos barbeiros' }
const MEUS_DADOS_NAV_ITEM = { to: '/meus-dados', label: 'Meus dados' }
const ADMIN_NAV_ITEM = { to: '/admin', label: 'Administração' }

export function AppLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const admin = isAdmin(user)
  const { data: barbeiro } = useMeBarbeiro()
  const navItems = admin
    ? [AGENDAMENTOS_NAV_ITEM, ADMIN_NAV_ITEM]
    : barbeiro
      ? [AGENDAMENTOS_NAV_ITEM, FILA_NAV_ITEM]
      : [AGENDAMENTOS_NAV_ITEM, FILA_BARBEIRO_NAV_ITEM, MEUS_DADOS_NAV_ITEM]
  const currentTab = navItems.some((item) => item.to === pathname) ? pathname : navItems[0].to

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Barbearia
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {user && <Typography>{user.name}</Typography>}
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          </Stack>
        </Toolbar>
        <Tabs value={currentTab} textColor="inherit" indicatorColor="secondary">
          {navItems.map((item) => (
            <Tab key={item.to} label={item.label} value={item.to} component={Link} to={item.to} />
          ))}
        </Tabs>
      </AppBar>
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </div>
  )
}
