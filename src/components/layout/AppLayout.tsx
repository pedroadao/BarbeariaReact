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

const BASE_NAV_ITEMS = [
  { to: '/agendamentos', label: 'Agendamentos' },
  { to: '/meus-dados', label: 'Meus dados' },
]

const ADMIN_NAV_ITEM = { to: '/admin', label: 'Administração' }

export function AppLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = isAdmin(user) ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS
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
