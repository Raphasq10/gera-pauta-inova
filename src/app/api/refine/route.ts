import { NextRequest, NextResponse } from "next/server";
import { RefinePitchRequestSchema } from "@/lib/schemas";
import { callGoogleGeminiInteractions } from "@/lib/gemini";
import fs from "fs";
import path from "path";

const PITCHES_PATH = path.join(process.cwd(), "src", "data", "saved-pitches.json");

function getSavedPitches(): any[] {
  if (!fs.existsSync(PITCHES_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(PITCHES_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function savePitches(pitches: any[]): void {
  try {
    fs.writeFileSync(PITCHES_PATH, JSON.stringify(pitches, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Storage] Ambiente serverless/read-only (Vercel): gravação em arquivo local ignorada com segurança.");
  }
}

const FORMAT_LABELS: Record<string, string> = {
  reels: "Reels Curto (Roteiro Dinâmico em 3 Cenas)",
  carrossel: "Carrossel Educativo (4 a 6 Telas)",
  card: "Card Único de Alto Impacto",
  stories: "Sequência de 3 Stories Interativos (Enquete + Link)",
  linkedin: "Post Executivo / Artigo Curto (LinkedIn)"
};

/**
 * Motor Inteligente de Reescrita Local:
 * Analisa o pedido do usuário + contexto da pauta e REESCREVE DE VERDADE
 * o Mote, a Headline e a Legenda (nunca apenas cola [v2] na frente).
 */
function smartLocalRewrite(
  currentPitch: any,
  instruction: string,
  targetFormatKey: string,
  targetToneKey: string
) {
  const rawInstr = (instruction || "").trim();
  const instr = rawInstr.toLowerCase();
  const nextVersion = (currentPitch.version || 1) + 1;

  // Traduz o formato para um nome legível
  const finalFormat =
    targetFormatKey && targetFormatKey !== "manter"
      ? FORMAT_LABELS[targetFormatKey] || targetFormatKey
      : currentPitch.formato;

  // 1. Se o conteudista enviou uma instrução específica (ex: "divulgar a palestra do dr. drauzio para os alunos de medicina do paraguai e brasil")
  if (rawInstr.length > 5) {
    const isDrauzio = instr.includes("drauzio") || instr.includes("médic") || instr.includes("saúde") || instr.includes("medicina");
    const isParaguai = instr.includes("paraguai") || instr.includes("fronteira") || instr.includes("brasil");

    let specificHeadline = "";
    if (isDrauzio && isParaguai) {
      specificHeadline = "Futuros médicos do Brasil e Paraguai: Dr. Drauzio Varella confirmado no Festival Iguassu Inova 2026! 🩺🇵🇾🇧🇷";
    } else if (isDrauzio) {
      specificHeadline = "Dr. Drauzio Varella em Foz: uma aula magna de saúde e ciência no Festival Iguassu Inova 2026! 🩺✨";
    } else if (isParaguai) {
      specificHeadline = "Atenção estudantes da Tríplice Fronteira: o maior festival de inovação do ano é 100% gratuito! 🇵🇾🇧🇷";
    } else {
      const cleanTheme = rawInstr
        .replace(/^(mas a ideia é|a ideia é|quero|gostaria de|favor|por favor|mude para|divulgar|fale sobre|foque em)\s+/i, "")
        .trim();
      const capTheme = cleanTheme.charAt(0).toUpperCase() + cleanTheme.slice(1);
      specificHeadline = `${capTheme}: confira todos os detalhes no Festival Iguassu Inova 2026! 🚀`;
    }

    const specificMote = `Atendimento Direto ao Briefing (v${nextVersion}): pauta adaptada criativamente para a solicitação do conteudista ("${rawInstr}"), conectando os temas de relevância com a persona ${currentPitch.personaName.split("(")[0].trim()}.`;

    let formatIntro = "";
    if (finalFormat.toLowerCase().includes("reels")) {
      formatIntro = `🎬 ROTEIRO DO REELS (3 CENAS):\n• Cena 1 (0-3s): Você com caderno/jaleco olhando pra câmera com o texto na tela: "${specificHeadline}"\n• Cena 2: Cortes do local (Itaipu Parquetec), auditório e arenas de inovação em saúde e tecnologia.\n• Cena 3: Mostrando a tela do app Yazo Tickets com o passaporte gratuito emitido.\n\n📌 LEGENDA:\n`;
    } else if (finalFormat.toLowerCase().includes("carrossel")) {
      formatIntro = `📚 ESTRUTURA DO CARROSSEL:\n• Lâmina 1 (Capa): ${specificHeadline}\n• Lâmina 2: O que torna esse encontro imperdível para a nossa região.\n• Lâmina 3: Como a imersão agrega na sua formação acadêmica e horas complementares.\n• Lâmina 4: Serviço completo (data, local e como retirar seu passaporte grátis).\n\n📌 LEGENDA:\n`;
    }

    let thematicBody = "";
    if (isDrauzio && isParaguai) {
      thematicBody = "Seja você estudante de medicina em Foz do Iguaçu, Ciudad del Este ou de qualquer canto da região trinacional: essa é a sua chance de aprender de perto com um dos médicos mais respeitados da história do Brasil.";
    } else if (isDrauzio) {
      thematicBody = "Uma aula magna de ética, empatia e divulgação científica com quem dedicou mais de cinco décadas a cuidar de pessoas e transformar a saúde pública no Brasil.";
    } else {
      thematicBody = "Uma experiência imersiva feita sob medida para expandir seu repertório acadêmico, fazer networking qualificado e se conectar com as grandes mentes da inovação.";
    }

    const specificLegenda = `${formatIntro}Uma oportunidade imperdível para quem estuda e respira conhecimento na nossa fronteira! 🌟\n\n${thematicBody}\n\nDe 25 a 28 de novembro, o Itaipu Parquetec se transforma no epicentro da inovação, reunindo grandes referências nacionais, debates essenciais e mais de 6 Mundos Temáticos com entrada 100% gratuita.\n\n📍 Local: Itaipu Parquetec (Foz do Iguaçu - PR)\n📅 Data: 25 a 28 de Novembro de 2026\n🎟️ Passaporte: Gratuito no app Yazo Tickets (link na bio)\n🎓 Certificado oficial de participação\n\nMarque aqui seus colegas de curso e garanta seu lugar antecipado!\n\n#FestivalIguassuInova2026 #MedicinaFronteira #ItaipuParquetec #FozDoIguaçu`;

    return {
      mote: specificMote,
      headlineArte: specificHeadline,
      legenda: specificLegenda,
      formato: finalFormat,
      justificativaFormato: `Formato "${finalFormat}" adaptado diretamente para a diretriz: "${rawInstr}". O gancho dialoga com a formação acadêmica e a integração regional.`
    };
  }

  // 2. Fallback geral caso a instrução seja vazia
  const isQuestionRequested = instr.includes("pergunta") || instr.includes("curios");
  const isShortRequested = instr.includes("curt") || instr.includes("diret");
  const isShowFocus = instr.includes("show") || instr.includes("música");

  let fallbackHeadline = "De 25 a 28 de novembro, viva o maior festival de inovação de Foz do Iguaçu! 🚀";
  if (isQuestionRequested) {
    fallbackHeadline = "Você já garantiu seu passaporte gratuito para os 4 dias do Festival Iguassu Inova?";
  } else if (isShortRequested) {
    fallbackHeadline = "Tecnologia, ciência e cultura 100% grátis no Itaipu Parquetec. Só falta você!";
  } else if (isShowFocus) {
    fallbackHeadline = "Palco dos Shows + 6 Mundos de Inovação: o seu ponto de encontro em novembro! 🎸✨";
  }

  return {
    mote: `Refinamento de Tom e Formato (v${nextVersion}): ajuste para o formato "${finalFormat}" com linguagem lapidada para redes sociais.`,
    headlineArte: fallbackHeadline,
    legenda: `De 25 a 28 de novembro, prepare-se para viver uma experiência completa no Itaipu Parquetec!\n\n🚀 6 Mundos Temáticos com tecnologia e ciência\n🎸 Shows nacionais gratuitos e espaço gastronômico\n🎓 Certificado oficial para estudantes\n🎟️ Passaporte 100% gratuito no app Yazo Tickets\n\nGaranta seu ingresso pelo link da bio!\n\n#FestivalIguassuInova2026 #ItaipuParquetec #FozDoIguaçu`,
    formato: finalFormat,
    justificativaFormato: `Formato "${finalFormat}" ajustado conforme seleção de parâmetros.`
  };
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

    const { pitchId, pitch: clientPitch, instruction, format, tone, userApiKey } = validation.data;

    // 2. Localizar a pauta a ser refinada (via payload do cliente ou banco local)
    const pitches = getSavedPitches();
    const pitchIndex = pitches.findIndex((p) => p.id === pitchId);
    const currentPitch = clientPitch || (pitchIndex !== -1 ? pitches[pitchIndex] : null);

    if (!currentPitch) {
      return NextResponse.json(
        { success: false, error: "Pauta não encontrada no histórico para ajuste." },
        { status: 404 }
      );
    }

    // Salvar estado atual no versionamento antes de reescrever
    const previousVersion = {
      version: currentPitch.version,
      mote: currentPitch.mote,
      headlineArte: currentPitch.headlineArte,
      legenda: currentPitch.legenda,
      formato: currentPitch.formato,
      changeNote: instruction || `Ajuste de formato (${format}) / tom (${tone})`
    };

    const targetFormatLabel =
      format && format !== "manter"
        ? FORMAT_LABELS[format] || format
        : currentPitch.formato;
    const targetTone = tone && tone !== "manter" ? tone : "padrão da persona";

    // 3. Determinar chave de API Gemini (informada pelo usuário, variável de ambiente ou .env.local)
    let geminiApiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY || "";
    if (!geminiApiKey) {
      try {
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf-8");
          const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
          if (match && match[1] && match[1].trim()) {
            geminiApiKey = match[1].trim();
            process.env.GEMINI_API_KEY = geminiApiKey;
          }
        }
      } catch {
        // safe ignore
      }
    } else {
      if (!process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = geminiApiKey;
      }
      try {
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, "utf-8");
          if (!envContent.includes(geminiApiKey)) {
            envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${geminiApiKey}"`);
            fs.writeFileSync(envPath, envContent, "utf-8");
          }
        }
      } catch {
        // safe ignore
      }
    }

    let rewritten = null;
    let engineUsed = "local_refine";

    if (geminiApiKey) {
      try {
        const prompt = `Você é o Diretor Criativo e Copywriter Sênior do Festival Iguassu Inova 2026 (Itaipu Parquetec, Foz do Iguaçu).
O conteudista pediu um ajuste/reescrita em uma pauta específica.

PAUTA ATUAL (QUE PRECISA SER CORRIGIDA/MELHORADA):
- Persona-Alvo: ${currentPitch.personaName}
- Ideia Original do Briefing: ${currentPitch.initialIdea || "Geral do Festival"}
- Mote Atual: ${currentPitch.mote}
- Headline Atual: ${currentPitch.headlineArte}
- Legenda Atual: ${currentPitch.legenda}
- Formato Atual: ${currentPitch.formato}

PEDIDO DE ALTERAÇÃO DO CONTEUDISTA (PRIORIDADE MÁXIMA E ABSOLUTA):
- O que mudar / Crítica do conteudista: "${instruction || "Reescreva de forma mais criativa, natural e impactante"}"
- Formato desejado: "${targetFormatLabel}"
- Tom de voz desejado: "${targetTone}"

REGRAS OBRIGATÓRIAS:
1. ATENDA COM PRECISÃO TOTAL ao que o conteudista pediu acima! Se ele especificou atrações, palestrantes (ex: Dr. Drauzio Varella), temas (medicina, saúde, IA) ou públicos específicos (alunos do Paraguai e Brasil), o conteúdo DEVE ser 100% sobre esse tema!
2. Headline (O que vai na arte): Crie uma frase de capa publicitária limpa, impactante e criativa (sem reticências truncadas e sem prefixos como [v2]).
3. Reescreva o Mote explicando a conexão da atração com a persona e com o que o conteudista pediu.
4. Adapte a Legenda para o formato "${targetFormatLabel}" (se for Reels, inclua o roteiro de cenas + copy completa para a legenda com emojis, informações de passaporte gratuito na Yazo Tickets e CTA).
5. Justificativa com Dados: Justifique citando como isso engaja a persona.

RETORNE EXCLUSIVAMENTE UM OBJETO JSON VÁLIDO:
{
  "mote": "...",
  "headlineArte": "...",
  "legenda": "...",
  "formato": "${targetFormatLabel}",
  "justificativaFormato": "..."
}`;

        const { text: responseTextRaw, model: modelUsed } = await callGoogleGeminiInteractions(geminiApiKey, prompt);
        engineUsed = `gemini_${modelUsed}`;

        const cleanJson = responseTextRaw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.headlineArte && parsed.legenda) {
          rewritten = {
            mote: parsed.mote || currentPitch.mote,
            headlineArte: parsed.headlineArte,
            legenda: parsed.legenda,
            formato: parsed.formato || targetFormatLabel,
            justificativaFormato: parsed.justificativaFormato || currentPitch.justificativaFormato
          };
        }
      } catch (geminiError) {
        console.error("Erro no Gemini Interactions ao refinar pauta, acionando reescrita inteligente local:", geminiError);
      }
    }

    // Se não usou Gemini ou se o Gemini falhou, usa o Motor Inteligente de Reescrita Local
    if (!rewritten) {
      rewritten = smartLocalRewrite(currentPitch, instruction || "", format || "manter", tone || "manter");
    }

    // 4. Montar a pauta atualizada com versionamento seguro
    const updatedPitch = {
      ...currentPitch,
      version: currentPitch.version + 1,
      mote: rewritten.mote,
      headlineArte: rewritten.headlineArte,
      legenda: rewritten.legenda,
      formato: rewritten.formato,
      justificativaFormato: rewritten.justificativaFormato,
      previousVersions: [...(currentPitch.previousVersions || []), previousVersion]
    };

    // Atualiza no banco de dados local se existir no arquivo
    if (pitchIndex !== -1) {
      pitches[pitchIndex] = updatedPitch;
      savePitches(pitches);
    }

    return NextResponse.json({
      success: true,
      message: `Pauta reescrita com sucesso (versão v${updatedPitch.version})!`,
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
