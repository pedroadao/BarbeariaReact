import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { HttpError } from '../../../lib/http/httpClient'
import { useBarbeiros } from '../../barbeiros/hooks/useBarbeiros'
import { useClientes } from '../../clientes/hooks/useClientes'
import { AgendamentoForm } from '../components/AgendamentoForm'
import { AgendamentosCalendar } from '../components/AgendamentosCalendar'
import { useAgendamentos, useCreateAgendamento, useDeleteAgendamento } from '../hooks/useAgendamentos'
import type { AgendamentoFormValues } from '../schemas/agendamentoSchema'

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Ocorreu um erro inesperado.'
}

export function AgendamentosPage() {
  const { data: agendamentos, isLoading, isError, error } = useAgendamentos()
  const { data: barbeiros } = useBarbeiros()
  const { data: clientes } = useClientes()
  const createMutation = useCreateAgendamento()
  const deleteMutation = useDeleteAgendamento()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const agendamentosExibidos = useMemo(() => {
    if (!agendamentos) return agendamentos
    if (!selectedDate) return agendamentos
    return agendamentos.filter((agendamento) => agendamento.data === selectedDate)
  }, [agendamentos, selectedDate])

  function nomeBarbeiro(idBarbeiro: number): string {
    return barbeiros?.find((barbeiro) => barbeiro.id === idBarbeiro)?.nome ?? `Barbeiro #${idBarbeiro}`
  }

  function nomeCliente(idCliente: number): string {
    return clientes?.find((cliente) => cliente.id === idCliente)?.nome ?? `Cliente #${idCliente}`
  }

  function handleCreate(values: AgendamentoFormValues) {
    createMutation.mutate(values)
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Agendamentos
      </Typography>
      <Typography color="text.secondary">
        Cada registro é um horário do barbeiro. Associe um cliente ao criar para reservar o horário, ou deixe sem
        cliente para marcá-lo como disponível.
      </Typography>

      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Novo horário disponível
        </Typography>
        <AgendamentoForm isSubmitting={createMutation.isPending} onSubmit={handleCreate} />
        {createMutation.isError && <Alert severity="error">{errorMessage(createMutation.error)}</Alert>}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          Agenda dos barbeiros
        </Typography>
        {!isLoading && !isError && (
          <AgendamentosCalendar
            agendamentos={agendamentos ?? []}
            barbeiros={barbeiros ?? []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          Lista de horários
        </Typography>
        {isLoading && <Typography>Carregando agendamentos...</Typography>}
        {isError && <Alert severity="error">{errorMessage(error)}</Alert>}
        {selectedDate && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography>Filtrando por {selectedDate}.</Typography>
            <Chip label="Limpar filtro" size="small" onClick={() => setSelectedDate(null)} />
          </Stack>
        )}
        {!isLoading && !isError && agendamentosExibidos?.length === 0 && (
          <Typography>{selectedDate ? 'Nenhum horário cadastrado para esta data.' : 'Nenhum horário cadastrado.'}</Typography>
        )}

        {agendamentosExibidos && agendamentosExibidos.length > 0 && (
          <List disablePadding>
            {agendamentosExibidos.map((agendamento, index) => (
              <div key={agendamento.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  secondaryAction={
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(agendamento.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Excluir
                    </Button>
                  }
                >
                  <ListItemText
                    primary={`${nomeBarbeiro(agendamento.idBarbeiro)} — ${agendamento.data} ${agendamento.horaInicio}–${agendamento.horaFim}`}
                    secondary={
                      agendamento.disponivel
                        ? 'Disponível'
                        : `Reservado (${nomeCliente(agendamento.idCliente as number)})`
                    }
                  />
                </ListItem>
              </div>
            ))}
          </List>
        )}
        {deleteMutation.isError && <Alert severity="error">{errorMessage(deleteMutation.error)}</Alert>}
      </Stack>
    </Stack>
  )
}
