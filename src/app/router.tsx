import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AgendamentosPage } from '../features/agendamentos/pages/AgendamentosPage'
import { AccessDeniedPage } from '../features/auth/pages/AccessDeniedPage'
import { CallbackPage } from '../features/auth/pages/CallbackPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { BarbeirosPage } from '../features/barbeiros/pages/BarbeirosPage'
import { ClientesPage } from '../features/clientes/pages/ClientesPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { PublicRoute } from '../routes/PublicRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
      </Route>
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/acesso-negado" element={<AccessDeniedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/barbeiros" replace />} />
          <Route path="/barbeiros" element={<BarbeirosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="*" element={<Navigate to="/barbeiros" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
