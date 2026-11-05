import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  exchangeCodeForToken,
  fetchMe,
  login as loginRequest,
  logoutRedirect,
  refreshAccessToken,
  startAuthorize,
} from '../../features/auth/api/authApi'
import type { LoginInput } from '../../features/auth/types'
import { consumePkceState } from './pkce'
import { HttpError, setAccessTokenProvider } from '../http/httpClient'
import { AuthContext, type AuthContextValue } from './authContextValue'

interface Tokens {
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

const EXPIRY_SAFETY_MARGIN_MS = 10_000

/**
 * Tokens ficam apenas em memória (nunca em localStorage/sessionStorage) para
 * reduzir o risco de exposição via XSS: uma atualização completa da página
 * exige nova autenticação. Apenas o code_verifier/state do PKCE (não um
 * token) usam sessionStorage, por precisarem sobreviver à navegação completa
 * até /connect/authorize e de volta — ver lib/auth/pkce.ts.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue['status']>('unauthenticated')
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const tokensRef = useRef<Tokens | null>(null)
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null)
  const queryClient = useQueryClient()

  const login = useCallback(async (input: LoginInput, returnTo = '/') => {
    await loginRequest(input)
    await startAuthorize(returnTo)
  }, [])

  const completeCallback = useCallback(async (code: string, state: string) => {
    const pkce = consumePkceState()

    if (!pkce || pkce.state !== state) {
      throw new Error('Estado de autenticação inválido ou expirado. Tente fazer login novamente.')
    }

    const token = await exchangeCodeForToken(code, pkce.codeVerifier)
    tokensRef.current = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    }

    const me = await fetchMe(token.access_token)
    setUser(me)
    setStatus('authenticated')

    return pkce.returnTo
  }, [])

  const logout = useCallback(() => {
    tokensRef.current = null
    refreshInFlightRef.current = null
    setUser(null)
    setStatus('unauthenticated')
    queryClient.clear()
    logoutRedirect()
  }, [queryClient])

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    const current = tokensRef.current

    if (!current?.refreshToken) {
      tokensRef.current = null
      setUser(null)
      setStatus('unauthenticated')
      return null
    }

    try {
      const token = await refreshAccessToken(current.refreshToken)
      tokensRef.current = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? current.refreshToken,
        expiresAt: Date.now() + token.expires_in * 1000,
      }
      return token.access_token
    } catch (error) {
      tokensRef.current = null
      setUser(null)
      setStatus('unauthenticated')
      if (error instanceof HttpError) return null
      throw error
    }
  }, [])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const current = tokensRef.current
    if (!current) return null

    if (current.expiresAt - EXPIRY_SAFETY_MARGIN_MS > Date.now()) {
      return current.accessToken
    }

    if (!refreshInFlightRef.current) {
      refreshInFlightRef.current = refreshTokens().finally(() => {
        refreshInFlightRef.current = null
      })
    }

    return refreshInFlightRef.current
  }, [refreshTokens])

  useEffect(() => {
    setAccessTokenProvider(getAccessToken)
    return () => setAccessTokenProvider(null)
  }, [getAccessToken])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, completeCallback, logout, getAccessToken }),
    [status, user, login, completeCallback, logout, getAccessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
