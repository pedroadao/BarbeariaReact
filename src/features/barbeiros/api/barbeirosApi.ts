import { jsonBody, jsonHeaders, request } from '../../../lib/http/httpClient'
import type { Barbeiro, CreateBarbeiroInput, UpdateBarbeiroInput } from '../types'

export function listBarbeiros(signal?: AbortSignal): Promise<Barbeiro[]> {
  return request<Barbeiro[]>('/barbeiros', { signal })
}

export function getBarbeiro(id: number, signal?: AbortSignal): Promise<Barbeiro> {
  return request<Barbeiro>(`/barbeiros/${id}`, { signal })
}

export function createBarbeiro(input: CreateBarbeiroInput): Promise<Barbeiro> {
  return request<Barbeiro>('/barbeiros', {
    method: 'POST',
    headers: jsonHeaders,
    body: jsonBody(input),
  })
}

export function updateBarbeiro(id: number, input: UpdateBarbeiroInput): Promise<Barbeiro> {
  return request<Barbeiro>(`/barbeiros/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: jsonBody(input),
  })
}

export function deleteBarbeiro(id: number): Promise<void> {
  return request<void>(`/barbeiros/${id}`, { method: 'DELETE' })
}
