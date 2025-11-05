import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  document: z.string().optional().or(z.literal('')).refine(
    (doc) => {
        if (!doc) return true; // Optional field is valid if empty
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        return cpfRegex.test(doc) || cnpjRegex.test(doc);
    },
    {
        message: "Formato inválido. Use 000.000.000-00 ou 00.000.000/0000-00.",
    }
  ),
  email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  payment_terms: z.enum(["à vista", "15D", "30D", "45D", "60D"]),
  lead_time_days: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.number().min(0).max(365).nullable()
  ),
  rating: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.number().min(1).max(5).nullable().optional()
  ),
  notes: z.string().max(1000).optional(),
  is_active: z.boolean().default(true),
});