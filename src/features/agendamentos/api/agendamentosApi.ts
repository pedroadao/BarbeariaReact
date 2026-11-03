import { jsonBody, jsonHeaders, request } from '../../../lib/http/httpClient'
import type { Agendamento, CreateAgendamentoInput } from '../types'

export function listAgendamentos(signal?: AbortSignal): Promise<Agendamento[]> {
  return request<Agendamento[]>('/agendamentos', { signal })
}

export function getAgendamento(id: number, signal?: AbortSignal): Promise<Agendamento> {
  return request<Agendamento>(`/agendamentos/${id}`, { signal })
}

export function createAgendamento(input: CreateAgendamentoInput): Promise<Agendamento> {
  return request<Agendamento>('/agendamentos', {
    method: 'POST',
    headers: jsonHeaders,
    body: jsonBody(input),
  })
}

export function deleteAgendamento(id: number): Promise<void> {
  return request<void>(`/agendamentos/${id}`, { method: 'DELETE' })
}
