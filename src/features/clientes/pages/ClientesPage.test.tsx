import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as clientesApi from '../api/clientesApi'
import type { Cliente } from '../types'
import { ClientesPage } from './ClientesPage'

vi.mock('../api/clientesApi')

const cliente: Cliente = {
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
      <ClientesPage />
    </QueryClientProvider>,
  )
}

describe('ClientesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exibe a lista de clientes retornada pela API', async () => {
    vi.mocked(clientesApi.listClientes).mockResolvedValue([cliente])

    renderPage()

    expect(await screen.findByText(/Maria Cliente/)).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando a listagem falha', async () => {
    const { HttpError } = await import('../../../lib/http/httpClient')
    vi.mocked(clientesApi.listClientes).mockRejectedValue(
      new HttpError('server', 'O servidor encontrou um erro. Tente novamente mais tarde.', 500, null),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor encontrou um erro/i)
  })

  it('cria um novo cliente ao enviar o formulário', async () => {
    vi.mocked(clientesApi.listClientes).mockResolvedValue([])
    vi.mocked(clientesApi.createCliente).mockResolvedValue({ ...cliente, id: 2, nome: 'Novo Cliente' })

    const user = userEvent.setup()
    renderPage()

    await screen.findByText(/Nenhum cliente cadastrado/)

    await user.type(screen.getByLabelText('Nome'), 'Novo Cliente')
    await user.type(screen.getByLabelText('E-mail'), 'novo@cliente.com')
    await user.type(screen.getByLabelText('Telefone'), '11988882222')
    await user.type(screen.getByLabelText('Data de nascimento'), '1998-01-01')

    await user.click(screen.getByRole('button', { name: 'Cadastrar cliente' }))

    await waitFor(() => {
      expect(clientesApi.createCliente).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Novo Cliente', email: 'novo@cliente.com' }),
      )
    })
  })
})
