import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useBarbeiros } from '../../barbeiros/hooks/useBarbeiros'
import { useClientes } from '../../clientes/hooks/useClientes'
import { agendamentoFormSchema, type AgendamentoFormValues } from '../schemas/agendamentoSchema'

interface AgendamentoFormProps {
  isSubmitting: boolean
  onSubmit: (values: AgendamentoFormValues) => void
}

export function AgendamentoForm({ isSubmitting, onSubmit }: AgendamentoFormProps) {
  const { data: barbeiros } = useBarbeiros()
  const { data: clientes } = useClientes()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoFormSchema),
    defaultValues: { idBarbeiro: 0, idCliente: undefined, data: '', horaInicio: '', horaFim: '' },
  })

  function submit(values: AgendamentoFormValues) {
    onSubmit(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label htmlFor="agendamento-barbeiro">Barbeiro</label>
        <select id="agendamento-barbeiro" {...register('idBarbeiro', { valueAsNumber: true })}>
          <option value={0}>Selecione um barbeiro</option>
          {barbeiros?.map((barbeiro) => (
            <option key={barbeiro.id} value={barbeiro.id}>
              {barbeiro.nome}
            </option>
          ))}
        </select>
        {errors.idBarbeiro && <p role="alert">{errors.idBarbeiro.message}</p>}
      </div>

      <div>
        <label htmlFor="agendamento-cliente">Cliente</label>
        <select
          id="agendamento-cliente"
          {...register('idCliente', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
        >
          <option value="">Sem cliente</option>
          {clientes?.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
        {errors.idCliente && <p role="alert">{errors.idCliente.message}</p>}
      </div>

      <div>
        <label htmlFor="agendamento-data">Data</label>
        <input id="agendamento-data" type="date" {...register('data')} />
        {errors.data && <p role="alert">{errors.data.message}</p>}
      </div>

      <div>
        <label htmlFor="agendamento-inicio">Hora de início</label>
        <input id="agendamento-inicio" type="time" {...register('horaInicio')} />
        {errors.horaInicio && <p role="alert">{errors.horaInicio.message}</p>}
      </div>

      <div>
        <label htmlFor="agendamento-fim">Hora de término</label>
        <input id="agendamento-fim" type="time" {...register('horaFim')} />
        {errors.horaFim && <p role="alert">{errors.horaFim.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Criar horário disponível'}
      </button>
    </form>
  )
}
