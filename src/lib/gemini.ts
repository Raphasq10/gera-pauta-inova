import { GoogleGenAI } from "@google/genai";

/**
 * Conexão Oficial Google AI Studio / Gemini API
 * Conforme documentação oficial: https://ai.google.dev/gemini-api/docs/get-started
 * 
 * Modelos ativos auditados na chave do usuário:
 * 1. gemini-3.8-flash (Modelo principal de 2026)
 * 2. gemini-3.6-flash (Disponibilidade imediata / 200 OK)
 * 3. gemini-flash-lite-latest (Ativo no Free Tier)
 * 4. gemini-3.5-flash-lite (Ativo no Free Tier)
 * 5. gemini-3-flash-preview (Ativo no Free Tier)
 * 6. gemma-4-31b-it (Ativo no Free Tier)
 */
export async function callGoogleGeminiInteractions(
  apiKey: string,
  prompt: string
): Promise<{ text: string; model: string }> {
  const models = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
    "gemma-4-31b-it"
  ];

  let lastErr: any = null;

  // 1. Tenta chamada direta oficial REST v1beta (generateContent)
  for (const model of models) {
    try {
      console.log(`[Google Gemini API] Solicitando geração para ${model}...`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7
            }
          })
        }
      );

      if (res.status === 200) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text.trim()) {
          console.log(`[Google Gemini API] ✅ Resposta gerada com sucesso pelo modelo ${model}!`);
          return { text: text.trim(), model };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Google Gemini API] Modelo ${model} indisponível (${res.status}): ${errMsg.slice(0, 100)}`);
      }
    } catch (err: any) {
      console.warn(`[Google Gemini API] Erro ao consultar ${model}:`, err?.message || err);
      lastErr = err;
    }
  }

  // 2. Fallback via SDK oficial @google/genai (Interactions API / generateContent)
  try {
    const ai = new GoogleGenAI({ apiKey });
    for (const model of ["gemini-3.8-flash", "gemini-3.6-flash"]) {
      try {
        console.log(`[Google SDK] Tentando interactions.create com ${model}...`);
        const interaction: any = await ai.interactions.create({
          model,
          input: prompt
        });
        const out = interaction?.output_text || "";
        if (out.trim()) {
          console.log(`[Google SDK] ✅ Sucesso via Interactions SDK com ${model}!`);
          return { text: out.trim(), model };
        }
      } catch (sdkErr: any) {
        console.warn(`[Google SDK] Falha com ${model}:`, sdkErr?.message || sdkErr);
        lastErr = sdkErr;
      }
    }
  } catch (initErr) {
    console.warn("[Google SDK] Erro ao inicializar SDK:", initErr);
  }

  throw lastErr || new Error("Nenhum modelo Gemini respondeu com sucesso.");
}
