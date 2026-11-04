import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Barbeiro } from '../../barbeiros/types'
import type { Agendamento } from '../types'
import { AgendamentosCalendar } from './AgendamentosCalendar'

const barbeiro: Barbeiro = {
  id: 1,
  nome: 'João Barbeiro',
  email: 'joao@barbearia.com',
  telefone: '11999990000',
  instagram: null,
  dataNascimento: '1990-01-01',
  idTipoUsuario: 1,
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

describe('AgendamentosCalendar', () => {
  it('exibe o horário do barbeiro no dia correspondente', () => {
    render(
      <AgendamentosCalendar
        agendamentos={[agendamento]}
        barbeiros={[barbeiro]}
        selectedDate={null}
        onSelectDate={vi.fn()}
      />,
    )

    expect(screen.getByText(/João Barbeiro 09:00:00/)).toBeInTheDocument()
  })

  it('seleciona e desmarca uma data ao clicar no dia', async () => {
    const onSelectDate = vi.fn()
    const user = userEvent.setup()

    render(
      <AgendamentosCalendar
        agendamentos={[agendamento]}
        barbeiros={[barbeiro]}
        selectedDate={null}
        onSelectDate={onSelectDate}
      />,
    )

    await user.click(screen.getByText('10'))

    expect(onSelectDate).toHaveBeenCalledWith('2026-11-10')
  })

  it('navega para o mês anterior e o próximo mês', async () => {
    const user = userEvent.setup()

    render(
      <AgendamentosCalendar agendamentos={[]} barbeiros={[barbeiro]} selectedDate={null} onSelectDate={vi.fn()} />,
    )

    function lerMesAtual() {
      return document.querySelector('[aria-live="polite"]')?.textContent
    }

    const mesInicial = lerMesAtual()

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(lerMesAtual()).not.toBe(mesInicial)

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    expect(lerMesAtual()).toBe(mesInicial)
  })
})
