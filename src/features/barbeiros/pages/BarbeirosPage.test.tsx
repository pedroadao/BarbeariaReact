import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as barbeirosApi from '../api/barbeirosApi'
import type { Barbeiro } from '../types'
import { BarbeirosPage } from './BarbeirosPage'

vi.mock('../api/barbeirosApi')

const barbeiro: Barbeiro = {
  id: 1,
  nome: 'João Barbeiro',
  email: 'joao@barbearia.com',
  telefone: '11999990000',
  instagram: null,
  dataNascimento: '1990-01-01',
  idTipoUsuario: 1,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BarbeirosPage />
    </QueryClientProvider>,
  )
}

describe('BarbeirosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('exibe a lista de barbeiros retornada pela API', async () => {
    vi.mocked(barbeirosApi.listBarbeiros).mockResolvedValue([barbeiro])

    renderPage()

    expect(await screen.findByText(/João Barbeiro/)).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando a listagem falha', async () => {
    const { HttpError } = await import('../../../lib/http/httpClient')
    vi.mocked(barbeirosApi.listBarbeiros).mockRejectedValue(
      new HttpError('server', 'O servidor encontrou um erro. Tente novamente mais tarde.', 500, null),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor encontrou um erro/i)
  })

  it('cria um novo barbeiro ao enviar o formulário', async () => {
    vi.mocked(barbeirosApi.listBarbeiros).mockResolvedValue([])
    vi.mocked(barbeirosApi.createBarbeiro).mockResolvedValue({ ...barbeiro, id: 2, nome: 'Novo Barbeiro' })

    const user = userEvent.setup()
    renderPage()

    await screen.findByText(/Nenhum barbeiro cadastrado/)

    await user.type(screen.getByLabelText('Nome'), 'Novo Barbeiro')
    await user.type(screen.getByLabelText('E-mail'), 'novo@barbearia.com')
    await user.type(screen.getByLabelText('Telefone'), '11999991111')
    await user.type(screen.getByLabelText('Data de nascimento'), '1995-01-01')

    await user.click(screen.getByRole('button', { name: 'Cadastrar barbeiro' }))

    await waitFor(() => {
      expect(barbeirosApi.createBarbeiro).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Novo Barbeiro', email: 'novo@barbearia.com' }),
      )
    })
  })
})
