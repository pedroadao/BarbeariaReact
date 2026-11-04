import { useMemo, useState } from 'react'
import type { Barbeiro } from '../../barbeiros/types'
import type { Agendamento } from '../types'

interface AgendamentosCalendarProps {
  agendamentos: Agendamento[]
  barbeiros: Barbeiro[]
  selectedDate: string | null
  onSelectDate: (data: string | null) => void
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function nomeBarbeiro(barbeiros: Barbeiro[], idBarbeiro: number): string {
  return barbeiros.find((barbeiro) => barbeiro.id === idBarbeiro)?.nome ?? `Barbeiro #${idBarbeiro}`
}

export function AgendamentosCalendar({
  agendamentos,
  barbeiros,
  selectedDate,
  onSelectDate,
}: AgendamentosCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const hoje = new Date()
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  })

  const agendamentosPorData = useMemo(() => {
    const mapa = new Map<string, Agendamento[]>()
    for (const agendamento of agendamentos) {
      const lista = mapa.get(agendamento.data) ?? []
      lista.push(agendamento)
      mapa.set(agendamento.data, lista)
    }
    return mapa
  }, [agendamentos])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const primeiroDiaSemana = new Date(year, month, 1).getDay()
  const diasNoMes = new Date(year, month + 1, 0).getDate()

  const celulas: Array<{ dia: number; data: string } | null> = []
  for (let i = 0; i < primeiroDiaSemana; i += 1) {
    celulas.push(null)
  }
  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    celulas.push({ dia, data: toDateKey(year, month, dia) })
  }

  const nomeMes = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function irParaMesAnterior() {
    setCursor(new Date(year, month - 1, 1))
  }

  function irParaProximoMes() {
    setCursor(new Date(year, month + 1, 1))
  }

  return (
    <div>
      <div>
        <button type="button" onClick={irParaMesAnterior} aria-label="Mês anterior">
          Anterior
        </button>
        <span aria-live="polite" style={{ margin: '0 0.5rem', textTransform: 'capitalize' }}>
          {nomeMes}
        </span>
        <button type="button" onClick={irParaProximoMes} aria-label="Próximo mês">
          Próximo
        </button>
      </div>

      <table>
        <caption className="sr-only">Agenda dos barbeiros em {nomeMes}</caption>
        <thead>
          <tr>
            {DIAS_SEMANA.map((dia) => (
              <th key={dia} scope="col">
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(celulas.length / 7) }, (_, semana) => (
            <tr key={semana}>
              {celulas.slice(semana * 7, semana * 7 + 7).map((celula, indice) => {
                if (!celula) {
                  return <td key={indice} />
                }

                const agendamentosDoDia = agendamentosPorData.get(celula.data) ?? []
                const isSelecionado = selectedDate === celula.data

                return (
                  <td key={celula.data}>
                    <button
                      type="button"
                      aria-pressed={isSelecionado}
                      onClick={() => onSelectDate(isSelecionado ? null : celula.data)}
                    >
                      <span>{celula.dia}</span>
                      {agendamentosDoDia.length > 0 && (
                        <ul aria-label={`${agendamentosDoDia.length} horário(s) em ${celula.data}`}>
                          {agendamentosDoDia.slice(0, 3).map((agendamento) => (
                            <li key={agendamento.id}>
                              {nomeBarbeiro(barbeiros, agendamento.idBarbeiro)} {agendamento.horaInicio}
                            </li>
                          ))}
                          {agendamentosDoDia.length > 3 && <li>+{agendamentosDoDia.length - 3}</li>}
                        </ul>
                      )}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
