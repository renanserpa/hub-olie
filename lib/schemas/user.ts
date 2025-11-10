import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email({ message: "Formato de e-mail inválido." }),
  role: z.enum(['AdminGeral', 'Administrativo', 'Producao', 'Vendas', 'Financeiro', 'Conteudo'], {
      required_error: "A função é obrigatória."
  }),
  // Password validation only for creation form
  password: z.string().min(8, { message: "A senha deve ter no mínimo 8 caracteres." }).optional(),
});
