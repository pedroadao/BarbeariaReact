import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../lib/auth/AuthContext'
import { HttpError } from '../../../lib/http/httpClient'
import { savePkceState } from '../../../lib/auth/pkce'
import { trySilentLogin } from '../../../lib/auth/silentRenew'
import * as clientesApi from '../../clientes/api/clientesApi'
import * as authApi from '../api/authApi'
import { CallbackPage } from './CallbackPage'

vi.mock('../api/authApi')
vi.mock('../../clientes/api/clientesApi')
vi.mock('../../../lib/auth/silentRenew')

function renderCallbackPage() {
  savePkceState({ codeVerifier: 'verifier', state: 'abc', returnTo: '/agendamentos' })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/callback?code=xyz&state=abc']}>
        <AuthProvider>
          <Routes>
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/agendamentos" element={<div>Página de agendamentos</div>} />
            <Route path="/completar-cadastro" element={<div>Tela de completar cadastro</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CallbackPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(authApi.exchangeCodeForToken).mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
    })
    vi.mocked(authApi.fetchMe).mockResolvedValue({ id: '1', email: 'maria@cliente.com', name: 'Maria' })
    vi.mocked(trySilentLogin).mockResolvedValue(null)
  })

  it('redireciona para completar-cadastro quando o cliente ainda não existe', async () => {
    vi.mocked(clientesApi.getMeCliente).mockRejectedValue(
      new HttpError('notFound', 'Nenhum cadastro associado.', 404, null),
    )

    renderCallbackPage()

    expect(await screen.findByText('Tela de completar cadastro')).toBeInTheDocument()
  })

  it('redireciona para completar-cadastro quando mostrarCadastroSempre é true e faltam dados', async () => {
    vi.mocked(clientesApi.getMeCliente).mockResolvedValue({
      id: 1,
      nome: 'Maria',
      email: 'maria@cliente.com',
      telefone: '',
      instagram: null,
      dataNascimento: '',
      idTipoUsuario: 2,
      mostrarCadastroSempre: true,
    })

    renderCallbackPage()

    expect(await screen.findByText('Tela de completar cadastro')).toBeInTheDocument()
  })

  it('segue direto para o destino original quando telefone ou data de nascimento já estão preenchidos, mesmo com mostrarCadastroSempre true', async () => {
    vi.mocked(clientesApi.getMeCliente).mockResolvedValue({
      id: 1,
      nome: 'Maria',
      email: 'maria@cliente.com',
      telefone: '11988880000',
      instagram: null,
      dataNascimento: '1992-02-02',
      idTipoUsuario: 2,
      mostrarCadastroSempre: true,
    })

    renderCallbackPage()

    expect(await screen.findByText('Página de agendamentos')).toBeInTheDocument()
  })

  it('segue direto para o destino original quando mostrarCadastroSempre é false', async () => {
    vi.mocked(clientesApi.getMeCliente).mockResolvedValue({
      id: 1,
      nome: 'Maria',
      email: 'maria@cliente.com',
      telefone: '11988880000',
      instagram: null,
      dataNascimento: '1992-02-02',
      idTipoUsuario: 2,
      mostrarCadastroSempre: false,
    })

    renderCallbackPage()

    expect(await screen.findByText('Página de agendamentos')).toBeInTheDocument()
  })
})
