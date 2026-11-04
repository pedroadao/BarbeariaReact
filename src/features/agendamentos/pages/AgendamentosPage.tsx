import { useMemo, useState } from 'react'
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
    <section>
      <h1>Agendamentos</h1>
      <p>
        Cada registro é um horário do barbeiro. Associe um cliente ao criar para reservar o horário,
        ou deixe sem cliente para marcá-lo como disponível.
      </p>

      <h2>Novo horário disponível</h2>
      <AgendamentoForm isSubmitting={createMutation.isPending} onSubmit={handleCreate} />
      {createMutation.isError && <p role="alert">{errorMessage(createMutation.error)}</p>}

      <h2>Agenda dos barbeiros</h2>
      {!isLoading && !isError && (
        <AgendamentosCalendar
          agendamentos={agendamentos ?? []}
          barbeiros={barbeiros ?? []}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      <h2>Lista de horários</h2>
      {isLoading && <p>Carregando agendamentos...</p>}
      {isError && <p role="alert">{errorMessage(error)}</p>}
      {selectedDate && (
        <p>
          Filtrando por {selectedDate}.{' '}
          <button type="button" onClick={() => setSelectedDate(null)}>
            Limpar filtro
          </button>
        </p>
      )}
      {!isLoading && !isError && agendamentosExibidos?.length === 0 && (
        <p>{selectedDate ? 'Nenhum horário cadastrado para esta data.' : 'Nenhum horário cadastrado.'}</p>
      )}

      {agendamentosExibidos && agendamentosExibidos.length > 0 && (
        <ul>
          {agendamentosExibidos.map((agendamento) => (
            <li key={agendamento.id}>
              <span>
                {nomeBarbeiro(agendamento.idBarbeiro)} — {agendamento.data} {agendamento.horaInicio}–
                {agendamento.horaFim} —{' '}
                {agendamento.disponivel
                  ? 'Disponível'
                  : `Reservado (${nomeCliente(agendamento.idCliente as number)})`}
              </span>
              <button type="button" onClick={() => handleDelete(agendamento.id)} disabled={deleteMutation.isPending}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
      {deleteMutation.isError && <p role="alert">{errorMessage(deleteMutation.error)}</p>}
    </section>
  )
}
