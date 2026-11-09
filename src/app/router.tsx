import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AdminPage } from '../features/admin/pages/AdminPage'
import { AgendamentosPage } from '../features/agendamentos/pages/AgendamentosPage'
import { AccessDeniedPage } from '../features/auth/pages/AccessDeniedPage'
import { CallbackPage } from '../features/auth/pages/CallbackPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { SilentCallbackPage } from '../features/auth/pages/SilentCallbackPage'
import { BarbeirosPage } from '../features/barbeiros/pages/BarbeirosPage'
import { ClientesPage } from '../features/clientes/pages/ClientesPage'
import { CompletarCadastroPage } from '../features/clientes/pages/CompletarCadastroPage'
import { FilaPage } from '../features/fila/pages/FilaPage'
import { AdminRoute } from '../routes/AdminRoute'
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
      <Route path="/silent-callback" element={<SilentCallbackPage />} />
      <Route path="/acesso-negado" element={<AccessDeniedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/completar-cadastro" element={<CompletarCadastroPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/agendamentos" replace />} />
          <Route path="/barbeiros" element={<BarbeirosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="/fila" element={<FilaPage />} />
          <Route path="/meus-dados" element={<CompletarCadastroPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/agendamentos" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
