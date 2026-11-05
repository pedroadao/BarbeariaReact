import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { navigateGlobally } from '../navigation/globalNavigate'
import { HttpError } from './httpClient'

function handleGlobalError(error: unknown): void {
  if (error instanceof HttpError && error.kind === 'forbidden') {
    navigateGlobally('/acesso-negado')
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    mutationCache: new MutationCache({ onError: handleGlobalError }),
  })
}
