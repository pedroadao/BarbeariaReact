import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
