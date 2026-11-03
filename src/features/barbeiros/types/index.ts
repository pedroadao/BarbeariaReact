export interface Barbeiro {
  id: number
  nome: string
  email: string
  telefone: string
  instagram: string | null
  dataNascimento: string
  idTipoUsuario: number
}

export interface CreateBarbeiroInput {
  nome: string
  email: string
  telefone: string
  instagram?: string | null
  dataNascimento: string
  idTipoUsuario: number
}

export type UpdateBarbeiroInput = CreateBarbeiroInput
