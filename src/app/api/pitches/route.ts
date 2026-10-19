import { NextRequest, NextResponse } from "next/server";
import { PitchContentSchema } from "@/lib/schemas";
import fs from "fs";
import path from "path";
import { z } from "zod";

const PITCHES_PATH = path.join(process.cwd(), "src", "data", "saved-pitches.json");

function getSavedPitches(): any[] {
  if (!fs.existsSync(PITCHES_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(PITCHES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao ler saved-pitches.json:", err);
    return [];
  }
}

function savePitches(pitches: any[]): void {
  fs.writeFileSync(PITCHES_PATH, JSON.stringify(pitches, null, 2), "utf-8");
}

// GET /api/pitches -> Retorna o histórico de pautas salvas
export async function GET() {
  try {
    const pitches = getSavedPitches();
    return NextResponse.json({ success: true, pitches });
  } catch (error) {
    console.error("Erro ao buscar pautas:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar histórico de pautas." },
      { status: 500 }
    );
  }
}

// POST /api/pitches -> Salva novas pautas ou uma lista de pautas no histórico (Batch / Single)
const SavePitchesBodySchema = z.union([
  PitchContentSchema,
  z.array(PitchContentSchema)
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = SavePitchesBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados da pauta inválidos.",
          details: validation.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        },
        { status: 400 }
      );
    }

    const currentPitches = getSavedPitches();
    const newItems = Array.isArray(validation.data) ? validation.data : [validation.data];

    // Evita duplicatas por ID e insere no topo do histórico
    const existingIds = new Set(currentPitches.map((p) => p.id));
    const filteredNewItems = newItems.filter((item) => !existingIds.has(item.id));
    
    // Lista atualizada com novas pautas no topo
    const updatedList = [...filteredNewItems, ...currentPitches];
    savePitches(updatedList);

    return NextResponse.json({
      success: true,
      message: `${filteredNewItems.length} pauta(s) salva(s) com sucesso no histórico.`,
      pitches: updatedList
    });
  } catch (error) {
    console.error("Erro ao salvar pauta(s):", error);
    return NextResponse.json(
      { success: false, error: "Erro ao salvar no banco de dados local." },
      { status: 500 }
    );
  }
}

// PUT /api/pitches -> Atualiza uma pauta existente (ex: restauração de versão ou edição manual)
const UpdatePitchSchema = z.object({
  id: z.string().trim().min(1),
  fields: PitchContentSchema.partial()
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = UpdatePitchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Parâmetros de atualização inválidos." },
        { status: 400 }
      );
    }

    const { id, fields } = validation.data;
    const currentPitches = getSavedPitches();
    const index = currentPitches.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Pauta não encontrada no histórico." },
        { status: 404 }
      );
    }

    // Proteção contra Mass Assignment — aceita apenas campos permitidos em fields
    currentPitches[index] = {
      ...currentPitches[index],
      ...fields
    };

    savePitches(currentPitches);

    return NextResponse.json({
      success: true,
      message: "Pauta atualizada no histórico.",
      pitch: currentPitches[index]
    });
  } catch (error) {
    console.error("Erro ao atualizar pauta:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar pauta no histórico." },
      { status: 500 }
    );
  }
}

// DELETE /api/pitches?id=... -> Apaga uma pauta específica (ou todas se id=all) do banco de dados local
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID da pauta não informado para exclusão." },
        { status: 400 }
      );
    }

    const currentPitches = getSavedPitches();

    if (id === "all") {
      savePitches([]);
      return NextResponse.json({
        success: true,
        message: "Todas as pautas foram removidas do histórico local."
      });
    }

    const exists = currentPitches.some((p) => p.id === id);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: "Pauta não encontrada no banco de dados." },
        { status: 404 }
      );
    }

    const updatedPitches = currentPitches.filter((p) => p.id !== id);
    savePitches(updatedPitches);

    return NextResponse.json({
      success: true,
      message: "Pauta excluída permanentemente do banco de dados local.",
      pitches: updatedPitches
    });
  } catch (error) {
    console.error("Erro ao excluir pauta:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao excluir pauta." },
      { status: 500 }
    );
  }
}

