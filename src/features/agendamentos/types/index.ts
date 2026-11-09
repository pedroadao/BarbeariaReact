export interface Agendamento {
  id: number
  idBarbeiro: number
  data: string
  horaInicio: string
  horaFim: string
  idCliente: number | null
  disponivel: boolean
  nomeClienteAvulso: string | null
}

export interface CreateAgendamentoInput {
  idBarbeiro: number
  data: string
  horaInicio: string
  horaFim: string
  idCliente?: number | null
}
