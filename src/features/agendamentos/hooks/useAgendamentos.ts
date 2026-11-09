import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adicionarClienteAvulso,
  createAgendamento,
  deleteAgendamento,
  listAgendamentos,
  reordenarFila,
} from '../api/agendamentosApi'
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

export function useAdicionarClienteAvulso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ idBarbeiro, nomeCliente }: { idBarbeiro: number; nomeCliente: string }) =>
      adicionarClienteAvulso(idBarbeiro, nomeCliente),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agendamentosKey })
    },
  })
}

export function useReordenarFila() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ idBarbeiro, data, idsEmOrdem }: { idBarbeiro: number; data: string; idsEmOrdem: number[] }) =>
      reordenarFila(idBarbeiro, data, idsEmOrdem),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agendamentosKey })
    },
  })
}
