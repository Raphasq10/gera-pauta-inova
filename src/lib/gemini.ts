import { GoogleGenAI } from "@google/genai";

/**
 * Chama a API oficial do Google Gemini utilizando a nova Interactions API (2026):
 * Documentação oficial: https://ai.google.dev/gemini-api/docs/api-key?hl=pt-br
 * Modelos: gemini-3.8-flash, gemini-4-argon, gemini-3.8-pro
 */
export async function callGoogleGeminiInteractions(apiKey: string, prompt: string): Promise<{ text: string; model: string }> {
  const models = ["gemini-3.8-flash", "gemini-4-argon", "gemini-3.8-pro"];
  let lastErr: any = null;

  // 1. Tenta via SDK oficial @google/genai (Interactions API)
  const ai = new GoogleGenAI({ apiKey });

  for (const model of models) {
    try {
      console.log(`[Google Interactions SDK] Chamando modelo: ${model}...`);
      const interaction: any = await ai.interactions.create({
        model,
        input: prompt
      });

      const outputText = interaction?.output_text || "";
      if (outputText.trim()) {
        console.log(`[Google Interactions SDK] SUCESSO com modelo ${model}!`);
        return { text: outputText, model };
      }
    } catch (err: any) {
      console.warn(`[Google Interactions SDK] Falha no modelo ${model}:`, err?.message || err);
      lastErr = err;
    }
  }

  // 2. Fallback resiliente via REST direto (conforme documentado na Google AI for Developers)
  for (const model of models) {
    try {
      console.log(`[Google REST Interactions] Tentando chamada REST direta para ${model}...`);
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model,
          input: prompt
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Google REST Interactions] Erro HTTP ${res.status} para ${model}:`, errorText);
        continue;
      }

      const data = await res.json();
      let text = data.output_text || "";
      if (!text && Array.isArray(data.steps)) {
        for (let i = data.steps.length - 1; i >= 0; i--) {
          const step = data.steps[i];
          if (step.content || step.output || step.text) {
            text = step.content || step.output || step.text;
            break;
          }
        }
      }

      if (text.trim()) {
        console.log(`[Google REST Interactions] SUCESSO com modelo ${model}!`);
        return { text, model };
      }
    } catch (restErr: any) {
      console.warn(`[Google REST Interactions] Falha na chamada REST para ${model}:`, restErr?.message || restErr);
      lastErr = restErr;
    }
  }

  throw lastErr || new Error("Nenhum modelo Gemini da Interactions API respondeu com sucesso.");
}
