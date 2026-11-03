import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as barbeirosApi from '../../barbeiros/api/barbeirosApi'
import type { Barbeiro } from '../../barbeiros/types'
import * as clientesApi from '../../clientes/api/clientesApi'
import type { Cliente } from '../../clientes/types'
import * as agendamentosApi from '../api/agendamentosApi'
import type { Agendamento } from '../types'
import { AgendamentosPage } from './AgendamentosPage'

vi.mock('../api/agendamentosApi')
vi.mock('../../barbeiros/api/barbeirosApi')
vi.mock('../../clientes/api/clientesApi')

const barbeiro: Barbeiro = {
  id: 1,
  nome: 'João Barbeiro',
  email: 'joao@barbearia.com',
  telefone: '11999990000',
  instagram: null,
  dataNascimento: '1990-01-01',
  idTipoUsuario: 1,
}

const cliente: Cliente = {
  id: 1,
  nome: 'Maria Cliente',
  email: 'maria@cliente.com',
  telefone: '11988880000',
  instagram: null,
  dataNascimento: '1992-02-02',
  idTipoUsuario: 2,
}

const agendamento: Agendamento = {
  id: 1,
  idBarbeiro: 1,
  data: '2026-11-10',
  horaInicio: '09:00:00',
  horaFim: '10:00:00',
  idCliente: null,
  disponivel: true,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AgendamentosPage />
    </QueryClientProvider>,
  )
}

describe('AgendamentosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(barbeirosApi.listBarbeiros).mockResolvedValue([barbeiro])
    vi.mocked(clientesApi.listClientes).mockResolvedValue([cliente])
  })

  it('exibe a lista de agendamentos com o nome do barbeiro', async () => {
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([agendamento])

    renderPage()

    const items = await screen.findAllByText(/João Barbeiro/)
    expect(items.some((item) => item.tagName === 'SPAN')).toBe(true)
  })

  it('exibe mensagem de erro quando a listagem falha', async () => {
    const { HttpError } = await import('../../../lib/http/httpClient')
    vi.mocked(agendamentosApi.listAgendamentos).mockRejectedValue(
      new HttpError('server', 'O servidor encontrou um erro. Tente novamente mais tarde.', 500, null),
    )

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor encontrou um erro/i)
  })

  it('cria um novo horário ao enviar o formulário', async () => {
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([])
    vi.mocked(agendamentosApi.createAgendamento).mockResolvedValue(agendamento)

    const user = userEvent.setup()
    renderPage()

    await screen.findByText(/Nenhum horário cadastrado/)

    await user.selectOptions(screen.getByLabelText('Barbeiro'), 'João Barbeiro')
    await user.selectOptions(screen.getByLabelText('Cliente'), 'Maria Cliente')
    await user.type(screen.getByLabelText('Data'), '2026-11-10')
    await user.type(screen.getByLabelText('Hora de início'), '09:00')
    await user.type(screen.getByLabelText('Hora de término'), '10:00')

    await user.click(screen.getByRole('button', { name: 'Criar horário disponível' }))

    await waitFor(() => {
      expect(agendamentosApi.createAgendamento).toHaveBeenCalledWith(
        expect.objectContaining({ idBarbeiro: 1, idCliente: 1, data: '2026-11-10' }),
      )
    })
  })
})
