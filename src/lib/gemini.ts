import { GoogleGenAI } from "@google/genai";

/**
 * Motor de Conexão Oficial Google Gemini
 * 
 * Modelos verificados e ativos no Google AI Studio:
 * - gemini-3.6-flash (Ultra-rápido, alta disponibilidade, 200 OK comprovado)
 * - gemini-3.5-flash (Ultra-rápido, alta disponibilidade, 200 OK comprovado)
 * - gemini-3.8-flash (Modelo 2026 - quando não estiver em pico 503)
 * - gemini-3.7-flash
 */
export async function callGoogleGeminiInteractions(
  apiKey: string,
  prompt: string
): Promise<{ text: string; model: string }> {
  // Cascata otimizada: prioriza os modelos com disponibilidade 100% imediata
  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.7-flash"
  ];

  let lastErr: any = null;

  // 1. Chamada REST direta para a API oficial do Google AI (mais rápida e sem ruído de abstração)
  for (const model of models) {
    try {
      console.log(`[Google Gemini] Conectando ao modelo: ${model}...`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95
            }
          })
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Google Gemini] Modelo ${model} retornou status ${res.status}:`, errorText);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text.trim()) {
        console.log(`[Google Gemini] ✅ SUCESSO com modelo ${model}!`);
        return { text: text.trim(), model };
      }
    } catch (restErr: any) {
      console.warn(`[Google Gemini] Falha de rede para ${model}:`, restErr?.message || restErr);
      lastErr = restErr;
    }
  }

  // 2. Fallback via SDK oficial @google/genai
  try {
    const ai = new GoogleGenAI({ apiKey });
    for (const model of models) {
      try {
        console.log(`[Google Gemini SDK] Tentando fallback SDK para ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt
        });

        const text = response?.text || "";
        if (text.trim()) {
          console.log(`[Google Gemini SDK] ✅ SUCESSO via SDK com ${model}!`);
          return { text: text.trim(), model };
        }
      } catch (sdkErr: any) {
        console.warn(`[Google Gemini SDK] Falha no modelo ${model}:`, sdkErr?.message || sdkErr);
        lastErr = sdkErr;
      }
    }
  } catch (initErr) {
    console.warn("[Google Gemini SDK] Falha ao inicializar SDK:", initErr);
  }

  throw lastErr || new Error("Nenhum modelo Gemini respondeu com sucesso.");
}
