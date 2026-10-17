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

// Schema para criação de Atualizações do Festival (Hub)
export const FestivalUpdateFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["speaker", "show", "release", "world", "logistics"], {
    message: "Tipo de atualização inválido."
  }),
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter no mínimo 3 caracteres.")
    .max(150, "O título não pode passar de 150 caracteres."),
  world: z
    .string()
    .trim()
    .min(2, "Selecione o mundo ou espaço relacionado.")
    .max(100, "Nome do mundo muito longo."),
  dateOrTime: z.string().trim().max(100).optional(),
  summary: z
    .string()
    .trim()
    .min(10, "O resumo / detalhes deve ter no mínimo 10 caracteres para orientar a IA.")
    .max(2000, "O resumo não pode ultrapassar 2.000 caracteres.")
});

export type FestivalUpdateFormValues = z.infer<typeof FestivalUpdateFormSchema>;

// Regras para upload de planilha .xlsx
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes
export const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];
