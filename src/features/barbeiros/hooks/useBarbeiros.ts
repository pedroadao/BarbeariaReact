import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HttpError } from '../../../lib/http/httpClient'
import {
  createBarbeiro,
  deleteBarbeiro,
  getMeBarbeiro,
  listBarbeiros,
  updateBarbeiro,
} from '../api/barbeirosApi'
import type { CreateBarbeiroInput, UpdateBarbeiroInput } from '../types'

const barbeirosKey = ['barbeiros'] as const
const meBarbeiroKey = ['barbeiros', 'me'] as const

export function useBarbeiros() {
  return useQuery({
    queryKey: barbeirosKey,
    queryFn: ({ signal }) => listBarbeiros(signal),
  })
}

export function useMeBarbeiro() {
  return useQuery({
    queryKey: meBarbeiroKey,
    queryFn: ({ signal }) => getMeBarbeiro(signal),
    retry: false,
    throwOnError: (error) => !(error instanceof HttpError && error.kind === 'notFound'),
  })
}

export function useCreateBarbeiro() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBarbeiroInput) => createBarbeiro(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: barbeirosKey })
    },
  })
}

export function useUpdateBarbeiro() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateBarbeiroInput }) =>
      updateBarbeiro(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: barbeirosKey })
    },
  })
}

export function useDeleteBarbeiro() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteBarbeiro(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: barbeirosKey })
    },
  })
}
