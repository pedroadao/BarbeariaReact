import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCliente,
  deleteCliente,
  listClientes,
  updateCliente,
} from '../api/clientesApi'
import type { CreateClienteInput, UpdateClienteInput } from '../types'

const clientesKey = ['clientes'] as const

export function useClientes() {
  return useQuery({
    queryKey: clientesKey,
    queryFn: ({ signal }) => listClientes(signal),
  })
}

export function useCreateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateClienteInput) => createCliente(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientesKey })
    },
  })
}

export function useUpdateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateClienteInput }) =>
      updateCliente(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientesKey })
    },
  })
}

export function useDeleteCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clientesKey })
    },
  })
}
