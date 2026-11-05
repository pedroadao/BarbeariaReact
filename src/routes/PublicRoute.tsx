import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth/useAuth'

/** Impede acesso à tela de login quando já há sessão ativa. */
export function PublicRoute() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to="/barbeiros" replace />
  }

  return <Outlet />
}
