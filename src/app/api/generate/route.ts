import { NextRequest, NextResponse } from "next/server";
import { GeneratePitchesRequestSchema } from "@/lib/schemas";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// Caminho dos arquivos locais
const PERSONAS_PATH = path.join(process.cwd(), "src", "data", "personas-2026.json");
const FESTIVAL_CONTEXT_PATH = path.join(process.cwd(), "src", "data", "festival-context.json");

interface FallbackPitch {
  mote: string;
  headlineArte: string;
  legenda: string;
  formato: string;
  justificativaFormato: string;
}

// Gerador Inteligente Offline / Fallback caso não haja chave de API ou a cota do Gemini seja excedida
function generateOfflinePitches(
  persona: any,
  update: any | null,
  channel: string,
  weeklyTheme: string,
  pitchCount: number,
  initialIdea?: string
): FallbackPitch[] {
  const isIdeaGiven = !!(initialIdea && initialIdea.trim().length > 0);
  const baseTitle = update ? update.title : "Festival Iguassu Inova 2026";
  const worldName = update ? update.world : "Itaipu Parquetec";
  
  const themeLabels: Record<string, string> = {
    "terca-futuro": "Terça do Futuro & Inteligência Artificial",
    "quarta-ciencia": "Quarta da Ciência & Pesquisa Aplicada",
    "quinta-b2b": "Quinta de Negócios, Startups & Conexões",
    "sexta-lazer": "Sexta de Shows Nacionais & Happy Hour",
    "livre": "Grade Oficial do Festival"
  };

  const topInterest = persona.topInterests?.[0]?.label || "Inovação e Tecnologia";
  const topInterestPct = persona.topInterests?.[0]?.pct || 80;
  const topGoal = persona.topGoals?.[0]?.label || "networking qualificado";
  const transportLabel = persona.transport?.[0]?.label || "transporte";
  const transportPct = persona.transport?.[0]?.pct || 50;

  return Array.from({ length: pitchCount }).map((_, idx) => {
    const format = persona.suggestedFormats[idx % persona.suggestedFormats.length] || "Carrossel Informativo";
    
    let mote = "";
    let headlineArte = "";
    let legenda = "";
    let justificativa = "";

    if (isIdeaGiven) {
      mote = `[${themeLabels[weeklyTheme]}] Conexão da ideia do conteudista ("${initialIdea!.trim().slice(0, 45)}...") com a prioridade de ${persona.name} em ${topInterest}.`;
      headlineArte = `"${initialIdea!.trim().slice(0, 52)}..." — o Festival Iguassu Inova te espera.`;
      legenda = `Você já pensou sobre isso? 🤔✨\n\nNo Festival Iguassu Inova 2026, conectamos ideias que transformam o ecossistema com quem está na linha de frente.\n\nSe o seu foco é ${topGoal.toLowerCase()}, o Parque Tecnológico Itaipu preparou 4 dias de imersão total com palestras, workshops e conexões com ${worldName}.\n\n📅 25 a 28 de Novembro de 2026\n📍 Itaipu Parquetec - Foz do Iguaçu (PR)\n🎟️ 100% GRATUITO (Passaportes limitados)\n\nGaranta seu ingresso agora mesmo no app Yazo Tickets pelo link da bio!\n\n#FestivalIguassuInova2026 #ItaipuParquetec #Inovacao #${persona.category}`;
      justificativa = `Recomendamos ${format} porque ${topInterestPct}% dos ${persona.count} adultos deste público priorizam ${topInterest} e ${transportPct}% utilizam ${transportLabel}. O gancho guiado pela ideia ressoa com a dor de ${persona.keyPain}.`;
    } else {
      mote = `[${themeLabels[weeklyTheme]}] Alinhamento de ${baseTitle} (${worldName}) com a busca de ${persona.name} por ${topGoal}.`;
      headlineArte = idx === 0 
        ? `O maior encontro de inovação da Tríplice Fronteira é 100% gratuito.` 
        : `Você está pronto para o futuro? Conheça as atrações do ${worldName}.`;
      legenda = `A contagem regressiva começou! 🚀\n\nO Festival Iguassu Inova 2026 reúne os maiores nomes de ciência, tecnologia e negócios no Itaipu Parquetec. Destaque especial para ${baseTitle}.\n\nPara o público de ${persona.name.toLowerCase()} que busca superar o desafio de ${persona.keyPain.toLowerCase()}, preparamos uma trilha exclusiva.\n\n✅ 100% Gratuito com Certificado Oficial\n✅ 6 Mundos Temáticos e Shows Nacionais\n✅ Transporte facilitado e estrutura completa\n\nBaixe o app Yazo Tickets e resgate seu passaporte digital antes que esgote!\n\n#FestivalIguassuInova2026 #${persona.category} #FozDoIguacu #Inovacao`;
      justificativa = `Formato ${format} validado pelas métricas reais da base: ${topInterestPct}% dos ${persona.count} inscritos adultos deste segmento buscam ${topInterest}. Canal otimizado: ${channel.toUpperCase()}.`;
    }

    return {
      mote,
      headlineArte,
      legenda,
      formato: format,
      justificativaFormato: justificativa
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validação com Zod (Segurança, tipos e limites)
    const validation = GeneratePitchesRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados de requisição inválidos",
          details: validation.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }

    // 2. Proteção contra Mass Assignment — pegamos apenas os campos validados
    const {
      personaId,
      updateId,
      channel,
      weeklyTheme,
      pitchCount,
      initialIdea,
      userApiKey
    } = validation.data;

    // 3. Carregar dados reais das Personas 2026
    let personas = [];
    if (fs.existsSync(PERSONAS_PATH)) {
      personas = JSON.parse(fs.readFileSync(PERSONAS_PATH, "utf-8"));
    }
    const persona = personas.find((p: any) => p.id === personaId);
    if (!persona) {
      return NextResponse.json(
        { success: false, error: "Persona selecionada não foi encontrada na base de dados." },
        { status: 404 }
      );
    }

    // 4. Carregar contexto de atualização do festival (se aplicável)
    let updateFound = null;
    if (updateId && updateId !== "none") {
      let updates = [];
      if (fs.existsSync(FESTIVAL_CONTEXT_PATH)) {
        updates = JSON.parse(fs.readFileSync(FESTIVAL_CONTEXT_PATH, "utf-8"));
      }
      updateFound = updates.find((u: any) => u.id === updateId);
    }

    // 5. Determinar chave de API Gemini: prioriza a enviada pelo usuário na tela, ou variável de ambiente
    const geminiApiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY || "";

    // Caso NÃO haja chave de API configurada, utiliza o Motor Inteligente Offline com dados reais
    if (!geminiApiKey) {
      const offlineResults = generateOfflinePitches(
        persona,
        updateFound,
        channel,
        weeklyTheme,
        pitchCount,
        initialIdea
      );

      const formattedPitches = offlineResults.map((p, idx) => ({
        id: `pitch-${Date.now()}-${idx}`,
        version: 1,
        createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        personaId: persona.id,
        personaName: persona.name,
        updateTitle: updateFound?.title,
        initialIdea: initialIdea ? initialIdea.trim() : undefined,
        channel,
        mote: p.mote,
        headlineArte: p.headlineArte,
        legenda: p.legenda,
        formato: p.formato,
        justificativaFormato: p.justificativaFormato
      }));

      return NextResponse.json({
        success: true,
        source: "offline_fallback",
        message: "Pautas geradas com sucesso via Motor Inteligente Local (Base Oficial 2026). Para usar a IA Gemini em nuvem, insira sua chave API no topo da página.",
        pitches: formattedPitches
      });
    }

    // 6. Chamada Real com Google Gemini (@google/genai)
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const promptSystem = `Você é o Diretor Criativo e Estrategista de Conteúdo Oficial do Festival Iguassu Inova 2026 (Itaipu Parquetec, Foz do Iguaçu, 25 a 28 de novembro de 2026).
Seu objetivo é gerar exatamente ${pitchCount} pautas distintas para redes sociais com embasamento estatístico estrito nos dados reais dos inscritos de 2026.

DADOS REAIS DA PERSONA:
- Nome/Perfil: ${persona.name} (${persona.role})
- Volume Adulto na Base: ${persona.count} inscritos (${persona.pctOfAdults}% dos adultos do festival)
- Dor Principal: ${persona.keyPain}
- Tom de Voz Obrigatório: ${persona.tone}
- Top Interesses Reais: ${persona.topInterests?.map((i: any) => `${i.label} (${i.pct}%)`).join(", ")}
- Top Objetivos: ${persona.topGoals?.map((g: any) => `${g.label} (${g.pct}%)`).join(", ")}
- Transporte Principal: ${persona.transport?.[0]?.label} (${persona.transport?.[0]?.pct}%)
- Formatos sugeridos da persona: ${persona.suggestedFormats?.join(", ")}

CONTEXTO DO FESTIVAL:
- Foco Selecionado: ${updateFound ? `${updateFound.title} [${updateFound.world}] - ${updateFound.summary}` : "Visão Geral do Festival (6 Mundos, 4 Shows Nacionais, 100% gratuito)"}
- Canal de Distribuição: ${channel.toUpperCase()}
- Linha Editorial da Grade: ${weeklyTheme}
${initialIdea ? `- IDEIA INICIAL DO CONTEUDISTA (OBRIGATÓRIO DESDOBRAR): "${initialIdea}"` : "- MODO IDEAÇÃO AUTÔNOMA: Crie os melhores ângulos do zero."}

REGRAS DE CONTEÚDO OBRIGATÓRIAS:
1. Mote do conteúdo: Conceito criativo e a conexão estratégica clara entre o festival e a dor da persona.
2. Headline (O que vai na arte): Frase impactante de capa / gancho inicial, curta e magnética.
3. Legenda para redes: Texto completo com introdução envolvente, desenvolvimento, quebra de objeções (100% gratuito, passaporte no app Yazo Tickets, estrutura no Itaipu Parquetec), CTA clara e hashtags pertinentes (#FestivalIguassuInova2026).
4. Formato + Justificativa com Dados: Cite explicitamente números e percentuais reais da persona para comprovar a escolha do formato.

RETORNE EXCLUSIVAMENTE UM ARRAY JSON COM OS ${pitchCount} OBJETOS, SEM TEXTO OU MARKDOWN ADICIONAL. Formato:
[
  {
    "mote": "...",
    "headlineArte": "...",
    "legenda": "...",
    "formato": "...",
    "justificativaFormato": "..."
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptSystem,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "[]";
      let parsedPitches: FallbackPitch[] = [];

      try {
        parsedPitches = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Falha ao parsear JSON retornado pelo Gemini:", parseErr);
        // Fallback defensivo
        parsedPitches = generateOfflinePitches(persona, updateFound, channel, weeklyTheme, pitchCount, initialIdea);
      }

      const formattedPitches = parsedPitches.map((p, idx) => ({
        id: `pitch-${Date.now()}-${idx}`,
        version: 1,
        createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        personaId: persona.id,
        personaName: persona.name,
        updateTitle: updateFound?.title,
        initialIdea: initialIdea ? initialIdea.trim() : undefined,
        channel,
        mote: p.mote,
        headlineArte: p.headlineArte,
        legenda: p.legenda,
        formato: p.formato,
        justificativaFormato: p.justificativaFormato
      }));

      return NextResponse.json({
        success: true,
        source: "gemini_api",
        message: `Pautas geradas com sucesso via Gemini 2.5 Flash!`,
        pitches: formattedPitches
      });
    } catch (geminiError: any) {
      console.error("Erro na chamada à API Gemini, usando motor offline:", geminiError?.message || geminiError);
      
      // Fallback seguro caso a chave seja inválida ou exceda cota
      const fallbackPitches = generateOfflinePitches(
        persona,
        updateFound,
        channel,
        weeklyTheme,
        pitchCount,
        initialIdea
      );

      const formattedPitches = fallbackPitches.map((p, idx) => ({
        id: `pitch-${Date.now()}-${idx}`,
        version: 1,
        createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        personaId: persona.id,
        personaName: persona.name,
        updateTitle: updateFound?.title,
        initialIdea: initialIdea ? initialIdea.trim() : undefined,
        channel,
        mote: p.mote,
        headlineArte: p.headlineArte,
        legenda: p.legenda,
        formato: p.formato,
        justificativaFormato: p.justificativaFormato
      }));

      return NextResponse.json({
        success: true,
        source: "offline_fallback",
        message: "Aviso: A API do Gemini retornou erro de autenticação ou limite de cota. O sistema acionou o Motor Inteligente Local com dados reais para que você não perca seu fluxo de trabalho.",
        pitches: formattedPitches
      });
    }
  } catch (error: any) {
    console.error("Erro no processamento da rota /api/generate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ocorreu um erro interno ao processar a geração de pautas. Tente novamente."
      },
      { status: 500 }
    );
  }
}
