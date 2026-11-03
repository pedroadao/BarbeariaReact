import { z } from 'zod'

export const agendamentoFormSchema = z.object({
  idBarbeiro: z.number().int().positive('Informe o barbeiro.'),
  idCliente: z.number().int().positive().optional(),
  data: z.string().min(1, 'Informe a data.'),
  horaInicio: z.string().min(1, 'Informe a hora de início.'),
  horaFim: z.string().min(1, 'Informe a hora de término.'),
})

export type AgendamentoFormValues = z.infer<typeof agendamentoFormSchema>
