import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
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
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
        <IconButton onClick={irParaMesAnterior} aria-label="Mês anterior" size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Typography aria-live="polite" sx={{ textTransform: 'capitalize', minWidth: 160, textAlign: 'center' }}>
          {nomeMes}
        </Typography>
        <IconButton onClick={irParaProximoMes} aria-label="Próximo mês" size="small">
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      <Table size="small">
        <caption className="sr-only">Agenda dos barbeiros em {nomeMes}</caption>
        <TableHead>
          <TableRow>
            {DIAS_SEMANA.map((dia) => (
              <TableCell key={dia} align="center">
                {dia}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: Math.ceil(celulas.length / 7) }, (_, semana) => (
            <TableRow key={semana}>
              {celulas.slice(semana * 7, semana * 7 + 7).map((celula, indice) => {
                if (!celula) {
                  return <TableCell key={indice} />
                }

                const agendamentosDoDia = agendamentosPorData.get(celula.data) ?? []
                const isSelecionado = selectedDate === celula.data

                return (
                  <TableCell key={celula.data} align="center" sx={{ verticalAlign: 'top', p: 0.5 }}>
                    <Box
                      component="button"
                      type="button"
                      aria-pressed={isSelecionado}
                      onClick={() => onSelectDate(isSelecionado ? null : celula.data)}
                      sx={{
                        width: '100%',
                        border: 'none',
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isSelecionado ? 'secondary.light' : 'transparent',
                        p: 0.5,
                        font: 'inherit',
                      }}
                    >
                      <Typography component="span" variant="body2">
                        {celula.dia}
                      </Typography>
                      {agendamentosDoDia.length > 0 && (
                        <Box
                          component="ul"
                          aria-label={`${agendamentosDoDia.length} horário(s) em ${celula.data}`}
                          sx={{ listStyle: 'none', m: 0, p: 0, fontSize: '0.7rem', textAlign: 'left' }}
                        >
                          {agendamentosDoDia.slice(0, 3).map((agendamento) => (
                            <li key={agendamento.id}>
                              {nomeBarbeiro(barbeiros, agendamento.idBarbeiro)} {agendamento.horaInicio}
                            </li>
                          ))}
                          {agendamentosDoDia.length > 3 && <li>+{agendamentosDoDia.length - 3}</li>}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
