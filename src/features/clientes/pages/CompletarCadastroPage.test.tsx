import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../lib/auth/AuthContext'
import { HttpError } from '../../../lib/http/httpClient'
import { trySilentLogin } from '../../../lib/auth/silentRenew'
import * as clientesApi from '../api/clientesApi'
import type { Cliente } from '../types'
import { CompletarCadastroPage } from './CompletarCadastroPage'

vi.mock('../api/clientesApi')
vi.mock('../../../lib/auth/silentRenew')

const clienteExistente: Cliente = {
  id: 1,
  nome: 'Maria Cliente',
  email: 'maria@cliente.com',
  telefone: '+55 (11) 98888-0000',
  instagram: null,
  dataNascimento: '1992-02-02',
  idTipoUsuario: 2,
  mostrarCadastroSempre: true,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/completar-cadastro']}>
        <AuthProvider>
          <Routes>
            <Route path="/completar-cadastro" element={<CompletarCadastroPage />} />
            <Route path="/agendamentos" element={<div>Página de agendamentos</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CompletarCadastroPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(trySilentLogin).mockResolvedValue(null)
  })

  it('no primeiro acesso, cria o cadastro e segue para o destino', async () => {
    vi.mocked(clientesApi.getMeCliente).mockRejectedValue(
      new HttpError('notFound', 'Nenhum cadastro associado.', 404, null),
    )
    vi.mocked(clientesApi.createCliente).mockResolvedValue({ ...clienteExistente, id: 2 })
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Complete seu cadastro')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome'), 'Maria Cliente')
    await user.type(screen.getByLabelText('E-mail'), 'maria@cliente.com')
    await user.type(screen.getByLabelText('Telefone'), '11988880000')
    await user.type(screen.getByLabelText('Data de nascimento'), '1992-02-02')
    await user.click(screen.getByRole('button', { name: 'Salvar e continuar' }))

    expect(await screen.findByText('Página de agendamentos')).toBeInTheDocument()
    expect(clientesApi.createCliente).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Maria Cliente', email: 'maria@cliente.com', idTipoUsuario: 2 }),
    )
    expect(clientesApi.updateCliente).not.toHaveBeenCalled()
  })

  it('quando o cliente já existe, pré-preenche e atualiza os dados', async () => {
    vi.mocked(clientesApi.getMeCliente).mockResolvedValue(clienteExistente)
    vi.mocked(clientesApi.updateCliente).mockResolvedValue(clienteExistente)
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Atualize seus dados')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Maria Cliente')

    await user.click(screen.getByRole('button', { name: 'Salvar e continuar' }))

    expect(await screen.findByText('Página de agendamentos')).toBeInTheDocument()
    expect(clientesApi.updateCliente).toHaveBeenCalledWith(
      clienteExistente.id,
      expect.objectContaining({ nome: 'Maria Cliente', mostrarCadastroSempre: true }),
    )
  })
})
