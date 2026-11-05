import { createContext } from 'react'
import type { LoginInput, Me } from '../../features/auth/types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: Me | null
  /** Autentica a sessão por cookie e inicia o Authorization Code + PKCE. */
  login: (input: LoginInput, returnTo?: string) => Promise<void>
  /** Conclui o fluxo a partir do retorno de /connect/authorize em /callback. */
  completeCallback: (code: string, state: string) => Promise<string>
  logout: () => void
  /** Retorna um access token válido, renovando-o via refresh token se necessário. */
  getAccessToken: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
