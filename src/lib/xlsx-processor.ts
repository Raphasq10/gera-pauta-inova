import * as XLSX from "xlsx";
import { PersonaData } from "@/data/mockData";

export interface ProcessedDatasetResult {
  totalRows: number;
  totalValidAdults: number;
  totalMinorsDiscarded: number;
  personas: PersonaData[];
}

function calculateAge(dobStr: any): number | null {
  if (!dobStr) return null;
  const d = new Date(dobStr);
  if (isNaN(d.getTime())) return null;
  const ref = new Date("2026-11-25"); // Data do Festival
  let age = ref.getFullYear() - d.getFullYear();
  const m = ref.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < d.getDate())) age--;
  return age;
}

function parseJsonArray(val: any): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val.toString()];
  } catch {
    return [val.toString()];
  }
}

export function processYazoSpreadsheet(buffer: Buffer): ProcessedDatasetResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Linhas válidas (ignorando cabeçalho na linha 0)
  const rows = rawData.slice(1).filter((r) => r && r.length > 0 && r[0]);
  let minorsCount = 0;

  // FILTRO OBRIGATÓRIO (RN-01): Exclusão de menores de 18 anos e ingressos cancelados
  const adultRows = rows.filter((r) => {
    if (r[9] !== "Válido") return false;
    const ticketName = (r[8] || "").toString();
    if (ticketName.includes("menor de 14 anos")) {
      minorsCount++;
      return false;
    }
    if (r[25] === "Sim") {
      minorsCount++;
      return false;
    }
    const age = calculateAge(r[16]);
    if (age !== null && age < 18) {
      minorsCount++;
      return false;
    }
    return true;
  });

  const totalAdults = adultRows.length || 1;

  // Segmentação nos 4 Grupos
  const g1 = adultRows.filter((r) => r[29] === "Professor(a) / Educador(a)" || r[29] === "Pesquisador(a) / Cientista");
  const g2 = adultRows.filter((r) => r[29] === "Estudante");
  const g3 = adultRows.filter(
    (r) =>
      r[21] === "Sim" &&
      (r[29] === "Entusiasta / Comunidade" ||
        r[29] === "Profissional autonomo e/ou freelancer" ||
        r[29] === "Profissional de empresa privada" ||
        r[29] === "Profissional do setor público" ||
        r[29] === "Organizacao da sociedade civil / terceiro setor")
  );
  const g4 = adultRows.filter(
    (r) => r[29] === "Empresario(a) / Executivo(a)" || r[29] === "Empreendedor(a) / Startupeiro(a)" || r[29] === "Investidor(a)"
  );

  function aggregateStats(groupRows: any[][]): {
    topInterests: { label: string; pct: number }[];
    topGoals: { label: string; pct: number }[];
    transport: { label: string; pct: number }[];
    avgAge: number;
    femalePct: number;
    topLocations: string[];
  } {
    const total = groupRows.length || 1;
    const interestsMap: Record<string, number> = {};
    const goalsMap: Record<string, number> = {};
    const transpMap: Record<string, number> = {};
    const citiesMap: Record<string, number> = {};
    let sumAge = 0;
    let ageCount = 0;
    let females = 0;

    groupRows.forEach((r) => {
      // Gênero
      const g = (r[13] || "").toString().trim();
      if (g === "Feminino") females++;

      // Idade
      const age = calculateAge(r[16]);
      if (age !== null && age >= 18 && age <= 100) {
        sumAge += age;
        ageCount++;
      }

      // Interesses (col 41)
      parseJsonArray(r[41]).forEach((item) => {
        if (item) interestsMap[item] = (interestsMap[item] || 0) + 1;
      });

      // Objetivos (col 42)
      parseJsonArray(r[42]).forEach((item) => {
        if (item) goalsMap[item] = (goalsMap[item] || 0) + 1;
      });

      // Transporte (col 45)
      const t = (r[45] || "Outro").toString().trim();
      if (t) transpMap[t] = (transpMap[t] || 0) + 1;

      // Cidades / Instituições
      const city = (r[19] || "Foz do Iguaçu").toString().trim();
      if (city) citiesMap[city] = (citiesMap[city] || 0) + 1;
    });

    const formatSort = (map: Record<string, number>, max = 5) =>
      Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([label, count]) => ({
          label,
          pct: parseFloat(((count / total) * 100).toFixed(1))
        }));

    return {
      topInterests: formatSort(interestsMap, 5),
      topGoals: formatSort(goalsMap, 3),
      transport: formatSort(transpMap, 3),
      avgAge: ageCount ? parseFloat((sumAge / ageCount).toFixed(1)) : 32.0,
      femalePct: parseFloat(((females / total) * 100).toFixed(1)),
      topLocations: Object.entries(citiesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([loc, count]) => `${loc} (${((count / total) * 100).toFixed(0)}%)`)
    };
  }

  const s1 = aggregateStats(g1);
  const s2 = aggregateStats(g2);
  const s3 = aggregateStats(g3);
  const s4 = aggregateStats(g4);

  const personas: PersonaData[] = [
    {
      id: "p1",
      name: "Dra. Helena (Professores e Pesquisadores)",
      category: "professores",
      role: "Docentes e Cientistas do Ensino Superior / Técnico",
      count: g1.length,
      pctOfAdults: parseFloat(((g1.length / totalAdults) * 100).toFixed(1)),
      avgAge: s1.avgAge,
      genderPct: `${s1.femalePct}% Feminino | ${(100 - s1.femalePct).toFixed(1)}% Outros`,
      topInterests: s1.topInterests,
      topGoals: s1.topGoals,
      transport: s1.transport,
      topLocations: s1.topLocations,
      keyPain: "Conectar pesquisa acadêmica à sociedade e mercado sem burocracia.",
      tone: "Inspirador, valorizador da ciência, institucional e acolhedor.",
      suggestedFormats: ["Artigo LinkedIn", "Carrossel Informativo", "Cards de Impacto"]
    },
    {
      id: "p2",
      name: "Lucas & Sofia (Universitários Alunos)",
      category: "alunos",
      role: "Estudantes de Graduação e Pós (≥ 18 anos)",
      count: g2.length,
      pctOfAdults: parseFloat(((g2.length / totalAdults) * 100).toFixed(1)),
      avgAge: s2.avgAge,
      genderPct: `${s2.femalePct}% Feminino | ${(100 - s2.femalePct).toFixed(1)}% Outros`,
      topInterests: s2.topInterests,
      topGoals: s2.topGoals,
      transport: s2.transport,
      topLocations: s2.topLocations,
      keyPain: "Horas complementares, conexão com mercado real e logística de transporte público até o Parquetec.",
      tone: "Jovem, dinâmico, direto, prático e sem formalidades.",
      suggestedFormats: ["Reels Curto / Roteiro", "Memes de Rotina", "Carrossel 'Como Chegar de Ônibus'"]
    },
    {
      id: "p3",
      name: "Carla & Família (Comunidade Foz do Iguaçu)",
      category: "comunidade",
      role: "Moradores locais, autônomos e famílias da Tríplice Fronteira",
      count: g3.length,
      pctOfAdults: parseFloat(((g3.length / totalAdults) * 100).toFixed(1)),
      avgAge: s3.avgAge,
      genderPct: `${s3.femalePct}% Feminino | ${(100 - s3.femalePct).toFixed(1)}% Outros`,
      topInterests: s3.topInterests,
      topGoals: s3.topGoals,
      transport: s3.transport,
      topLocations: s3.topLocations,
      keyPain: "Acha que o festival 'é só pra gente de empresa ou cientista'. Precisa saber que é 100% gratuito e seguro.",
      tone: "Acolhedor, caloroso, descomplicado, festivo e sem jargões corporativos.",
      suggestedFormats: ["Reels de Gastronomia & Shows", "Guia Rápido da Família", "Cards Informativos"]
    },
    {
      id: "p4",
      name: "Rodrigo & Camila (Público Empresário & B2B)",
      category: "empresarios",
      role: "CEOs, Diretores, Donos de Negócios e Startupeiros",
      count: g4.length,
      pctOfAdults: parseFloat(((g4.length / totalAdults) * 100).toFixed(1)),
      avgAge: s4.avgAge,
      genderPct: `${s4.femalePct}% Feminino | ${(100 - s4.femalePct).toFixed(1)}% Outros`,
      topInterests: s4.topInterests,
      topGoals: s4.topGoals,
      transport: s4.transport,
      topLocations: s4.topLocations,
      keyPain: "Justificar o tempo investido com retorno claro (ROI, novas parcerias e conexões com startups).",
      tone: "Profissional, focado em resultados, dados de ecossistema e visão de futuro.",
      suggestedFormats: ["Artigo B2B LinkedIn", "Carrossel de Tendências", "Convite Direto Rodada de Negócios"]
    }
  ];

  return {
    totalRows: rows.length,
    totalValidAdults: adultRows.length,
    totalMinorsDiscarded: minorsCount,
    personas
  };
}
