export interface LoginInput {
  email: string
  senha: string
}

export interface RegisterInput {
  email: string
  nome: string
  senha: string
}

export interface Me {
  id: string
  email: string
  name: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
}
