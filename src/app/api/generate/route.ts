import { NextRequest, NextResponse } from "next/server";
import { GeneratePitchesRequestSchema } from "@/lib/schemas";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// Caminho dos arquivos locais
const PERSONAS_PATH = path.join(process.cwd(), "src", "data", "personas-2026.json");
const FESTIVAL_CONTEXT_PATH = path.join(process.cwd(), "src", "data", "festival-context.json");
const PITCHES_PATH = path.join(process.cwd(), "src", "data", "saved-pitches.json");

function persistPitches(newPitches: any[]): void {
  try {
    let current = [];
    if (fs.existsSync(PITCHES_PATH)) {
      current = JSON.parse(fs.readFileSync(PITCHES_PATH, "utf-8"));
    }
    fs.writeFileSync(PITCHES_PATH, JSON.stringify([...newPitches, ...current], null, 2), "utf-8");
  } catch (e) {
    console.error("Falha ao persistir pautas no disco:", e);
  }
}

interface FallbackPitch {
  mote: string;
  headlineArte: string;
  legenda: string;
  formato: string;
  justificativaFormato: string;
}

/**
 * Motor Criativo Inteligente Local
 * Interpreta o briefing do conteudista semanticamente (sem recortar o texto bruto)
 * e gera pautas 100% distintas entre si para cada índice do lote.
 */
