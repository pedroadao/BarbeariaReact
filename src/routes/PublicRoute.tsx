import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth/useAuth'

export function PublicRoute() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to="/agendamentos" replace />
  }

  return <Outlet />
}
