import { z } from "zod";

// Schema para criação e edição de Persona
export const PersonaFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, "O nome deve ter no mínimo 3 caracteres.")
    .max(100, "O nome não pode passar de 100 caracteres."),
  role: z
    .string()
    .trim()
    .min(3, "A descrição do perfil deve ter no mínimo 3 caracteres.")
    .max(150, "A descrição não pode passar de 150 caracteres."),
  category: z.enum(["professores", "alunos", "comunidade", "empresarios", "outros"], {
    message: "Categoria inválida."
  }),
  keyPain: z
    .string()
    .trim()
    .min(5, "A dor principal deve ter no mínimo 5 caracteres.")
    .max(500, "A dor não pode passar de 500 caracteres."),
  tone: z
    .string()
    .trim()
    .min(3, "O tom de voz deve ter no mínimo 3 caracteres.")
    .max(200, "O tom de voz não pode passar de 200 caracteres."),
  suggestedFormats: z
    .array(z.string().trim().max(100))
    .min(1, "Adicione pelo menos um formato sugerido.")
    .max(10, "No máximo 10 formatos sugeridos.")
});

export type PersonaFormValues = z.infer<typeof PersonaFormSchema>;

// Regras para upload de planilha .xlsx
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes
export const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];
