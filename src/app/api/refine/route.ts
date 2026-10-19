import { NextRequest, NextResponse } from "next/server";
import { RefinePitchRequestSchema } from "@/lib/schemas";
import { GoogleGenAI } from "@google/genai";
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
  fs.writeFileSync(PITCHES_PATH, JSON.stringify(pitches, null, 2), "utf-8");
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
  const instr = (instruction || "").toLowerCase();
  const nextVersion = (currentPitch.version || 1) + 1;

  // Traduz o formato para um nome legível
  const finalFormat =
    targetFormatKey && targetFormatKey !== "manter"
      ? FORMAT_LABELS[targetFormatKey] || targetFormatKey
      : currentPitch.formato;

  // Identifica sobre o que é a pauta (amigos, carreira, shows, gratuito, ou tema geral)
  const fullContext = `${currentPitch.initialIdea || ""} ${currentPitch.mote || ""} ${currentPitch.headlineArte || ""}`.toLowerCase();
  const isAboutFriends = fullContext.includes("amigo") || fullContext.includes("galera") || fullContext.includes("turma") || instr.includes("amigo");
  const isQuestionRequested = instr.includes("pergunta") || instr.includes("curios") || instr.includes("interroga") || instr.includes("dúvida");
  const isShortRequested = instr.includes("curt") || instr.includes("diret") || instr.includes("objetiv") || instr.includes("simples");
  const isHeadlineCritique = instr.includes("headline") || instr.includes("estranh") || instr.includes("sentido") || instr.includes("título") || instr.includes("capa") || instr.includes("melhor");
  const isShowFocus = instr.includes("show") || instr.includes("música") || instr.includes("festa") || fullContext.includes("show");
  const isCareerFocus = instr.includes("carreira") || instr.includes("certificado") || instr.includes("hora") || instr.includes("currículo");

  // Pool de Headlines reais e prontas para arte (sem "..." e sem "[v2]")
  let newHeadline = "";
  if (isQuestionRequested) {
    const questions = [
      "Já convocou a sua dupla de faculdade pro maior rolê de inovação da fronteira?",
      "Sabia que você e seus amigos têm entrada 100% livre nos 4 dias do Festival Iguassu Inova?",
      "O que você faria se pudesse curtir shows nacionais e turbinar o currículo no mesmo dia?"
    ];
    newHeadline = questions[nextVersion % questions.length];
  } else if (isShortRequested) {
    const shorts = [
      "Chame a galera: 4 dias de tecnologia, shows e futuro 100% grátis em Foz.",
      "O rolê mais inteligente do ano no Itaipu Parquetec. Só falta a sua turma!",
      "Inovação de dia, shows nacionais à noite. Tudo gratuito no Festival 2026."
    ];
    newHeadline = shorts[nextVersion % shorts.length];
  } else if (isShowFocus) {
    newHeadline = "Palco FIMS + 6 Mundos de Inovação: o ponto de encontro oficial da sua galera em novembro! 🎸✨";
  } else if (isCareerFocus) {
    newHeadline = "Horas complementares garantidas, networking real e resenha com os amigos no Itaipu Parquetec! 🎓🚀";
  } else if (isAboutFriends || isHeadlineCritique) {
    const creativeOptions = [
      "Bora fechar o semestre em grande estilo? Junte seus amigos e venha viver o Festival Iguassu Inova! 🔥",
      "Aquele rolê na faixa que une a turma toda: tecnologia, futuro, gastronomia e shows no Parquetec!",
      "Spoiler do seu novembro: você e seus amigos curtindo 4 dias épicos no maior festival da Tríplice Fronteira!",
      "Nem só de prova e TCC vive o universitário: convoque seu grupo pro Festival Iguassu Inova 2026! 🙌"
    ];
    newHeadline = creativeOptions[nextVersion % creativeOptions.length];
  } else {
    const generalOptions = [
      "Descubra tudo o que espera por você nos 6 Mundos do Festival Iguassu Inova 2026!",
      "De 25 a 28 de novembro, o futuro tem endereço certo no Itaipu Parquetec (Entrada Franca).",
      "Prepare-se para a maior imersão em ciência, negócios e cultura de Foz do Iguaçu!"
    ];
    newHeadline = generalOptions[nextVersion % generalOptions.length];
  }

  // Reescreve o Mote de forma limpa (sem concatenar lixo)
  let newMote = "";
  if (isAboutFriends) {
    newMote = `Ângulo Social & Pertencimento (Versão v${nextVersion} otimizada): posicionar o Festival Iguassu Inova como o melhor ponto de encontro para grupos de amigos universitários, unindo utilidade acadêmica (certificado e networking) com lazer gratuito (shows e gastronomia).`;
  } else {
    newMote = `Conceito Criativo Lapidado (v${nextVersion}): conectar diretamente os interesses de ${currentPitch.personaName.split("(")[0].trim()} às experiências práticas do Itaipu Parquetec com uma chamada de capa clara, magnética e sem ruídos.`;
  }

  // Reescreve a Legenda adaptando ao Formato (Reels, Carrossel, etc.) e ao Tom
  let intro = "";
  if (targetToneKey === "descontraido" || isAboutFriends) {
    intro = `Manda esse post agora no grupo da sala porque o plano de novembro já está fechado! 📲🔥\n\nQuem disse que evento de inovação é lugar de andar sozinho de terno? No Festival Iguassu Inova 2026, a experiência foi desenhada pra você viver com os seus amigos!`;
  } else if (targetToneKey === "provocativo") {
    intro = `Vai mesmo esperar seus amigos postarem os stories lá dentro pra perceber o que você perdeu? 👀⚡\n\nDe 25 a 28 de novembro, Foz do Iguaçu inteira vai estar conectada no Itaipu Parquetec!`;
  } else if (targetToneKey === "b2b") {
    intro = `Grandes carreiras e projetos nascem quando mentes inquietas se encontram no ambiente certo. 🎯\n\nDe 25 a 28 de novembro, reúna seus colegas e parceiros de jornada no Festival Iguassu Inova 2026.`;
  } else {
    intro = `Cansado da mesma rotina de sempre? Que tal viver 4 dias extraordinários ao lado da sua turma no Itaipu Parquetec? ✨🙌`;
  }

  let bodyStructure = "";
  if (targetFormatKey === "reels" || finalFormat.toLowerCase().includes("reels")) {
    bodyStructure = `\n\n🎬 ROTEIRO RÁPIDO DO REELS:\n• Cena 1 (Gancho 0-3s): Você olhando pro grupo de amigos e mostrando na tela: "${newHeadline}"\n• Cena 2 (Desenvolvimento): Cortes dinâmicos mostrando o que tem no festival — arenas de IA e games, feira de ciências, food trucks e o palco dos shows nacionais.\n• Cena 3 (CTA): Mostrando o passaporte gratuito emitido no celular pelo app Yazo Tickets.\n\n📌 LEGENDA DO POST:\n${intro}\n\nOlha tudo o que espera pela sua galera:\n🚀 6 Mundos Temáticos (Tecnologia, Ciência, Negócios e Cultura)\n🎸 Shows Nacionais Gratuitos no fim da tarde\n🎓 Certificado oficial para validar suas horas complementares\n🚌 Linhas de transporte público e fácil acesso`;
  } else if (targetFormatKey === "carrossel" || finalFormat.toLowerCase().includes("carrossel")) {
    bodyStructure = `\n\n${intro}\n\nArrasta pro lado e confira o checklist pra curtir com a galera:\n👉 Tela 1: ${newHeadline}\n👉 Tela 2: Maratonar os 6 Mundos interativos e testar novidades de IA na prática.\n👉 Tela 3: Garantir aquele certificado de horas complementares que salva o semestre.\n👉 Tela 4: Fechar o dia curtindo os shows nacionais e a feira gastronômica sem pagar nada!`;
  } else {
    bodyStructure = `\n\n${intro}\n\nTudo o que você e seus amigos vão encontrar no Itaipu Parquetec:\n✅ Palestras e oficinas práticas com grandes nomes nacionais\n✅ Arenas interativas, startups e mostra científica\n✅ Shows gratuitos e espaço de convivência\n✅ Certificado oficial de participação`;
  }

  const cta = `\n\n🎟️ 100% GRATUITO: Os passaportes são limitados! Marque seus amigos nos comentários e clique no link da bio para garantir o ingresso no app Yazo Tickets!\n\n#FestivalIguassuInova2026 #ItaipuParquetec #UniversitáriosFoz #FozDoIguaçu`;

  const newLegenda = `${bodyStructure}${cta}`;

  const newJustificativa = `Formato "${finalFormat}" reescrito sob medida (v${nextVersion}): headline reformulada para comunicação direta e natural, alinhada ao público de ${currentPitch.personaName} e otimizada para compartilhamento em grupos e marcação de amigos nos comentários.`;

  return {
    mote: newMote,
    headlineArte: newHeadline,
    legenda: newLegenda,
    formato: finalFormat,
    justificativaFormato: newJustificativa
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
      changeNote: instruction || `Ajuste de formato (${format}) / tom (${tone})`
    };

    const targetFormatLabel =
      format && format !== "manter"
        ? FORMAT_LABELS[format] || format
        : currentPitch.formato;
    const targetTone = tone && tone !== "manter" ? tone : "padrão da persona";

    // 3. Determinar chave de API Gemini (informada pelo usuário ou variável de ambiente)
    const geminiApiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY || "";

    let rewritten = null;
    let engineUsed = "local_refine";

    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const prompt = `Você é o Diretor Criativo e Copywriter Sênior do Festival Iguassu Inova 2026 (Itaipu Parquetec, Foz do Iguaçu).
O conteudista pediu um ajuste/reescrita em uma pauta específica.

PAUTA ATUAL (QUE PRECISA SER CORRIGIDA/MELHORADA):
- Persona-Alvo: ${currentPitch.personaName}
- Ideia Original do Briefing: ${currentPitch.initialIdea || "Geral do Festival"}
- Mote Atual: ${currentPitch.mote}
- Headline Atual: ${currentPitch.headlineArte}
- Legenda Atual: ${currentPitch.legenda}
- Formato Atual: ${currentPitch.formato}

PEDIDO DE ALTERAÇÃO DO CONTEUDISTA (PRIORIDADE MÁXIMA):
- O que mudar / Crítica do conteudista: "${instruction || "Reescreva de forma mais criativa, natural e impactante"}"
- Formato desejado: "${targetFormatLabel}"
- Tom de voz desejado: "${targetTone}"

REGRAS OBRIGATÓRIAS:
1. Atenda EXATAMENTE à crítica ou pedido do conteudista acima. Se ele reclamou que a headline estava estranha ou cortada, crie uma Headline 100% nova, limpa, publicitária, natural e criativa (sem reticências truncadas e sem colocar prefixos como [v2]).
2. Reescreva o Mote de forma limpa, sem apenas adicionar parênteses no texto antigo.
3. Adapte a Legenda para o formato "${targetFormatLabel}" (ex: se for Reels, inclua sugestão rápida de cenas + legenda completa).
4. Mantenha os dados reais da persona na justificativa.

RETORNE EXCLUSIVAMENTE UM OBJETO JSON VÁLIDO:
{
  "mote": "...",
  "headlineArte": "...",
  "legenda": "...",
  "formato": "${targetFormatLabel}",
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
          rewritten = {
            mote: parsed.mote || currentPitch.mote,
            headlineArte: parsed.headlineArte,
            legenda: parsed.legenda,
            formato: parsed.formato || targetFormatLabel,
            justificativaFormato: parsed.justificativaFormato || currentPitch.justificativaFormato
          };
          engineUsed = "gemini_refine";
        }
      } catch (geminiError) {
        console.error("Erro no Gemini ao refinar pauta, acionando reescrita inteligente local:", geminiError);
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

    // Atualiza no banco de dados local
    pitches[pitchIndex] = updatedPitch;
    savePitches(pitches);

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
