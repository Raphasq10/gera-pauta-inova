export interface PersonaData {
  id: string;
  name: string;
  category: "professores" | "alunos" | "comunidade" | "empresarios";
  role: string;
  count: number;
  pctOfAdults: number;
  avgAge: number;
  genderPct: string;
  topInterests: { label: string; pct: number }[];
  topGoals: { label: string; pct: number }[];
  transport: { label: string; pct: number }[];
  topLocations: string[];
  keyPain: string;
  tone: string;
  suggestedFormats: string[];
}

export interface FestivalUpdate {
  id: string;
  type: "speaker" | "show" | "release" | "world" | "logistics";
  title: string;
  world: string;
  dateOrTime?: string;
  summary: string;
}

export interface PitchContent {
  id: string;
  version: number;
  createdAt: string;
  personaId: string;
  personaName: string;
  updateTitle?: string;
  initialIdea?: string;
  channel: "instagram" | "linkedin" | "whatsapp";
  mote: string;
  headlineArte: string;
  legenda: string;
  formato: string;
  justificativaFormato: string;
  previousVersions?: {
    version: number;
    mote: string;
    headlineArte: string;
    legenda: string;
    formato: string;
    changeNote: string;
  }[];
}

export const INITIAL_PERSONAS: PersonaData[] = [
  {
    id: "p1",
    name: "Dra. Helena (Professores e Pesquisadores)",
    category: "professores",
    role: "Docentes e Cientistas do Ensino Superior / Técnico",
    count: 1046,
    pctOfAdults: 14.8,
    avgAge: 38.7,
    genderPct: "65.0% Feminino | 32.8% Masculino",
    topInterests: [
      { label: "Arte & Cultura", pct: 64.2 },
      { label: "Aprendizagem do Futuro", pct: 47.4 },
      { label: "Sustentabilidade", pct: 41.3 },
      { label: "Corpo & Mente", pct: 39.7 },
      { label: "Impacto Social", pct: 39.6 }
    ],
    topGoals: [
      { label: "Atividades Culturais", pct: 77.5 },
      { label: "Explorar Tendências / Conhecimento", pct: 77.0 },
      { label: "Apresentar Pesquisa Científica", pct: 11.5 }
    ],
    transport: [
      { label: "Carro Particular", pct: 60.6 },
      { label: "Transporte Público", pct: 14.5 },
      { label: "App / Táxi", pct: 11.8 }
    ],
    topLocations: ["Foz do Iguaçu (70.8%)", "Cascavel (4.0%)", "Toledo (2.6%)", "UNILA", "UNIOESTE"],
    keyPain: "Conectar pesquisa acadêmica à sociedade e mercado sem burocracia.",
    tone: "Inspirador, valorizador da ciência, institucional e acolhedor.",
    suggestedFormats: ["Artigo LinkedIn", "Carrossel Informativo", "Cards de Impacto"]
  },
  {
    id: "p2",
    name: "Lucas & Sofia (Universitários Alunos)",
    category: "alunos",
    role: "Estudantes de Graduação e Pós (≥ 18 anos)",
    count: 2268,
    pctOfAdults: 32.1,
    avgAge: 25.2,
    genderPct: "60.9% Feminino | 36.3% Masculino",
    topInterests: [
      { label: "Arte & Cultura", pct: 59.6 },
      { label: "Tecnologias do Futuro", pct: 41.8 },
      { label: "Corpo & Mente", pct: 38.7 },
      { label: "Impacto Social", pct: 33.1 },
      { label: "Geeks & Games", pct: 28.3 }
    ],
    topGoals: [
      { label: "Explorar Tendências / Futuro", pct: 76.9 },
      { label: "Atividades Culturais / Shows", pct: 64.3 },
      { label: "Ampliar Networking Profissional", pct: 41.8 }
    ],
    transport: [
      { label: "Transporte Público (Ônibus)", pct: 43.7 },
      { label: "Carro Particular", pct: 28.5 },
      { label: "Ônibus Oficial do Festival", pct: 7.2 }
    ],
    topLocations: ["UNILA (30.7%)", "UNIOESTE (11.6%)", "UDC (3.4%)", "Porto Belo", "Centro"],
    keyPain: "Horas complementares, conexão com mercado real e logística de transporte público até o Parquetec.",
    tone: "Jovem, dinâmico, direto, prático e sem formalidades.",
    suggestedFormats: ["Reels Curto / Roteiro", "Memes de Rotina", "Carrossel 'Como Chegar de Ônibus'"]
  },
  {
    id: "p3",
    name: "Carla & Família (Comunidade Foz do Iguaçu)",
    category: "comunidade",
    role: "Moradores locais, autônomos e famílias da Tríplice Fronteira",
    count: 2677,
    pctOfAdults: 37.9,
    avgAge: 35.8,
    genderPct: "60.2% Feminino | 38.0% Masculino",
    topInterests: [
      { label: "Arte & Cultura", pct: 63.5 },
      { label: "Corpo & Mente (Saúde / Bem-estar)", pct: 44.5 },
      { label: "Negócios & Marketing Local", pct: 40.5 },
      { label: "Tecnologias do Futuro", pct: 40.1 }
    ],
    topGoals: [
      { label: "Participar de Atividades Culturais", pct: 71.1 },
      { label: "Assistir aos Shows Nacionais Gratuitos", pct: 30.6 },
      { label: "Passeio em Família / Gastronomia", pct: 46.2 }
    ],
    transport: [
      { label: "Carro Particular", pct: 65.0 },
      { label: "App / Táxi", pct: 13.8 },
      { label: "Transporte Público", pct: 12.6 }
    ],
    topLocations: ["Centro (10.8%)", "Vila A (3.9%)", "Campos do Iguaçu", "Morumbi", "Porto Meira"],
    keyPain: "Acha que o festival 'é só pra gente de empresa ou cientista'. Precisa saber que é 100% gratuito e seguro.",
    tone: "Acolhedor, caloroso, descomplicado, festivo e sem jargões corporativos.",
    suggestedFormats: ["Reels de Gastronomia & Shows", "Guia Rápido da Família", "Cards Informativos"]
  },
  {
    id: "p4",
    name: "Rodrigo & Camila (Público Empresário & B2B)",
    category: "empresarios",
    role: "CEOs, Diretores, Donos de Negócios e Startupeiros",
    count: 501,
    pctOfAdults: 7.1,
    avgAge: 37.4,
    genderPct: "51.7% Feminino | 46.1% Masculino",
    topInterests: [
      { label: "Negócios & Marketing", pct: 73.7 },
      { label: "Arte & Cultura", pct: 45.3 },
      { label: "Tecnologias do Futuro / IA", pct: 43.3 },
      { label: "Corpo & Mente", pct: 34.9 },
      { label: "Turismo Sustentável", pct: 18.8 }
    ],
    topGoals: [
      { label: "Ampliar Networking Estratégico", pct: 59.5 },
      { label: "Buscar Oportunidades de Negócio", pct: 41.5 },
      { label: "Buscar Investimentos / Startups", pct: 19.0 }
    ],
    transport: [
      { label: "Carro Particular", pct: 73.5 },
      { label: "App / Táxi", pct: 13.0 }
    ],
    topLocations: ["Foz do Iguaçu (77.4%)", "Curitiba (3.0%)", "Cascavel (2.2%)", "Toledo"],
    keyPain: "Justificar o tempo investido com retorno claro (ROI, novas parcerias e conexões com startups).",
    tone: "Profissional, focado em resultados, dados de ecossistema e visão de futuro.",
    suggestedFormats: ["Artigo B2B LinkedIn", "Carrossel de Tendências", "Convite Direto Rodada de Negócios"]
  }
];

