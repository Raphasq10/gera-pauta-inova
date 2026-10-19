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

// Schema da Feature 3: Painel de Briefing e Ideia Inicial do Conteudista
export const BriefingFormSchema = z.object({
  personaId: z
    .string()
    .trim()
    .min(1, "Selecione obrigatoriamente a persona-alvo do conteúdo."),
  updateId: z.string().trim().default("none"),
  channel: z.enum(["instagram", "linkedin", "whatsapp"], {
    message: "Canal inválido selecionado."
  }),
  weeklyTheme: z.enum(["terca-futuro", "quarta-ciencia", "quinta-b2b", "sexta-lazer", "livre"], {
    message: "Dia da grade semanal inválido."
  }).default("livre"),
  pitchCount: z
    .number()
    .int("A quantidade deve ser um número inteiro.")
    .min(1, "Gere no mínimo 1 pauta.")
    .max(5, "O limite máximo por lote é de 5 pautas."),
  initialIdea: z
    .string()
    .trim()
    .max(800, "A ideia inicial não pode ultrapassar 800 caracteres.")
    .optional()
    .or(z.literal(""))
});

export type BriefingFormValues = z.infer<typeof BriefingFormSchema>;

// Schema da Feature 4: Requisição para o Orquestrador de IA
export const GeneratePitchesRequestSchema = z.object({
  personaId: z.string().trim().min(1, "A persona é obrigatória."),
  updateId: z.string().trim().default("none"),
  channel: z.enum(["instagram", "linkedin", "whatsapp"], {
    message: "Canal inválido."
  }),
  weeklyTheme: z.enum(["terca-futuro", "quarta-ciencia", "quinta-b2b", "sexta-lazer", "livre"]).default("livre"),
  pitchCount: z.number().int().min(1).max(5),
  initialIdea: z.string().trim().max(800).optional().or(z.literal("")),
  userApiKey: z.string().trim().max(200).optional()
});

export type GeneratePitchesRequestValues = z.infer<typeof GeneratePitchesRequestSchema>;

// Schema da Feature 5: Estrutura de Pauta & Versionamento no Histórico
export const PitchVersionHistorySchema = z.object({
  version: z.number().int().min(1),
  mote: z.string().trim().max(1000),
  headlineArte: z.string().trim().max(500),
  legenda: z.string().trim().max(5000),
  formato: z.string().trim().max(200),
  changeNote: z.string().trim().max(1000).optional()
});

export const PitchContentSchema = z.object({
  id: z.string().trim().min(1),
  version: z.number().int().min(1).default(1),
  createdAt: z.string().trim().max(100),
  personaId: z.string().trim().min(1),
  personaName: z.string().trim().max(200),
  updateTitle: z.string().trim().max(200).optional(),
  initialIdea: z.string().trim().max(800).optional(),
  channel: z.string().trim().max(100),
  mote: z.string().trim().min(5).max(1000),
  headlineArte: z.string().trim().min(3).max(500),
  legenda: z.string().trim().min(10).max(5000),
  formato: z.string().trim().min(2).max(200),
  justificativaFormato: z.string().trim().min(5).max(2000),
  previousVersions: z.array(PitchVersionHistorySchema).optional()
});

export type PitchContentValues = z.infer<typeof PitchContentSchema>;

// Schema da Feature 5: Requisição para Refinar / Ajustar Pauta Específica
export const RefinePitchRequestSchema = z.object({
  pitchId: z.string().trim().min(1, "O ID da pauta é obrigatório."),
  instruction: z.string().trim().max(600, "A instrução não pode ultrapassar 600 caracteres.").optional().or(z.literal("")),
  format: z.string().trim().max(100).default("manter"),
  tone: z.string().trim().max(100).default("manter"),
  userApiKey: z.string().trim().max(200).optional()
});

export type RefinePitchRequestValues = z.infer<typeof RefinePitchRequestSchema>;

// Regras para upload de planilha .xlsx
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes
export const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];
