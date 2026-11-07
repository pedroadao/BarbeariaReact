import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth/useAuth'
import { isAdmin } from '../lib/auth/roles'

export function AdminRoute() {
  const { user } = useAuth()

  if (!isAdmin(user)) {
    return <Navigate to="/agendamentos" replace />
  }

  return <Outlet />
}
