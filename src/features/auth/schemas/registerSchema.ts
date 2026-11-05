import { z } from 'zod'

export const registerFormSchema = z
  .object({
    nome: z.string().min(1, 'Informe o nome.'),
    email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
    senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((values) => values.senha === values.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>
