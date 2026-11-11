import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { HttpError } from '../../../lib/http/httpClient'
import { useAuth } from '../../../lib/auth/useAuth'
import { isAdmin } from '../../../lib/auth/roles'
import { useBarbeiros, useMeBarbeiro } from '../../barbeiros/hooks/useBarbeiros'
import { useClientes } from '../../clientes/hooks/useClientes'
import { useAgendamentos } from '../../agendamentos/hooks/useAgendamentos'

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message
  return 'Ocorreu um erro inesperado.'
}

function hoje(): string {
  const data = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

export function ConsultaFilaPage() {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const { data: barbeiroLogado, isLoading: isLoadingMeBarbeiro } = useMeBarbeiro()
  const { data: barbeiros, isLoading: isLoadingBarbeiros } = useBarbeiros()
  const { data: agendamentos, isLoading: isLoadingAgendamentos, isError, error } = useAgendamentos()
  const { data: clientes } = useClientes()
  const [idBarbeiro, setIdBarbeiro] = useState<number | ''>('')

  const fila = useMemo(() => {
    if (!agendamentos || idBarbeiro === '') return []
    const data = hoje()
    return agendamentos
      .filter(
        (agendamento) => agendamento.idBarbeiro === idBarbeiro && agendamento.data === data && !agendamento.disponivel,
      )
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }, [agendamentos, idBarbeiro])

  function nomeDoCliente(idCliente: number | null, nomeClienteAvulso: string | null): string {
    if (nomeClienteAvulso) return nomeClienteAvulso
    if (idCliente) return clientes?.find((cliente) => cliente.id === idCliente)?.nome ?? `Cliente #${idCliente}`
    return 'Cliente'
  }

  function handleChangeBarbeiro(event: SelectChangeEvent<number | ''>) {
    setIdBarbeiro(event.target.value === '' ? '' : Number(event.target.value))
  }

  if (isLoadingMeBarbeiro) {
    return <Typography>Carregando...</Typography>
  }

  if (admin || barbeiroLogado) {
    return <Alert severity="error">Esta área é exclusiva para clientes.</Alert>
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Fila dos barbeiros
      </Typography>
      <Typography color="text.secondary">
        Escolha um barbeiro para ver a fila de atendimento de hoje.
      </Typography>

      <FormControl sx={{ maxWidth: 320 }}>
        <InputLabel id="filtro-barbeiro-label">Barbeiro</InputLabel>
        <Select
          labelId="filtro-barbeiro-label"
          label="Barbeiro"
          value={idBarbeiro}
          onChange={handleChangeBarbeiro}
          disabled={isLoadingBarbeiros}
        >
          {barbeiros?.map((barbeiro) => (
            <MenuItem key={barbeiro.id} value={barbeiro.id}>
              {barbeiro.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isError && <Alert severity="error">{errorMessage(error)}</Alert>}

      {idBarbeiro === '' && <Typography>Selecione um barbeiro para ver a fila.</Typography>}

      {idBarbeiro !== '' && isLoadingAgendamentos && <Typography>Carregando fila...</Typography>}

      {idBarbeiro !== '' && !isLoadingAgendamentos && !isError && fila.length === 0 && (
        <Typography>Nenhum cliente na fila de hoje.</Typography>
      )}

      {fila.length > 0 && (
        <List disablePadding>
          {fila.map((agendamento) => (
            <ListItem key={agendamento.id} divider>
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
