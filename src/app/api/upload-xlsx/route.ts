import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { processYazoSpreadsheet } from "@/lib/xlsx-processor";
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from "@/lib/schemas";

const dbPath = path.join(process.cwd(), "src/data/personas-2026.json");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // 1. Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Arquivo muito grande. O limite máximo é de 15MB." },
        { status: 400 }
      );
    }

    // 2. Validação de extensão
    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!isValidExtension) {
      return NextResponse.json(
        { success: false, message: "Formato inválido. Apenas planilhas .xlsx ou .xls são permitidas." },
        { status: 400 }
      );
    }

    // 3. Processamento no servidor
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const startTime = Date.now();
    const result = processYazoSpreadsheet(buffer);
    const durationMs = Date.now() - startTime;

    // 4. Salvar personas atualizadas no banco local em disco
    fs.writeFileSync(dbPath, JSON.stringify(result.personas, null, 2), "utf-8");

    // Registro seguro de log (sem dados pessoais)
    console.log(
      `[Upload XLSX] Processamento concluído em ${durationMs}ms: ${result.totalRows} linhas, ${result.totalValidAdults} adultos, ${result.totalMinorsDiscarded} menores descartados.`
    );

    return NextResponse.json({
      success: true,
      message: `Planilha processada em ${durationMs}ms! ${result.totalMinorsDiscarded} menores de idade descartados com sucesso.`,
      durationMs,
      totalRows: result.totalRows,
      totalValidAdults: result.totalValidAdults,
      totalMinorsDiscarded: result.totalMinorsDiscarded,
      personas: result.personas
    });
  } catch (error) {
    console.error("Erro no processamento da planilha:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao ler a planilha. Verifique se o arquivo segue o padrão de colunas da Yazo Tickets."
      },
      { status: 500 }
    );
  }
}
