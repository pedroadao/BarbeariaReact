import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCliente,
  deleteCliente,
  getMeCliente,
  listClientes,
  updateCliente,
} from '../api/clientesApi'
import type { Cliente, CreateClienteInput, UpdateClienteInput } from '../types'
import { HttpError } from '../../../lib/http/httpClient'

const clientesKey = ['clientes'] as const
const meClienteKey = ['clientes', 'me'] as const

export function useClientes() {
  return useQuery({
    queryKey: clientesKey,
    queryFn: ({ signal }) => listClientes(signal),
  })
}

export function useMeCliente(enabled: boolean) {
  return useQuery({
    queryKey: meClienteKey,
    queryFn: ({ signal }) => getMeCliente(signal),
    enabled,
    retry: false,
    // 'notFound': usuário ainda não tem cadastro de cliente. 'conflict' (Cliente.ContaDeOutroTipo):
    // usuário autenticado é barbeiro/administrador, não cliente. Ambos são estados esperados e não
    // devem derrubar a árvore de componentes (não há Error Boundary na aplicação).
    throwOnError: (error) =>
      !(error instanceof HttpError && (error.kind === 'notFound' || error.kind === 'conflict')),
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

export function useCompletarCadastro(cliente: Cliente | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateClienteInput) =>
      cliente ? updateCliente(cliente.id, input) : createCliente(input),
    onSuccess: (atualizado) => {
      queryClient.setQueryData(meClienteKey, atualizado)
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
