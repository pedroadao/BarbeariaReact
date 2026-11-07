import { z } from 'zod'

export const completarCadastroFormSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  telefone: z
    .string()
    .min(1, 'Informe o telefone.')
    .regex(/^\+\d{1,3} .+\d$/, 'Informe um telefone válido.'),
  instagram: z.string().optional(),
  dataNascimento: z.string().min(1, 'Informe a data de nascimento.'),
})

export type CompletarCadastroFormValues = z.infer<typeof completarCadastroFormSchema>
