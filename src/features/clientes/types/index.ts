export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  instagram: string | null
  dataNascimento: string
  idTipoUsuario: number
  mostrarCadastroSempre: boolean
}

export interface CreateClienteInput {
  nome: string
  email: string
  telefone: string
  instagram?: string | null
  dataNascimento: string
  idTipoUsuario: number
}

export interface UpdateClienteInput extends CreateClienteInput {
  mostrarCadastroSempre: boolean
}
