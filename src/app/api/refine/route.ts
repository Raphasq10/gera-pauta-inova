import { NextRequest, NextResponse } from "next/server";
import { RefinePitchRequestSchema } from "@/lib/schemas";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const PITCHES_PATH = path.join(process.cwd(), "src", "data", "saved-pitches.json");
const PERSONAS_PATH = path.join(process.cwd(), "src", "data", "personas-2026.json");

function getSavedPitches(): any[] {
  if (!fs.existsSync(PITCHES_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(PITCHES_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function savePitches(pitches: any[]): void {
  fs.writeFileSync(PITCHES_PATH, JSON.stringify(pitches, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validação com Zod
    const validation = RefinePitchRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados de refinamento inválidos.",
          details: validation.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        },
        { status: 400 }
      );
    }

    const { pitchId, instruction, format, tone, userApiKey } = validation.data;

    // 2. Localizar a pauta a ser refinada no banco de dados local
    const pitches = getSavedPitches();
    const pitchIndex = pitches.findIndex((p) => p.id === pitchId);

    if (pitchIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Pauta não encontrada no histórico para ajuste." },
        { status: 404 }
      );
    }

    const currentPitch = pitches[pitchIndex];

    // Salvar estado atual no versionamento antes de reescrever
    const previousVersion = {
      version: currentPitch.version,
      mote: currentPitch.mote,
      headlineArte: currentPitch.headlineArte,
      legenda: currentPitch.legenda,
      formato: currentPitch.formato,
      changeNote: instruction || `Ajuste de formato para ${format} / tom para ${tone}`
    };

    // Determinar formato e tom finais
    const targetFormat = format && format !== "manter" ? format : currentPitch.formato;
    const targetTone = tone && tone !== "manter" ? tone : "padrão";

    // 3. Determinar chave de API Gemini (informada pelo usuário ou variável de ambiente)
    const geminiApiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY || "";

    let newHeadline = currentPitch.headlineArte;
    let newMote = currentPitch.mote;
    let newLegenda = currentPitch.legenda;
    let newJustificativa = currentPitch.justificativaFormato;
    let engineUsed = "local_refine";

    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const prompt = `Você é um redator sênior e estrategista de conteúdo do Festival Iguassu Inova 2026.
Você deve refazer e aprimorar uma pauta específica para redes sociais conforme a solicitação do conteudista.

DADOS DA PAUTA ATUAL:
- Persona: ${currentPitch.personaName}
- Canal: ${currentPitch.channel}
- Mote Atual: ${currentPitch.mote}
- Headline Atual: ${currentPitch.headlineArte}
- Legenda Atual: ${currentPitch.legenda}
- Formato Atual: ${currentPitch.formato}
- Justificativa Atual: ${currentPitch.justificativaFormato}

SOLICITAÇÃO DE MUDANÇA DO CONTEUDISTA:
- Instrução livre: "${instruction || "Melhorar impacto e engajamento"}"
- Novo Formato solicitado: "${targetFormat}"
- Novo Tom de Voz solicitado: "${targetTone}"

REGRAS:
1. Mote: reescreva o conceito integrando a nova instrução e tom.
2. Headline (O que vai na arte): texto chamativo, magnético e direto.
3. Legenda: copy completa, quebra de objeções (100% gratuito, passaporte Yazo Tickets), hashtags oficiais (#FestivalIguassuInova2026).
4. Formato: deve ser exatamente "${targetFormat}".
5. Justificativa com Dados: mantenha ou reforce a conexão com dados da persona.

RETORNE EXCLUSIVAMENTE UM OBJETO JSON:
{
  "mote": "...",
  "headlineArte": "...",
  "legenda": "...",
  "formato": "${targetFormat}",
  "justificativaFormato": "..."
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.headlineArte && parsed.legenda) {
          newHeadline = parsed.headlineArte;
          newMote = parsed.mote || currentPitch.mote;
          newLegenda = parsed.legenda;
          newJustificativa = parsed.justificativaFormato || currentPitch.justificativaFormato;
          engineUsed = "gemini_refine";
        }
      } catch (geminiError) {
        console.error("Erro no Gemini ao refinar pauta, usando refinamento local:", geminiError);
      }
    }

    // Se o Gemini não foi chamado ou falhou, realiza o refinamento estruturado local
    if (engineUsed === "local_refine") {
      const instructionText = (instruction || "").toLowerCase();
      const isQuestion = instructionText.includes("pergunta") || instructionText.includes("interroga");
      const isShort = instructionText.includes("curt") || instructionText.includes("diret");
      
      if (isQuestion) {
        newHeadline = `Você sabia que o Festival Iguassu Inova 2026 é 100% gratuito no Parquetec?`;
      } else if (isShort) {
        newHeadline = `Inovação gratuita em Foz. Garanta sua vaga no Parquetec.`;
      } else {
        newHeadline = `[v${currentPitch.version + 1}] ${currentPitch.headlineArte}`;
      }

      newMote = `${currentPitch.mote} (Lapidado: ${instruction || `ajuste de tom para ${targetTone}`})`;
      newJustificativa = `${currentPitch.justificativaFormato} [Ajustado para formato ${targetFormat} com foco em ${targetTone}].`;
      
      // Ajusta o início da legenda conforme o tom
      if (targetTone === "descontraido") {
        newLegenda = `Bora que o maior festival de inovação de Foz tá chegando com tudo! 🔥\n\n${currentPitch.legenda.split("\n\n").slice(1).join("\n\n")}`;
      } else if (targetTone === "provocativo") {
        newLegenda = `Se você ainda não garantiu seu ingresso gratuito, está correndo o risco de ficar de fora do maior encontro da Tríplice Fronteira! ⚠️\n\n${currentPitch.legenda.split("\n\n").slice(1).join("\n\n")}`;
      }
    }

    // 4. Montar a pauta atualizada com versionamento seguro
    const updatedPitch = {
      ...currentPitch,
      version: currentPitch.version + 1,
      mote: newMote,
      headlineArte: newHeadline,
      legenda: newLegenda,
      formato: targetFormat,
      justificativaFormato: newJustificativa,
      previousVersions: [...(currentPitch.previousVersions || []), previousVersion]
    };

    // Atualiza no banco de dados local
    pitches[pitchIndex] = updatedPitch;
    savePitches(pitches);

    return NextResponse.json({
      success: true,
      message: `Pauta refinada com sucesso para a versão v${updatedPitch.version}!`,
      engine: engineUsed,
      pitch: updatedPitch
    });
  } catch (error) {
    console.error("Erro interno ao refinar pauta:", error);
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao refinar a pauta." },
      { status: 500 }
    );
  }
}
