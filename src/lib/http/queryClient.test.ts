import { afterEach, describe, expect, it, vi } from 'vitest'
import * as globalNavigate from '../navigation/globalNavigate'
import { HttpError } from './httpClient'
import { createQueryClient } from './queryClient'

describe('createQueryClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redireciona para /acesso-negado quando uma query falha com 403', async () => {
    const navigateSpy = vi.spyOn(globalNavigate, 'navigateGlobally')
    const queryClient = createQueryClient()

    await queryClient
      .fetchQuery({
        queryKey: ['teste'],
        queryFn: () => {
          throw new HttpError('forbidden', 'Você não tem permissão para acessar este recurso.', 403, null)
        },
        retry: false,
      })
      .catch(() => undefined)

    expect(navigateSpy).toHaveBeenCalledWith('/acesso-negado')
  })

  it('não redireciona para outros tipos de erro', async () => {
    const navigateSpy = vi.spyOn(globalNavigate, 'navigateGlobally')
    const queryClient = createQueryClient()

    await queryClient
      .fetchQuery({
        queryKey: ['teste-404'],
        queryFn: () => {
          throw new HttpError('notFound', 'Recurso não encontrado.', 404, null)
        },
        retry: false,
      })
      .catch(() => undefined)

    expect(navigateSpy).not.toHaveBeenCalled()
  })
})
