import { describe, expect, it } from 'vitest'
import { clienteFormSchema } from './clienteSchema'

describe('clienteFormSchema', () => {
  it('aceita dados válidos', () => {
    const result = clienteFormSchema.safeParse({
      nome: 'Maria',
      email: 'maria@teste.com',
      telefone: '11988880000',
      instagram: '',
      dataNascimento: '1992-02-02',
      idTipoUsuario: 2,
    })

    expect(result.success).toBe(true)
  })

  it('rejeita telefone vazio', () => {
    const result = clienteFormSchema.safeParse({
      nome: 'Maria',
      email: 'maria@teste.com',
      telefone: '',
      dataNascimento: '1992-02-02',
      idTipoUsuario: 2,
    })

    expect(result.success).toBe(false)
  })
})