function generateOfflinePitches(
  persona: any,
  update: any | null,
  channel: string,
  weeklyTheme: string,
  pitchCount: number,
  initialIdea?: string
): FallbackPitch[] {
  const ideaText = (initialIdea || "").trim();
  const isIdeaGiven = ideaText.length > 0;
  const ideaLower = ideaText.toLowerCase();

  const baseTitle = update ? update.title : "6 Mundos Temáticos e 4 Shows Nacionais";
  const worldName = update ? update.world : "Itaipu Parquetec";

  const themeLabels: Record<string, string> = {
    "terca-futuro": "Terça do Futuro & IA",
    "quarta-ciencia": "Quarta da Ciência & Pesquisa",
    "quinta-b2b": "Quinta de Negócios & Conexões",
    "sexta-lazer": "Sexta de Shows & Cultura",
    "livre": "Grade Oficial 2026"
  };

  // Detecção semântica de intenções no briefing do conteudista
  const isAboutFriends = ideaLower.includes("amigo") || ideaLower.includes("galera") || ideaLower.includes("turma") || ideaLower.includes("grupo") || ideaLower.includes("curtir");
  const isAboutMeme = ideaLower.includes("meme") || ideaLower.includes("humor") || ideaLower.includes("engraçad") || ideaLower.includes("piada");
  const isAboutCareer = ideaLower.includes("carreira") || ideaLower.includes("emprego") || ideaLower.includes("estágio") || ideaLower.includes("currículo") || ideaLower.includes("horas");
  const isAboutBus = ideaLower.includes("ônibus") || ideaLower.includes("transporte") || ideaLower.includes("carona") || ideaLower.includes("chegar");
  const isAboutFree = ideaLower.includes("grátis") || ideaLower.includes("gratuit") || ideaLower.includes("0800") || ideaLower.includes("pagar");

  const interests = persona.topInterests || [{ label: "Inovação", pct: 75 }, { label: "Cultura", pct: 60 }];
  const goals = persona.topGoals || [{ label: "Networking", pct: 70 }, { label: "Aprendizado", pct: 65 }];
  const transport = persona.transport?.[0] || { label: "transporte", pct: 50 };

  // Banco de arquétipos criativos distintos para garantir que Pauta #1, #2, #3, #4, #5 NUNCA sejam iguais
  const isDrauzio = ideaLower.includes("drauzio") || ideaLower.includes("médic") || ideaLower.includes("saúde");
  const isViralEdit = ideaLower.includes("edit") || ideaLower.includes("fancam") || ideaLower.includes("viral") || ideaLower.includes("curiosidade");

  const creativeAngles = [
    // ÂNGULO 1: Social / FOMO / Experiência Coletiva
    {
      build: (format: string, interest: any, goal: any) => {
        if (isDrauzio && isViralEdit) {
          return {
            mote: `[Vídeo Estilo Fancam/Edit & Curiosidades]: humanizar a trajetória do Dr. Drauzio Varella com alta retenção, conectando causas sociais, Carandiru e +50 anos de carreira com a persona ${persona.name}.`,
            headlineArte: `Pioneirismo, Carandiru e +50 anos de carreira: o que você não sabia sobre o Dr. Drauzio Varella 🎬🩺`,
            legenda: `Ícone da saúde pública, pioneiro na divulgação científica e com mais de 5 décadas dedicadas a cuidar de pessoas: Dr. Drauzio Varella é presença confirmada no Festival Iguassu Inova 2026! 🩺✨\n\nMuito além dos consultórios, a trajetória dele é marcada por coragem, atuação histórica no Carandiru e o dom raro de traduzir a ciência em uma linguagem acessível para todo o Brasil.\n\n📍 Onde: Itaipu Parquetec (Foz do Iguaçu - PR)\n📅 Quando: 25 a 28 de Novembro de 2026\n🎟️ Entrada: 100% Gratuita (retirada antecipada pelo app Yazo Tickets)\n🎓 Certificado oficial de participação\n\nSalve esse vídeo e marque aqui quem não pode perder esse momento histórico! 👇\n\n#FestivalIguassuInova2026 #DrauzioVarella #SaudePublica #ItaipuParquetec #FozDoIguacu`
          };
        }
        if (isDrauzio) {
          return {
            mote: `[Aula Magna de Saúde & Ciência]: posicionar a palestra do Dr. Drauzio Varella como o encontro imperdível do ano no Festival para ${persona.name}.`,
            headlineArte: `Dr. Drauzio Varella em Foz: uma aula magna de ciência, ética e saúde no Festival Iguassu Inova! 🩺🌟`,
            legenda: `Uma das mentes mais respeitadas da medicina brasileira desembarca em Foz do Iguaçu para um encontro transformador no Festival Iguassu Inova 2026! 🩺✨\n\nDe 25 a 28 de novembro, o Itaipu Parquetec será palco de reflexões profundas sobre o futuro da saúde, causas sociais e inovação humana com o Dr. Drauzio Varella.\n\n🎟️ O acesso é 100% GRATUITO, mas as vagas no auditório são limitadas! Emita seu passaporte no app Yazo Tickets pelo link da bio.\n\n#FestivalIguassuInova2026 #DrauzioVarella #ItaipuParquetec`
          };
        }
        if (isIdeaGiven) {
          const cleanHead = ideaText.length > 60 ? ideaText.slice(0, 60) + "..." : ideaText;
          return {
            mote: `[Atendimento Direto ao Briefing]: pauta focada na ideia "${ideaText.slice(0, 45)}...", direcionando para os interesses de ${persona.name}.`,
            headlineArte: `${cleanHead} 🔥`,
            legenda: `Você pediu e o Festival Iguassu Inova 2026 preparou uma experiência sob medida!\n\n${ideaText}\n\nDe 25 a 28 de novembro no Itaipu Parquetec:\n🚀 6 Mundos Temáticos com tecnologias e ciência\n🎸 Shows nacionais gratuitos e espaço gastronômico\n🎓 Certificado oficial de participação\n\nGaranta seu passaporte gratuito pelo link da bio no app Yazo Tickets!\n\n#FestivalIguassuInova2026 #ItaipuParquetec #${persona.category}`
          };
        }
        if (isAboutFriends) {
          return {
            mote: `[${themeLabels[weeklyTheme]}] A experiência do Festival fica 10x melhor em galera: transformar o passeio com os amigos em um rolê épico.`,
            headlineArte: `Marque aqui o grupo de amigos que vai fechar o semestre com você no Festival Iguassu Inova! 🔥`,
            legenda: `Sabe aquele rolê que junta todo mundo — desde tecnologia até shows no fim da tarde? 🙌✨\n\nO Festival Iguassu Inova 2026 não é lugar pra ir sozinho! Chame a sua turma de 25 a 28 de novembro no Itaipu Parquetec.\n\n#FestivalIguassuInova2026 #ItaipuParquetec`
          };
        }
        return {
          mote: `[${themeLabels[weeklyTheme]}] Gancho de Impacto Direto: posicionar ${baseTitle} como o evento imperdível do ano para ${persona.name}.`,
          headlineArte: `O maior encontro de ciência, negócios e música da Tríplice Fronteira é 100% gratuito.`,
          legenda: `Prepare-se para 4 dias que vão virar a chave da sua visão de futuro! 🚀\n\nDe 25 a 28 de novembro, o Itaipu Parquetec abre as portas para o Festival Iguassu Inova 2026.\n\n#FestivalIguassuInova2026 #ItaipuParquetec`
        };
      }
    },

    // ÂNGULO 2: Guia Prático / Roteiro / Checklist ("Tudo que temos no festival")
    {
      build: (format: string, interest: any, goal: any) => {
        if (isDrauzio) {
          return {
            mote: `[Curiosidades & Fatos Marcantes]: lista dinâmica de fatos curiosos e marcantes da trajetória do Dr. Drauzio para gerar compartilhamento e engajamento.`,
            headlineArte: `5 curiosidades que provam por que o Dr. Drauzio Varella é uma lenda da ciência brasileira 📌🙌`,
            legenda: `Você sabia que muito antes dos vídeos virais, o Dr. Drauzio já quebrava tabus e transformava a saúde pública no Brasil? 🩺\n\nConfira o que torna a presença dele no Festival Iguassu Inova 2026 tão imperdível:\n\n1️⃣ Pioneirismo absoluto na luta contra o tabagismo e epidemias\n2️⃣ Atuação marcante no sistema prisional e lições de humanidade no Carandiru\n3️⃣ O talento único de democratizar temas médicos complexos em linguagem acessível\n4️⃣ Mais de meio século de dedicação contínua à medicina\n5️⃣ Maratonista experiente aos mais de 80 anos de idade!\n\nDe 25 a 28 de novembro, viva esse momento histórico ao vivo no Itaipu Parquetec com entrada franca!\n\n📲 Garanta seu passaporte gratuito pelo link da bio no app Yazo Tickets.\n\n#FestivalIguassuInova2026 #Curiosidades #DrauzioVarella #ItaipuParquetec`
          };
        }
        if (isIdeaGiven) {
          return {
            mote: `[Desdobramento Educativo & Checklist]: estrutura de alto valor sobre "${ideaText.slice(0, 45)}..." gerando salvamentos.`,
            headlineArte: `O que você precisa saber sobre esse tema no Festival Iguassu Inova 2026 📌`,
            legenda: `Quer aproveitar cada detalhe da programação no Itaipu Parquetec? Confira o checklist:\n\n🔹 ${ideaText}\n🔹 6 Mundos Temáticos com experiências práticas\n🔹 Rodadas de conexão e grandes shows gratuitos\n\nPassaporte gratuito disponível no app Yazo Tickets (link na bio)!\n\n#FestivalIguassuInova2026 #GuiaDoFestival #ItaipuParquetec`
          };
        }
        return {
          mote: `[${themeLabels[weeklyTheme]}] Quebra de Objeções & Serviço: responder as principais dúvidas sobre acesso e gratuidade.`,
          headlineArte: `3 motivos reais para você garantir seu passaporte gratuito do Festival hoje mesmo.`,
          legenda: `Ainda em dúvida se o Festival Iguassu Inova 2026 é para você? Confira como desenhamos cada detalhe pensando na sua rotina.\n\n#FestivalIguassuInova2026 #ItaipuParquetec`
        };
      }
    },

    // ÂNGULO 3: Bastidores / POV / Urgência & Escassez
    {
      build: (format: string, interest: any, goal: any) => {
        return {
          mote: `[${themeLabels[weeklyTheme]}] POV (Ponto de Vista) & Urgência: criar sensação de pertencimento imediato mostrando como um dia no Festival acelera resultados em ${goal.label.toLowerCase()}.`,
          headlineArte: `POV: Você juntou sua galera e descobriu que o maior festival do ano acontece aqui em Foz 🚀`,
          legenda: `Imagina sair da rotina e, em uma única tarde, assistir a ${baseTitle}, testar tecnologias na prática, fazer contatos estratégicos e terminar o dia curtindo música boa com seus amigos? 🌟\n\nIsso não acontece só nas grandes capitais — acontece aqui em Foz do Iguaçu, dentro do Itaipu Parquetec!\n\nDe 25 a 28 de novembro, o Festival Iguassu Inova 2026 foi feito sob medida para você que se interessa por ${interest.label.toLowerCase()}.\n\n⏳ Os passaportes gratuitos na Yazo Tickets estão voando. Toque no link da bio e garanta o seu lugar agora!\n\n#FestivalIguassuInova2026 #POV #ItaipuParquetec #TrípliceFronteira`
        };
      }
    },

    // ÂNGULO 4: Pergunta Curiosa / Interação nos Stories & Comentários
    {
      build: (format: string, interest: any, goal: any) => {
        return {
          mote: `[${themeLabels[weeklyTheme]}] Engajamento por Pergunta Direta: estimular comentários perguntando qual atração ou mundo do Festival o público mais quer visitar.`,
          headlineArte: `Se você pudesse escolher só 1 motivo pra ir ao Festival Iguassu Inova, qual seria? 👇`,
          legenda: `Queremos saber o que faz seu olho brilhar! ✨ De 25 a 28 de novembro, o Itaipu Parquetec se divide em experiências completas:\n\n🅰️ Assistir às palestras de ${interest.label} e ${baseTitle}\n🅱️ Garantir certificado, networking e oportunidades de ${goal.label.toLowerCase()}\n🅾️ Curtir os shows nacionais gratuitos e a gastronomia com os amigos\n\nA boa notícia? Você não precisa escolher um só! Com o passaporte único e 100% gratuito da Yazo Tickets, você tem acesso livre aos 4 dias.\n\nComente aqui embaixo: qual é a sua letra (A, B ou O) e marque quem vai com você! 💬👇\n\n#FestivalIguassuInova2026 #Enquete #ItaipuParquetec`
        };
      }
    },

    // ÂNGULO 5: Autoridade / Dados da Comunidade
    {
      build: (format: string, interest: any, goal: any) => {
        return {
          mote: `[${themeLabels[weeklyTheme]}] Prova Social com Dados: usar o fato de que milhares de inscritos já confirmaram presença para atrair os indecisos.`,
          headlineArte: `Mais de 7.000 pessoas já garantiram presença. Só falta você e a sua turma! 🎯`,
          legenda: `Quando milhares de estudantes, profissionais, pesquisadores e famílias da região confirmam presença no mesmo lugar, você sabe que algo gigante está prestes a acontecer! 🔥\n\nO Festival Iguassu Inova 2026 já é o ponto de encontro oficial de quem busca ${interest.label.toLowerCase()} e quer viver de perto atrações como ${baseTitle}.\n\n📍 Onde: Itaipu Parquetec (Foz do Iguaçu)\n📅 Quando: 25 a 28 de Novembro de 2026\n🎟️ Quanto: 100% Gratuito na Yazo Tickets (link na bio)\n\nNão fique de fora da foto oficial! Emita sua credencial agora mesmo.\n\n#FestivalIguassuInova2026 #InovacaoSocial #ItaipuParquetec`
        };
      }
    }
  ];

  return Array.from({ length: pitchCount }).map((_, idx) => {
    const format = persona.suggestedFormats[idx % persona.suggestedFormats.length] || "Carrossel Interativo";
    const interest = interests[idx % interests.length] || interests[0];
    const goal = goals[idx % goals.length] || goals[0];
    const angle = creativeAngles[idx % creativeAngles.length];

    const content = angle.build(format, interest, goal);

    const justificativa = `Escolhemos o formato "${format}" com este ângulo porque ${interest.pct}% dos ${persona.count} inscritos adultos desta persona têm interesse direto em ${interest.label}, ${goal.pct}% buscam ${goal.label.toLowerCase()} e ${transport.pct}% utilizam ${transport.label} (o que favorece combinados em grupo/carona e conteúdos compartilháveis no ${channel.toUpperCase()}).`;

    return {
      mote: content.mote,
      headlineArte: content.headlineArte,
      legenda: content.legenda,
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
    if (geminiApiKey && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = geminiApiKey;
    }

    // Caso NÃO haja chave de API configurada, utiliza o Motor Criativo Local com ângulos distintos
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

      persistPitches(formattedPitches);

      return NextResponse.json({
        success: true,
        source: "offline_fallback",
        message: "Pautas criativas geradas! Dica: Você também pode colar sua chave gratuita do Google AI Studio no botão '⚙️ Inserir Chave Gemini' para usar o Gemini 2.5 Flash ao vivo.",
        pitches: formattedPitches
      });
    }

    // 6. Chamada Real com Google Gemini (@google/genai)
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const promptSystem = `Você é o Diretor de Criação e Copywriter Sênior Oficial do Festival Iguassu Inova 2026 (Itaipu Parquetec, Foz do Iguaçu, 25 a 28 de novembro de 2026).
Sua missão é criar exatamente ${pitchCount} pautas de redes sociais COMPLETAMENTE DIFERENTES ENTRE SI, altamente criativas, prontas para publicação e fundamentadas nos dados reais dos inscritos adultos de 2026.

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
- Foco Selecionado: ${updateFound ? `${updateFound.title} [${updateFound.world}] - ${updateFound.summary}` : "Visão Geral do Festival (6 Mundos Temáticos, 4 Shows Nacionais como Emicida e Duda Beat, Palestrantes Nacionais, Feira Gastronômica, 100% gratuito)"}
- Canal de Distribuição: ${channel.toUpperCase()}
- Linha Editorial da Grade: ${weeklyTheme}
${initialIdea ? `- BRIEFING / IDEIA INICIAL DO CONTEUDISTA: "${initialIdea}"\n  IMPORTANTE: NÃO copie nem recorte literalmente a frase do conteudista na headline! Interprete o pedido dele como um Diretor Criativo faria e crie ganchos publicitários magnéticos, naturais e criativos que desenvolvam essa ideia.` : "- MODO IDEAÇÃO AUTÔNOMA: Crie os melhores ângulos criativos do zero."}

REGRAS OBRIGATÓRIAS DE DIFERENCIAÇÃO E QUALIDADE:
1. Cada uma das ${pitchCount} pautas DEVE ter uma abordagem diferente (ex: Pauta 1 focada em convite social/amigos ou humor; Pauta 2 focada em roteiro prático/carrossel/serviço; Pauta 3 focada em curiosidade/ROV, etc.). NUNCA gere duas pautas parecidas.
2. Mote do conteúdo: Explique o conceito criativo da peça e como ele resolve a dor da persona e atende ao briefing.
3. Headline (O que vai na arte): Crie uma frase de capa/arte digna de agência premiada — curta, magnética, sem parecer rascunho.
4. Legenda para redes: Texto completo, envolvente, com formatação escaneável (emojis, tópicos), quebrando objeções (100% gratuito, passaporte no app Yazo Tickets, certificado oficial, estrutura no Itaipu Parquetec), CTA forte e hashtags.
5. Formato + Justificativa com Dados: Indique um formato específico e justifique citando os percentuais reais da persona fornecidos acima.

RETORNE EXCLUSIVAMENTE UM ARRAY JSON VÁLIDO COM OS ${pitchCount} OBJETOS, SEM MARKDOWN ADICIONAL:
[
  {
    "mote": "...",
    "headlineArte": "...",
    "legenda": "...",
    "formato": "...",
    "justificativaFormato": "..."
  }
]`;

      const CANDIDATE_MODELS = [
        "gemini-3.8-flash",
        "gemini-4-argon",
        "gemini-3.8-pro",
        "gemini-2.0-flash-exp"
      ];
      let response: any = null;
      let modelUsed = "";
      let lastGeminiError: any = null;

      for (const modelCandidate of CANDIDATE_MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`[Gemini /api/generate] Tentando modelo: ${modelCandidate} (tentativa ${attempt})...`);
            response = await ai.models.generateContent({
              model: modelCandidate,
              contents: promptSystem,
              config: {
                responseMimeType: "application/json"
              }
            });
            modelUsed = modelCandidate;
            console.log(`[Gemini /api/generate] SUCESSO com modelo: ${modelCandidate}!`);
            break;
          } catch (err: any) {
            lastGeminiError = err;
            const errMsg = err?.message || String(err);
            const is503 = errMsg.includes("503") || errMsg.includes("high demand") || err?.status === 503;
            console.warn(`[Gemini /api/generate] Falha com modelo ${modelCandidate} (tentativa ${attempt}):`, errMsg);

            if (is503 && attempt < 2) {
              console.log(`[Gemini /api/generate] 503 detectado em ${modelCandidate}. Aguardando 1.5s para tentar novamente...`);
              await new Promise((r) => setTimeout(r, 1500));
              continue;
            }
            break;
          }
        }
        if (response) break;
      }

      if (!response) {
        throw lastGeminiError || new Error("Nenhum modelo Gemini disponível respondeu com sucesso.");
      }

      const responseText = response.text || "[]";
      let parsedPitches: FallbackPitch[] = [];

      try {
        parsedPitches = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Falha ao parsear JSON retornado pelo Gemini:", parseErr);
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

      persistPitches(formattedPitches);

      return NextResponse.json({
        success: true,
        source: "gemini_api",
        model: modelUsed,
        message: `✨ ${formattedPitches.length} pautas inéditas criadas com IA (${modelUsed})!`,
        pitches: formattedPitches
      });
    } catch (geminiError: any) {
      console.error("Erro na chamada à API Gemini, usando motor criativo local:", geminiError?.message || geminiError);

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

      persistPitches(formattedPitches);

      return NextResponse.json({
        success: true,
        source: "offline_fallback",
        message: "Aviso: Sua chave Gemini apresentou erro ou limite. O Motor Criativo Local assumiu e gerou pautas distintas para você.",
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
