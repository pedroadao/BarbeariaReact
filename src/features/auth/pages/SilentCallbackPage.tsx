import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export function SilentCallbackPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'silent-callback',
        code: searchParams.get('code') ?? undefined,
        state: searchParams.get('state') ?? undefined,
        error: searchParams.get('error_description') ?? searchParams.get('error') ?? undefined,
      },
      window.location.origin,
    )
  }, [searchParams])

  return null
}
