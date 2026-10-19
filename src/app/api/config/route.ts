import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  let hasServerKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5
  );

  // Verificação fallback para ambiente local (.env.local) se process.env ainda não leu
  if (!hasServerKey) {
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
        if (match && match[1] && match[1].trim().length > 5) {
          hasServerKey = true;
        }
      }
    } catch {
      // safe ignore
    }
  }

  return NextResponse.json({
    success: true,
    hasServerKey
  });
}
