import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AgendamentosPage } from '../features/agendamentos/pages/AgendamentosPage'
import { BarbeirosPage } from '../features/barbeiros/pages/BarbeirosPage'
import { ClientesPage } from '../features/clientes/pages/ClientesPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/barbeiros" replace />} />
        <Route path="/barbeiros" element={<BarbeirosPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/agendamentos" element={<AgendamentosPage />} />
        <Route path="*" element={<Navigate to="/barbeiros" replace />} />
      </Route>
    </Routes>
  )
}
