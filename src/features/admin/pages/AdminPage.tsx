import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { AgendamentosPage } from '../../agendamentos/pages/AgendamentosPage'
import { BarbeirosPage } from '../../barbeiros/pages/BarbeirosPage'
import { ClientesPage } from '../../clientes/pages/ClientesPage'
import { LogAlteracoesPage } from '../../logs/pages/LogAlteracoesPage'

const ADMIN_TABS = [
  { value: 'clientes', label: 'Clientes', Component: ClientesPage },
  { value: 'barbeiros', label: 'Barbeiros', Component: BarbeirosPage },
  { value: 'agendamentos', label: 'Agendamentos', Component: AgendamentosPage },
  { value: 'logs', label: 'Log de alterações', Component: LogAlteracoesPage },
] as const

type AdminTabValue = (typeof ADMIN_TABS)[number]['value']

export function AdminPage() {
  const [tab, setTab] = useState<AdminTabValue>('clientes')
  const ActiveTab = ADMIN_TABS.find((item) => item.value === tab)?.Component ?? ClientesPage

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Administração
      </Typography>

      <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 3 }}>
        {ADMIN_TABS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>

      <ActiveTab />
    </Box>
  )
}
