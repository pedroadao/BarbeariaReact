import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link, Outlet, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/barbeiros', label: 'Barbeiros' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/agendamentos', label: 'Agendamentos' },
]

export function AppLayout() {
  const { pathname } = useLocation()
  const currentTab = NAV_ITEMS.some((item) => item.to === pathname) ? pathname : NAV_ITEMS[0].to

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Barbearia
          </Typography>
        </Toolbar>
        <Tabs value={currentTab} textColor="inherit" indicatorColor="secondary">
          {NAV_ITEMS.map((item) => (
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
