import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email({ message: "Formato de e-mail inválido." }),
  role: z.enum(['AdminGeral', 'Administrativo', 'Producao', 'Vendas', 'Financeiro', 'Conteudo'] as const),
  // Password validation only for creation form
  password: z.string().min(1, { message: "A senha não pode estar em branco." }).optional(),
});