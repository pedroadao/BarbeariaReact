import { createContext } from 'react'
import type { LoginInput, Me } from '../../features/auth/types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: Me | null
  login: (input: LoginInput, returnTo?: string) => Promise<void>
  completeCallback: (code: string, state: string) => Promise<string>
  logout: () => void
  getAccessToken: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
