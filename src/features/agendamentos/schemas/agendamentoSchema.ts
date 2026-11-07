import { z } from 'zod'
import { HORA_ABERTURA, HORA_FECHAMENTO, INTERVALO_MINUTOS, paraMinutos } from '../horarios'

const horaSchema = z
  .string()
  .min(1, 'Informe o horário.')
  .refine((valor) => paraMinutos(valor) % INTERVALO_MINUTOS === 0, 'Horário deve ser de 30 em 30 minutos.')
  .refine((valor) => paraMinutos(valor) >= paraMinutos(HORA_ABERTURA), `Horário deve ser a partir das ${HORA_ABERTURA}.`)
  .refine((valor) => paraMinutos(valor) <= paraMinutos(HORA_FECHAMENTO), `Horário deve ser até as ${HORA_FECHAMENTO}.`)

export const agendamentoFormSchema = z
  .object({
    idBarbeiro: z.number().int().positive('Informe o barbeiro.'),
    idCliente: z.number().int().positive().optional(),
    data: z.string().min(1, 'Informe a data.'),
    horaInicio: horaSchema,
    horaFim: horaSchema,
  })
  .superRefine((valores, ctx) => {
    if (paraMinutos(valores.horaFim) <= paraMinutos(valores.horaInicio)) {
      ctx.addIssue({
        path: ['horaFim'],
        code: z.ZodIssueCode.custom,
        message: 'Hora de término deve ser depois da hora de início.',
      })
    }
  })

export type AgendamentoFormValues = z.infer<typeof agendamentoFormSchema>
