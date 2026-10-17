import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FestivalUpdateFormSchema } from "@/lib/schemas";
import { FestivalUpdate } from "@/data/mockData";

const dbPath = path.join(process.cwd(), "src/data/festival-context.json");

function getUpdatesFromDisk(): FestivalUpdate[] {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Erro ao ler festival-context.json:", err);
  }
  return [];
}

function saveUpdatesToDisk(updates: FestivalUpdate[]) {
  fs.writeFileSync(dbPath, JSON.stringify(updates, null, 2), "utf-8");
}

// GET: Retorna a lista de novidades/contexto do festival
export async function GET() {
  const updates = getUpdatesFromDisk();
  return NextResponse.json({ success: true, updates });
}

// POST: Cadastra uma nova atração/release/aviso (validado por Zod)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = FestivalUpdateFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Proteção contra mass assignment (apenas campos permitidos)
    const { type, title, world, dateOrTime, summary } = result.data;
    const updates = getUpdatesFromDisk();

    const newUpdate: FestivalUpdate = {
      id: `up-${Date.now()}`,
      type,
      title: title.trim(),
      world: world.trim(),
      dateOrTime: dateOrTime ? dateOrTime.trim() : undefined,
      summary: summary.trim()
    };

    // Adiciona a nova atualização no topo
    updates.unshift(newUpdate);
    saveUpdatesToDisk(updates);

    console.log(`[Hub Festival] Nova atualização cadastrada: "${newUpdate.title}" (${newUpdate.type} / ${newUpdate.world})`);

    return NextResponse.json({ success: true, update: newUpdate });
  } catch (error) {
    console.error("Erro ao salvar atualização no Hub:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao cadastrar novidade no Hub do Festival." },
      { status: 500 }
    );
  }
}

// DELETE: Remove uma atualização pelo ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID não fornecido." }, { status: 400 });
    }

    let updates = getUpdatesFromDisk();
    const exists = updates.some((u) => u.id === id);

    if (!exists) {
      return NextResponse.json({ success: false, message: "Item não encontrado." }, { status: 404 });
    }

    updates = updates.filter((u) => u.id !== id);
    saveUpdatesToDisk(updates);

    return NextResponse.json({ success: true, message: "Atualização removida com sucesso!" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erro interno ao remover item do Hub." },
      { status: 500 }
    );
  }
}
