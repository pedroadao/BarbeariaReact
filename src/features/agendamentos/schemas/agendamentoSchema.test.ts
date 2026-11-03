import { describe, expect, it } from 'vitest'
import { agendamentoFormSchema } from './agendamentoSchema'

describe('agendamentoFormSchema', () => {
  it('aceita dados válidos', () => {
    const result = agendamentoFormSchema.safeParse({
      idBarbeiro: 1,
      data: '2026-11-10',
      horaInicio: '09:00',
      horaFim: '10:00',
    })

    expect(result.success).toBe(true)
  })

  it('rejeita idBarbeiro inválido', () => {
    const result = agendamentoFormSchema.safeParse({
      idBarbeiro: 0,
      data: '2026-11-10',
      horaInicio: '09:00',
      horaFim: '10:00',
    })

    expect(result.success).toBe(false)
  })
})
