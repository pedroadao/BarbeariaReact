import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useBarbeiros } from '../../barbeiros/hooks/useBarbeiros'
import { useClientes } from '../../clientes/hooks/useClientes'
import { HORARIOS_FIM, HORARIOS_INICIO, proximoHorario } from '../horarios'
import { agendamentoFormSchema, type AgendamentoFormValues } from '../schemas/agendamentoSchema'

interface AgendamentoFormProps {
  isSubmitting: boolean
  onSubmit: (values: AgendamentoFormValues) => void
  showClienteSelect: boolean
  ownClienteId?: number
}

export function AgendamentoForm({
  isSubmitting,
  onSubmit,
  showClienteSelect,
  ownClienteId,
}: AgendamentoFormProps) {
  const { data: barbeiros } = useBarbeiros()
  const { data: clientes } = useClientes()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoFormSchema),
    defaultValues: {
      idBarbeiro: 0,
      idCliente: showClienteSelect ? undefined : ownClienteId,
      data: '',
      horaInicio: '',
      horaFim: '',
    },
  })

  useEffect(() => {
    if (!showClienteSelect) setValue('idCliente', ownClienteId)
  }, [showClienteSelect, ownClienteId, setValue])

  function submit(values: AgendamentoFormValues) {
    onSubmit(showClienteSelect ? values : { ...values, idCliente: ownClienteId })
    reset({
      idBarbeiro: 0,
      idCliente: showClienteSelect ? undefined : ownClienteId,
      data: '',
      horaInicio: '',
      horaFim: '',
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <TextField
          id="agendamento-barbeiro"
          label="Barbeiro"
          select
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          error={!!errors.idBarbeiro}
          helperText={errors.idBarbeiro?.message}
          {...register('idBarbeiro', { valueAsNumber: true })}
        >
          <option value={0}>Selecione um barbeiro</option>
          {barbeiros?.map((barbeiro) => (
            <option key={barbeiro.id} value={barbeiro.id}>
              {barbeiro.nome}
            </option>
          ))}
        </TextField>

        {showClienteSelect && (
          <TextField
            id="agendamento-cliente"
            label="Cliente"
            select
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
            error={!!errors.idCliente}
            helperText={errors.idCliente?.message}
            {...register('idCliente', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
          >
            <option value="">Sem cliente</option>
            {clientes?.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </TextField>
        )}

        <TextField
          id="agendamento-data"
          label="Data"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.data}
          helperText={errors.data?.message}
          {...register('data')}
        />

        <TextField
          id="agendamento-inicio"
          label="Hora de início"
          select
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          error={!!errors.horaInicio}
          helperText={errors.horaInicio?.message}
          {...register('horaInicio', {
            onChange: (event: ChangeEvent<HTMLSelectElement>) => {
              if (event.target.value) setValue('horaFim', proximoHorario(event.target.value))
            },
          })}
        >
          <option value="">Selecione</option>
          {HORARIOS_INICIO.map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </TextField>

        <TextField
          id="agendamento-fim"
          label="Hora de término"
          select
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
          error={!!errors.horaFim}
          helperText={errors.horaFim?.message}
          {...register('horaFim')}
        >
          <option value="">Selecione</option>
          {HORARIOS_FIM.map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </TextField>

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Criar horário disponível'}
        </Button>
      </Stack>
    </form>
  )
}