export const INITIAL_UPDATES: FestivalUpdate[] = [
  {
    id: "u1",
    type: "speaker",
    title: "Caito Maia (Chilli Beans & Shark Tank)",
    world: "Itaipu Parquetec",
    summary: "Palestra magna sobre inovação de marca, liderança empreendedora e novos mercados."
  },
  {
    id: "u2",
    type: "speaker",
    title: "Dr. Drauzio Varella",
    world: "Sapiens / Parquetec",
    summary: "Comunicação de saúde pública, longevidade e equilíbrio entre trabalho e bem-estar."
  },
  {
    id: "u3",
    type: "speaker",
    title: "Rapha do RH",
    world: "Sapiens",
    summary: "Tendências de carreira, inteligência artificial no trabalho e empregabilidade jovem."
  },
  {
    id: "u4",
    type: "speaker",
    title: "Monja Coen Roshi",
    world: "Corpo & Mente",
    summary: "Saúde mental, liderança ética e presença consciente nas relações humanas."
  },
  {
    id: "u5",
    type: "show",
    title: "Emicida (Show Nacional Confirmado)",
    world: "FIMS",
    summary: "Show ao vivo gratuito fechando a noite com cultura urbana, afeto e reflexão social."
  },
  {
    id: "u6",
    type: "show",
    title: "Duda Beat (Show Nacional Confirmado)",
    world: "FIMS",
    summary: "Apresentação ao vivo da 'rainha da sofrência pop' com ritmos eletrônicos e dançantes."
  },
  {
    id: "u7",
    type: "release",
    title: "FICiências bate recorde histórico com 4.300 inscrições e 500 projetos expostos",
    world: "FICiências",
    summary: "Jovens pesquisadores do Brasil, Paraguai e Argentina apresentam soluções científicas aplicadas."
  },
  {
    id: "u8",
    type: "world",
    title: "Mundo RME (Rede Mulher Empreendedora - Novidade 2026)",
    world: "RME",
    summary: "Espaço exclusivo para capacitação, mentorias e networking para mulheres que lideram negócios."
  }
];

