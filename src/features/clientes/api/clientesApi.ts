import { jsonBody, jsonHeaders, request } from '../../../lib/http/httpClient'
import type { Cliente, CreateClienteInput, UpdateClienteInput } from '../types'

export function listClientes(signal?: AbortSignal): Promise<Cliente[]> {
  return request<Cliente[]>('/clientes', { signal })
}

export function getCliente(id: number, signal?: AbortSignal): Promise<Cliente> {
  return request<Cliente>(`/clientes/${id}`, { signal })
}

export function createCliente(input: CreateClienteInput): Promise<Cliente> {
  return request<Cliente>('/clientes', {
    method: 'POST',
    headers: jsonHeaders,
    body: jsonBody(input),
  })
}

export function updateCliente(id: number, input: UpdateClienteInput): Promise<Cliente> {
  return request<Cliente>(`/clientes/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: jsonBody(input),
  })
}

export function deleteCliente(id: number): Promise<void> {
  return request<void>(`/clientes/${id}`, { method: 'DELETE' })
}
