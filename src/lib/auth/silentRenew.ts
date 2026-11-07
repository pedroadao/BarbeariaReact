import { env } from '../../config/env'
import { exchangeCodeForToken, fetchMe } from '../../features/auth/api/authApi'
import type { Me, TokenResponse } from '../../features/auth/types'
import { createPkceChallenge } from './pkce'

const SILENT_REDIRECT_URI = env.VITE_OIDC_REDIRECT_URI.replace(/\/callback$/, '/silent-callback')
const SILENT_RENEW_TIMEOUT_MS = 8000

interface SilentCallbackMessage {
  type: 'silent-callback'
  code?: string
  state?: string
  error?: string
}

function isSilentCallbackMessage(data: unknown): data is SilentCallbackMessage {
  return typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'silent-callback'
}

export async function trySilentLogin(): Promise<{ token: TokenResponse; user: Me } | null> {
  const { codeVerifier, codeChallenge, state } = await createPkceChallenge()

  const params = new URLSearchParams({
    client_id: env.VITE_OIDC_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SILENT_REDIRECT_URI,
    scope: env.VITE_OIDC_SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'none',
  })

  const authorizeUrl = `${env.VITE_AUTH_BASE_URL}/connect/authorize?${params.toString()}`

  const code = await new Promise<string | null>((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'

    let settled = false

    function cleanup() {
      window.removeEventListener('message', onMessage)
      clearTimeout(timeoutId)
      iframe.remove()
    }

    function settle(value: string | null) {
      if (settled) return
      settled = true
      cleanup()
      resolve(value)
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !isSilentCallbackMessage(event.data)) return
      if (event.data.state !== state || event.data.error || !event.data.code) {
        settle(null)
        return
      }

      settle(event.data.code)
    }

    const timeoutId = setTimeout(() => settle(null), SILENT_RENEW_TIMEOUT_MS)

    window.addEventListener('message', onMessage)
    iframe.src = authorizeUrl
    document.body.appendChild(iframe)
  })

  if (!code) return null

  try {
    const token = await exchangeCodeForToken(code, codeVerifier)
    const user = await fetchMe(token.access_token)
    return { token, user }
  } catch {
    return null
  }
}
