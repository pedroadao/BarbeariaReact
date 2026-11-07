import { describe, expect, it } from 'vitest'
import { barbeiroFormSchema } from './barbeiroSchema'

describe('barbeiroFormSchema', () => {
  it('aceita dados válidos', () => {
    const result = barbeiroFormSchema.safeParse({
      nome: 'João',
      email: 'joao@teste.com',
      telefone: '+55 (11) 99999-0000',
      instagram: '',
      dataNascimento: '1990-01-01',
      idTipoUsuario: 1,
    })

    expect(result.success).toBe(true)
  })

  it('rejeita e-mail inválido', () => {
    const result = barbeiroFormSchema.safeParse({
      nome: 'João',
      email: 'não-é-email',
      telefone: '+55 (11) 99999-0000',
      dataNascimento: '1990-01-01',
      idTipoUsuario: 1,
    })

    expect(result.success).toBe(false)
  })

  it('rejeita nome vazio', () => {
    const result = barbeiroFormSchema.safeParse({
      nome: '',
      email: 'joao@teste.com',
      telefone: '+55 (11) 99999-0000',
      dataNascimento: '1990-01-01',
      idTipoUsuario: 1,
    })

    expect(result.success).toBe(false)
  })
})
