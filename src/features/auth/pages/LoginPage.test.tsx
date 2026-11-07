import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../lib/auth/AuthContext'
import { trySilentLogin } from '../../../lib/auth/silentRenew'
import * as authApi from '../api/authApi'
import { LoginPage } from './LoginPage'

vi.mock('../api/authApi')
vi.mock('../../../lib/auth/silentRenew')

function renderLoginPage() {
  const queryClient = new QueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/agendamentos" element={<div>Página de agendamentos</div>} />
            <Route path="/registrar" element={<div>Página de cadastro</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(authApi.startAuthorize).mockResolvedValue(undefined)
    vi.mocked(trySilentLogin).mockResolvedValue(null)
  })

  it('exibe mensagens de validação quando os campos estão vazios', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('autentica a sessão por cookie e inicia o Authorization Code + PKCE', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ succeeded: true })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'barbeiro@barbearia.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(authApi.startAuthorize).toHaveBeenCalledWith('/agendamentos'))
    expect(authApi.login).toHaveBeenCalledWith({ email: 'barbeiro@barbearia.com', senha: 'senha123' })
  })

  it('exibe mensagem de erro quando a autenticação falha', async () => {
    const { HttpError } = await import('../../../lib/http/httpClient')
    vi.mocked(authApi.login).mockRejectedValue(
      new HttpError('unauthorized', 'E-mail ou senha inválidos.', 401, null),
    )
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'barbeiro@barbearia.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(authApi.startAuthorize).not.toHaveBeenCalled()
  })

  it('alterna a visibilidade da senha', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const senhaInput = screen.getByLabelText('Senha')
    expect(senhaInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(senhaInput).toHaveAttribute('type', 'text')
  })

  it('navega para a tela de cadastro ao clicar em "Criar conta"', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('link', { name: 'Não tem uma conta? Criar conta' }))

    expect(await screen.findByText('Página de cadastro')).toBeInTheDocument()
  })
})