export const INITIAL_PITCHES: PitchContent[] = [
  {
    id: "pitch-1",
    version: 1,
    createdAt: "16/10/2026 14:20",
    personaId: "p2",
    personaName: "Lucas & Sofia (Universitários Alunos)",
    updateTitle: "Rapha do RH + Mundo Sapiens",
    initialIdea: "Post bem-humorado de sobrevivência ao final de semestre na UNILA",
    channel: "instagram",
    mote: "Transforme o cansaço do final de semestre em horas complementares e networking de carreira real.",
    headlineArte: "Sobreviveu à entrega de TCC? O seu diploma precisa ver isso.",
    legenda: "Quem nunca perdeu o sono calculando as horas complementares que atire a primeira pedra! 🎓 No Mundo Sapiens do Festival Iguassu Inova 2026, além de garantir o certificado oficial do Itaipu Parquetec, você vai trocar ideia ao vivo com referências como Rapha do RH sobre o futuro das profissões e IA no mercado.\n\nE o melhor: o festival é 100% gratuito e tem linhas de transporte público direto para o portão do evento.\n\nGaranta seu ingresso digital gratuito no link da bio pela Yazo Tickets!\n\n#FestivalIguassuInova #MundoSapiens #UniversitariosFoz #ItaipuParquetec",
    formato: "Carrossel de 4 Telas (Meme inicial + Dicas Práticas)",
    justificativaFormato: "Escolhemos Carrossel porque 76.9% dos 2.268 alunos inscritos buscam explorar tendências de carreira e 43.7% dependem de transporte público, permitindo reter atenção com humor e entregar utilidade logística."
  },
  {
    id: "pitch-2",
    version: 2,
    createdAt: "16/10/2026 15:45",
    personaId: "p3",
    personaName: "Carla & Família (Comunidade Foz do Iguaçu)",
    updateTitle: "Duda Beat (Show Nacional Confirmado)",
    initialIdea: "Lembrar os moradores de Foz que o show é gratuito e tem espaço família",
    channel: "instagram",
    mote: "A melhor programação cultural gratuita do ano no quintal da comunidade de Foz.",
    headlineArte: "Duda Beat de graça em Foz do Iguaçu? Pode acreditar.",
    legenda: "Você não leu errado: um dos maiores shows do Brasil vai rolar aqui em Foz com entrada franca! 🎶 O Festival Iguassu Inova reuniu música, feira gastronômica e muita diversão para você curtir com a família ou com os amigos.\n\nNão precisa pagar nada, só emitir o passaporte gratuito pelo celular na Yazo Tickets e apresentar na entrada do Itaipu Parquetec.\n\nMarca aqui quem vai com você curtir essa noite inesquecível! 👇\n\n#FestivalIguassuInova #FIMS #DudaBeatEmFoz #CulturaFoz",
    formato: "Reels Curto com trecho musical e chamada em texto",
    justificativaFormato: "Reels atinge diretamente o topo do funil do Instagram, onde 68.1% dos moradores de Foz souberam do festival e 71.1% declararam ter atividades culturais e shows como objetivo central.",
    previousVersions: [
      {
        version: 1,
        mote: "Show nacional de música brasileira acessível a todos os moradores.",
        headlineArte: "Venha ver o grande show da Duda Beat no Parquetec.",
        legenda: "O Festival traz grandes atrações. Emitam seus ingressos na Yazo.",
        formato: "Card Estático Simples",
        changeNote: "O conteudista solicitou formato Reels mais chamativo destacando 'de graça' na primeira tela."
      }
    ]
  }
];
