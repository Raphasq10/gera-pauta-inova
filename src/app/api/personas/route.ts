import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PersonaFormSchema } from "@/lib/schemas";
import { PersonaData } from "@/data/mockData";

const dbPath = path.join(process.cwd(), "src/data/personas-2026.json");

function getPersonasFromDisk(): PersonaData[] {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Erro ao ler personas-2026.json:", err);
  }
  return [];
}

function savePersonasToDisk(personas: PersonaData[]) {
  fs.writeFileSync(dbPath, JSON.stringify(personas, null, 2), "utf-8");
}

// GET: Retorna as personas do banco local
export async function GET() {
  const personas = getPersonasFromDisk();
  return NextResponse.json({ success: true, personas });
}

// POST: Cria uma nova persona (protegido contra Mass Assignment com Zod)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = PersonaFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, role, category, keyPain, tone, suggestedFormats } = result.data;
    const personas = getPersonasFromDisk();

    const newPersona: PersonaData = {
      id: `p-${Date.now()}`,
      name,
      role,
      category: category as any,
      count: 0,
      pctOfAdults: 0,
      avgAge: 30,
      genderPct: "Não mapeado ainda",
      topInterests: [{ label: "A definir por planilha", pct: 100 }],
      topGoals: [{ label: "A definir por planilha", pct: 100 }],
      transport: [{ label: "A definir", pct: 100 }],
      topLocations: ["Foz do Iguaçu"],
      keyPain,
      tone,
      suggestedFormats
    };

    personas.push(newPersona);
    savePersonasToDisk(personas);

    return NextResponse.json({ success: true, persona: newPersona });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erro interno ao salvar nova persona." },
      { status: 500 }
    );
  }
}

// PUT: Atualiza uma persona existente (apenas campos permitidos)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = PersonaFormSchema.safeParse(body);

    if (!result.success || !body.id) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos ou ID da persona ausente." },
        { status: 400 }
      );
    }

    const { id, name, role, category, keyPain, tone, suggestedFormats } = body;
    const personas = getPersonasFromDisk();
    const index = personas.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Persona não encontrada no banco local." },
        { status: 404 }
      );
    }

    // Atualização explícita (prevenção contra mass assignment)
    personas[index] = {
      ...personas[index],
      name: name.trim(),
      role: role.trim(),
      category,
      keyPain: keyPain.trim(),
      tone: tone.trim(),
      suggestedFormats
    };

    savePersonasToDisk(personas);

    return NextResponse.json({ success: true, persona: personas[index] });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar persona." },
      { status: 500 }
    );
  }
}
