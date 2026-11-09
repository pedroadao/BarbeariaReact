import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DeleteIcon from '@mui/icons-material/Delete'
import { HttpError } from '../../../lib/http/httpClient'
import { useMeBarbeiro } from '../../barbeiros/hooks/useBarbeiros'
import { useClientes } from '../../clientes/hooks/useClientes'
import {
  useAdicionarClienteAvulso,
  useAgendamentos,
  useDeleteAgendamento,
  useReordenarFila,
} from '../../agendamentos/hooks/useAgendamentos'

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Ocorreu um erro inesperado.'
}

function hoje(): string {
  const data = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

export function FilaPage() {
  const { data: barbeiro, isLoading: isLoadingBarbeiro } = useMeBarbeiro()
  const { data: agendamentos, isLoading: isLoadingAgendamentos, isError, error } = useAgendamentos()
  const { data: clientes } = useClientes()
  const adicionarMutation = useAdicionarClienteAvulso()
  const reordenarMutation = useReordenarFila()
  const deleteMutation = useDeleteAgendamento()
  const [nomeCliente, setNomeCliente] = useState('')

  const fila = useMemo(() => {
    if (!agendamentos || !barbeiro) return []
    const data = hoje()
    return agendamentos
      .filter((agendamento) => agendamento.idBarbeiro === barbeiro.id && agendamento.data === data && !agendamento.disponivel)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }, [agendamentos, barbeiro])

  function nomeDoCliente(idCliente: number | null, nomeClienteAvulso: string | null): string {
    if (nomeClienteAvulso) return nomeClienteAvulso
    if (idCliente) return clientes?.find((cliente) => cliente.id === idCliente)?.nome ?? `Cliente #${idCliente}`
    return 'Cliente'
  }

  function handleAdicionar() {
    if (!barbeiro || !nomeCliente.trim()) return
    adicionarMutation.mutate(
      { idBarbeiro: barbeiro.id, nomeCliente: nomeCliente.trim() },
      { onSuccess: () => setNomeCliente('') },
    )
  }

  function handleMover(indice: number, direcao: -1 | 1) {
    if (!barbeiro) return
    const destino = indice + direcao
    if (destino < 0 || destino >= fila.length) return

    const idsEmOrdem = fila.map((agendamento) => agendamento.id)
    const [item] = idsEmOrdem.splice(indice, 1)
    idsEmOrdem.splice(destino, 0, item)

    reordenarMutation.mutate({ idBarbeiro: barbeiro.id, data: hoje(), idsEmOrdem })
  }

  function handleRemover(id: number) {
    deleteMutation.mutate(id)
  }

  if (isLoadingBarbeiro) {
    return <Typography>Carregando...</Typography>
  }

  if (!barbeiro) {
    return <Alert severity="error">Esta área é exclusiva para barbeiros.</Alert>
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Fila de atendimento
      </Typography>
      <Typography color="text.secondary">
        Clientes agendados para hoje. Use o botão abaixo para adicionar um cliente sem cadastro à fila — ele será
        encaixado no próximo horário disponível.
      </Typography>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Nome do cliente"
          size="small"
          value={nomeCliente}
          onChange={(event) => setNomeCliente(event.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAdicionar}
          disabled={adicionarMutation.isPending || !nomeCliente.trim()}
        >
          {adicionarMutation.isPending ? 'Adicionando...' : 'Adicionar à fila'}
        </Button>
      </Stack>

      {adicionarMutation.isError && <Alert severity="error">{errorMessage(adicionarMutation.error)}</Alert>}
      {reordenarMutation.isError && <Alert severity="error">{errorMessage(reordenarMutation.error)}</Alert>}
      {deleteMutation.isError && <Alert severity="error">{errorMessage(deleteMutation.error)}</Alert>}

      {isLoadingAgendamentos && <Typography>Carregando fila...</Typography>}
      {isError && <Alert severity="error">{errorMessage(error)}</Alert>}
      {!isLoadingAgendamentos && !isError && fila.length === 0 && (
        <Typography>Nenhum cliente na fila de hoje.</Typography>
      )}

      {fila.length > 0 && (
        <List disablePadding>
          {fila.map((agendamento, indice) => (
            <ListItem
              key={agendamento.id}
              divider
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    aria-label="Mover para cima"
                    size="small"
                    disabled={indice === 0 || reordenarMutation.isPending}
                    onClick={() => handleMover(indice, -1)}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Mover para baixo"
                    size="small"
                    disabled={indice === fila.length - 1 || reordenarMutation.isPending}
                    onClick={() => handleMover(indice, 1)}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Remover da fila"
                    size="small"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleRemover(agendamento.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={`${agendamento.horaInicio}–${agendamento.horaFim} — ${nomeDoCliente(agendamento.idCliente, agendamento.nomeClienteAvulso)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
