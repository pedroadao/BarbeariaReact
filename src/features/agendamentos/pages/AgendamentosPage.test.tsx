import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as useAuthModule from '../../../lib/auth/useAuth'
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

function mockUser(email: string) {
  vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
    status: 'authenticated',
    user: { id: '1', email, name: 'Usuário' },
    login: vi.fn(),
    completeCallback: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
  })
}

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
  mostrarCadastroSempre: true,
}

const outroCliente: Cliente = {
  id: 2,
  nome: 'Outro Cliente',
  email: 'outro@cliente.com',
  telefone: '11977770000',
  instagram: null,
  dataNascimento: '1995-03-03',
  idTipoUsuario: 2,
  mostrarCadastroSempre: true,
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
    mockUser('admin@admin.com')
    vi.mocked(barbeirosApi.listBarbeiros).mockResolvedValue([barbeiro])
    vi.mocked(clientesApi.listClientes).mockResolvedValue([cliente])
  })

  it('recarrega a lista de agendamentos ao clicar em Recarregar', async () => {
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([agendamento])

    const user = userEvent.setup()
    renderPage()

    await screen.findAllByText(/João Barbeiro/)
    expect(agendamentosApi.listAgendamentos).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Recarregar' }))

    await waitFor(() => {
      expect(agendamentosApi.listAgendamentos).toHaveBeenCalledTimes(2)
    })
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

    await user.click(screen.getByRole('button', { name: 'Novo horário' }))

    await user.selectOptions(screen.getByLabelText('Barbeiro'), 'João Barbeiro')
    await user.selectOptions(screen.getByLabelText('Cliente'), 'Maria Cliente')
    await user.type(screen.getByLabelText('Data'), '2026-11-10')
    await user.selectOptions(screen.getByLabelText('Hora de início'), '09:00')

    await user.click(screen.getByRole('button', { name: 'Criar horário disponível' }))

    await waitFor(() => {
      expect(agendamentosApi.createAgendamento).toHaveBeenCalledWith(
        expect.objectContaining({ idBarbeiro: 1, idCliente: 1, data: '2026-11-10', horaInicio: '09:00', horaFim: '09:30' }),
      )
    })
  })

  it('preenche a hora de término automaticamente 30 minutos após a hora de início', async () => {
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([])

    const user = userEvent.setup()
    renderPage()

    await screen.findByText(/Nenhum horário cadastrado/)

    await user.click(screen.getByRole('button', { name: 'Novo horário' }))

    await user.selectOptions(screen.getByLabelText('Hora de início'), '10:30')

    expect(screen.getByLabelText('Hora de término')).toHaveValue('11:00')
  })

  it('esconde o campo Cliente e usa o próprio cliente para usuário comum', async () => {
    mockUser('cliente@qualquer.com')
    vi.mocked(clientesApi.getMeCliente).mockResolvedValue(cliente)
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([])
    vi.mocked(agendamentosApi.createAgendamento).mockResolvedValue(agendamento)

    const user = userEvent.setup()
    renderPage()

    await screen.findByText(/Nenhum horário cadastrado/)

    await user.click(screen.getByRole('button', { name: 'Novo horário' }))

    expect(screen.queryByLabelText('Cliente')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Barbeiro'), 'João Barbeiro')
    await user.type(screen.getByLabelText('Data'), '2026-11-10')
    await user.selectOptions(screen.getByLabelText('Hora de início'), '09:00')

    await user.click(screen.getByRole('button', { name: 'Criar horário disponível' }))

    await waitFor(() => {
      expect(agendamentosApi.createAgendamento).toHaveBeenCalledWith(
        expect.objectContaining({ idBarbeiro: 1, idCliente: 1, data: '2026-11-10', horaInicio: '09:00', horaFim: '09:30' }),
      )
    })
  })

  it('mostra o botão Excluir para o admin em qualquer agendamento', async () => {
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([
      { ...agendamento, idCliente: 1, disponivel: false },
    ])

    renderPage()

    expect(await screen.findByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('mostra o botão Excluir só na própria reserva, para o cliente comum', async () => {
    mockUser('cliente@qualquer.com')
    vi.mocked(clientesApi.getMeCliente).mockResolvedValue(cliente)
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([
      { ...agendamento, id: 1, idCliente: cliente.id, disponivel: false },
      { ...agendamento, id: 2, idCliente: outroCliente.id, disponivel: false },
    ])

    renderPage()

    await screen.findAllByText(/Reservado/)

    expect(screen.getAllByRole('button', { name: 'Excluir' })).toHaveLength(1)
  })
})
