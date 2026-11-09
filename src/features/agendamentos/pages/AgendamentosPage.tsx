import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { HttpError } from '../../../lib/http/httpClient'
import { useAuth } from '../../../lib/auth/useAuth'
import { isAdmin } from '../../../lib/auth/roles'
import { useBarbeiros, useMeBarbeiro } from '../../barbeiros/hooks/useBarbeiros'
import { useClientes, useMeCliente } from '../../clientes/hooks/useClientes'
import { AgendamentoForm } from '../components/AgendamentoForm'
import { AgendamentosCalendar } from '../components/AgendamentosCalendar'
import { useAgendamentos, useCreateAgendamento, useDeleteAgendamento } from '../hooks/useAgendamentos'
import type { AgendamentoFormValues } from '../schemas/agendamentoSchema'
import type { Agendamento } from '../types'

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Ocorreu um erro inesperado.'
}

export function AgendamentosPage() {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const podeEscolherCliente = admin
  const { data: meCliente } = useMeCliente(!admin)
  const { data: barbeiro } = useMeBarbeiro()
  const { data: agendamentos, isLoading, isFetching, isError, error, refetch } = useAgendamentos()
  const { data: barbeiros, refetch: refetchBarbeiros } = useBarbeiros()
  const { data: clientes, refetch: refetchClientes } = useClientes()
  const createMutation = useCreateAgendamento()
  const deleteMutation = useDeleteAgendamento()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

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

  function podeExcluir(agendamento: Agendamento): boolean {
    return admin || (meCliente != null && agendamento.idCliente === meCliente.id)
  }

  function handleCreate(values: AgendamentoFormValues) {
    createMutation.mutate(values, { onSuccess: () => setModalAberto(false) })
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  function handleRecarregar() {
    void refetch()
    void refetchBarbeiros()
    void refetchClientes()
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

      <Stack direction="row" spacing={2}>
        {!barbeiro && (
          <Button variant="contained" onClick={() => setModalAberto(true)}>
            Novo horário
          </Button>
        )}
        <Button variant="outlined" onClick={handleRecarregar} disabled={isFetching}>
          {isFetching ? 'Recarregando...' : 'Recarregar'}
        </Button>
      </Stack>

      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle>Novo horário disponível</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <AgendamentoForm
              isSubmitting={createMutation.isPending || (!podeEscolherCliente && !meCliente)}
              onSubmit={handleCreate}
              showClienteSelect={podeEscolherCliente}
              ownClienteId={meCliente?.id}
            />
            {createMutation.isError && <Alert severity="error">{errorMessage(createMutation.error)}</Alert>}
          </Stack>
        </DialogContent>
      </Dialog>

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
                    podeExcluir(agendamento) && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(agendamento.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Excluir
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={`${nomeBarbeiro(agendamento.idBarbeiro)} — ${agendamento.data} ${agendamento.horaInicio}–${agendamento.horaFim}`}
                    secondary={
                      agendamento.disponivel
                        ? 'Disponível'
                        : `Reservado (${agendamento.idCliente ? nomeCliente(agendamento.idCliente) : agendamento.nomeClienteAvulso ?? 'Cliente avulso'})`
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
