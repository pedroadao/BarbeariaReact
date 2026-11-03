import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAgendamento, deleteAgendamento, listAgendamentos } from '../api/agendamentosApi'
import type { CreateAgendamentoInput } from '../types'

const agendamentosKey = ['agendamentos'] as const

export function useAgendamentos() {
  return useQuery({
    queryKey: agendamentosKey,
    queryFn: ({ signal }) => listAgendamentos(signal),
  })
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAgendamentoInput) => createAgendamento(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agendamentosKey })
    },
  })
}

export function useDeleteAgendamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAgendamento(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agendamentosKey })
    },
  })
}
