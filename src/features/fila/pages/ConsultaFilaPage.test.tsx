import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../lib/http/httpClient'
import * as useAuthModule from '../../../lib/auth/useAuth'
import * as barbeirosApi from '../../barbeiros/api/barbeirosApi'
import type { Barbeiro } from '../../barbeiros/types'
import * as clientesApi from '../../clientes/api/clientesApi'
import type { Cliente } from '../../clientes/types'
import * as agendamentosApi from '../../agendamentos/api/agendamentosApi'
import type { Agendamento } from '../../agendamentos/types'
import { ConsultaFilaPage } from './ConsultaFilaPage'

vi.mock('../../barbeiros/api/barbeirosApi')
vi.mock('../../clientes/api/clientesApi')
vi.mock('../../agendamentos/api/agendamentosApi')

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

function hoje(): string {
  const data = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

const agendamentoHoje: Agendamento = {
  id: 1,
  idBarbeiro: 1,
  data: hoje(),
  horaInicio: '09:00:00',
  horaFim: '09:30:00',
  idCliente: 1,
  disponivel: false,
  nomeClienteAvulso: null,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ConsultaFilaPage />
    </QueryClientProvider>,
  )
}

describe('ConsultaFilaPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(barbeirosApi.listBarbeiros).mockResolvedValue([barbeiro])
    vi.mocked(clientesApi.listClientes).mockResolvedValue([cliente])
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([agendamentoHoje])
  })

  it('bloqueia o acesso para administradores', async () => {
    mockUser('admin@admin.com')
    vi.mocked(barbeirosApi.getMeBarbeiro).mockRejectedValue(
      new HttpError('notFound', 'Nenhum cadastro de barbeiro associado ao usuário autenticado.', 404, null),
    )

    renderPage()

    expect(await screen.findByText('Esta área é exclusiva para clientes.')).toBeInTheDocument()
  })

  it('bloqueia o acesso para barbeiros', async () => {
    mockUser('joao@barbearia.com')
    vi.mocked(barbeirosApi.getMeBarbeiro).mockResolvedValue(barbeiro)

    renderPage()

    expect(await screen.findByText('Esta área é exclusiva para clientes.')).toBeInTheDocument()
  })

  it('permite ao cliente escolher um barbeiro e ver a fila de hoje', async () => {
    mockUser('maria@cliente.com')
    vi.mocked(barbeirosApi.getMeBarbeiro).mockRejectedValue(
      new HttpError('notFound', 'Nenhum cadastro de barbeiro associado ao usuário autenticado.', 404, null),
    )

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Selecione um barbeiro para ver a fila.')

    await user.click(screen.getByLabelText('Barbeiro'))
    await user.click(await screen.findByRole('option', { name: 'João Barbeiro' }))

    expect(await screen.findByText(/09:00:00–09:30:00 — Maria Cliente/)).toBeInTheDocument()
  })

  it('mostra mensagem quando não há clientes na fila do barbeiro selecionado', async () => {
    mockUser('maria@cliente.com')
    vi.mocked(barbeirosApi.getMeBarbeiro).mockRejectedValue(
      new HttpError('notFound', 'Nenhum cadastro de barbeiro associado ao usuário autenticado.', 404, null),
    )
    vi.mocked(agendamentosApi.listAgendamentos).mockResolvedValue([])

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Selecione um barbeiro para ver a fila.')

    await user.click(screen.getByLabelText('Barbeiro'))
    await user.click(await screen.findByRole('option', { name: 'João Barbeiro' }))

    expect(await screen.findByText('Nenhum cliente na fila de hoje.')).toBeInTheDocument()
  })
})
