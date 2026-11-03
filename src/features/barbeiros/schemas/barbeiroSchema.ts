import { z } from 'zod'

export const barbeiroFormSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  email: z.string().email('Informe um e-mail válido.'),
  telefone: z.string().min(1, 'Informe o telefone.'),
  instagram: z.string().optional(),
  dataNascimento: z.string().min(1, 'Informe a data de nascimento.'),
})

export type BarbeiroFormValues = z.infer<typeof barbeiroFormSchema>
