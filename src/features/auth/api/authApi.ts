import { env } from '../../../config/env'
import { HttpError, type HttpErrorKind } from '../../../lib/http/httpClient'
import { createPkceChallenge, savePkceState } from '../../../lib/auth/pkce'
import type { LoginInput, Me, TokenResponse } from '../types'

function kindFromStatus(status: number): HttpErrorKind {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 400 || status === 422) return 'validation'
  if (status >= 500) return 'server'
  return 'unknown'
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return null

  try {
    return await response.json()
  } catch {
    return null
  }
}

function messageFromBody(body: unknown, kind: HttpErrorKind): string {
  if (typeof body === 'object' && body !== null) {
    const record = body as Record<string, unknown>
    if (typeof record.error === 'string') return record.error
    if (typeof record.title === 'string') return record.title
  }

  switch (kind) {
    case 'unauthorized':
      return 'E-mail ou senha inválidos.'
    case 'forbidden':
      return 'Você não tem permissão para acessar este recurso.'
    case 'validation':
      return 'Os dados enviados são inválidos.'
    case 'server':
      return 'O servidor encontrou um erro. Tente novamente mais tarde.'
    default:
      return 'Ocorreu um erro inesperado.'
  }
}

interface AuthRequestOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: BodyInit
}

/**
 * Chamadas ao projeto Authentication (cookie de sessão + endpoints OpenIddict
 * /connect/*), em uma base de URL diferente da API de negócio da Barbearia.
 */
async function authRequest<T>(path: string, options: AuthRequestOptions = {}): Promise<T> {
  const url = `${env.VITE_AUTH_BASE_URL}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body,
      credentials: 'include',
    })
  } catch (error) {
    throw new HttpError('network', 'Não foi possível conectar ao servidor de autenticação.', null, error)
  }

  const body = await parseBody(response)

  if (!response.ok) {
    const kind = kindFromStatus(response.status)
    throw new HttpError(kind, messageFromBody(body, kind), response.status, body)
  }

  return body as T
}

/**
 * Autentica a sessão por cookie no Authentication (mesmo endpoint usado pelo
 * fluxo OAuth server-rendered, pedindo resposta JSON). O access token em si só
 * é obtido depois, completando o Authorization Code + PKCE em startAuthorize —
 * ver nota na raiz sobre a decisão de arquitetura (frontend conduz o PKCE).
 */
export function login(input: LoginInput): Promise<{ succeeded: true }> {
  const body = new URLSearchParams({
    email: input.email,
    password: input.senha,
    returnUrl: '/',
  })

  return authRequest<{ succeeded: true }>('/account/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  })
}

/** Inicia o fluxo Authorization Code + PKCE navegando para /connect/authorize. */
export async function startAuthorize(returnTo: string): Promise<void> {
  const { codeVerifier, codeChallenge, state } = await createPkceChallenge()
  savePkceState({ codeVerifier, state, returnTo })

  const params = new URLSearchParams({
    client_id: env.VITE_OIDC_CLIENT_ID,
    response_type: 'code',
    redirect_uri: env.VITE_OIDC_REDIRECT_URI,
    scope: env.VITE_OIDC_SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `${env.VITE_AUTH_BASE_URL}/connect/authorize?${params.toString()}`
}

export function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.VITE_OIDC_REDIRECT_URI,
    client_id: env.VITE_OIDC_CLIENT_ID,
    code_verifier: codeVerifier,
  })

  return authRequest<TokenResponse>('/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: env.VITE_OIDC_CLIENT_ID,
  })

  return authRequest<TokenResponse>('/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export function fetchMe(accessToken: string): Promise<Me> {
  return authRequest<Me>('/api/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

/** Logout é uma navegação completa (end-session do OpenIddict), não uma chamada JSON. */
export function logoutRedirect(): void {
  window.location.href = `${env.VITE_AUTH_BASE_URL}/connect/logout`
}
