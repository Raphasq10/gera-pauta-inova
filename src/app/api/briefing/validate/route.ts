import { NextRequest, NextResponse } from "next/server";
import { BriefingFormSchema } from "@/lib/schemas";
import fs from "fs";
import path from "path";

// Caminhos dos bancos de dados locais
const PERSONAS_PATH = path.join(process.cwd(), "src", "data", "personas-2026.json");
const FESTIVAL_CONTEXT_PATH = path.join(process.cwd(), "src", "data", "festival-context.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validação estrita via Zod (anti-XSS, limites e enums)
    const validation = BriefingFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do briefing inválidos",
          details: validation.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }

    const briefing = validation.data;

    // 2. Verificar se a Persona existe no banco de dados local
    let personas = [];
    if (fs.existsSync(PERSONAS_PATH)) {
      personas = JSON.parse(fs.readFileSync(PERSONAS_PATH, "utf-8"));
    }
    const personaFound = personas.find((p: any) => p.id === briefing.personaId);
    if (!personaFound) {
      return NextResponse.json(
        {
          success: false,
          error: "A persona selecionada não existe no banco de dados."
        },
        { status: 404 }
      );
    }

    // 3. Verificar se a Atualização do Hub existe (caso não seja "none")
    let updateFound = null;
    if (briefing.updateId && briefing.updateId !== "none") {
      let updates = [];
      if (fs.existsSync(FESTIVAL_CONTEXT_PATH)) {
        updates = JSON.parse(fs.readFileSync(FESTIVAL_CONTEXT_PATH, "utf-8"));
      }
      updateFound = updates.find((u: any) => u.id === briefing.updateId);
      if (!updateFound) {
        return NextResponse.json(
          {
            success: false,
            error: "A atração/novidade selecionada não foi encontrada no Hub do Festival."
          },
          { status: 404 }
        );
      }
    }

    // 4. Retorno enriquecido pronto para ser consumido pelo motor de IA (Feature 4)
    return NextResponse.json({
      success: true,
      mode: briefing.initialIdea && briefing.initialIdea.length > 0 ? "guided" : "auto",
      validatedBriefing: {
        ...briefing,
        personaName: personaFound.name,
        personaSegment: personaFound.role,
        personaKeyPain: personaFound.keyPain,
        personaTone: personaFound.tone,
        updateTitle: updateFound ? updateFound.title : "Geral do Festival",
        updateWorld: updateFound ? updateFound.world : "Todos os Mundos"
      }
    });
  } catch (error: any) {
    console.error("Erro ao validar briefing:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor ao validar briefing." },
      { status: 500 }
    );
  }
}
