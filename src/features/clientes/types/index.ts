export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  instagram: string | null
  dataNascimento: string
  idTipoUsuario: number
}

export interface CreateClienteInput {
  nome: string
  email: string
  telefone: string
  instagram?: string | null
  dataNascimento: string
  idTipoUsuario: number
}

export type UpdateClienteInput = CreateClienteInput
