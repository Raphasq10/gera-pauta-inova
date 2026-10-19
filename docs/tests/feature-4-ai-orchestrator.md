# Testes Manuais: Feature 4 - Orquestrador de IA e Renderizador de Cards Estruturados

**Data da execução:** 19/10/2026  
**Responsável:** Engenheiro Full-Stack / Arquiteto de Software  
**Status:** APROVADO ✅

---

## 1. Objetivo da Feature
Permitir a geração de conteúdos para redes sociais utilizando o motor oficial de IA do **Google Gemini 2.5 Flash** (via `@google/genai`) ou o **Motor Local Inteligente (Fallback Estruturado)** com dados reais dos 7.065 inscritos adultos de 2026, renderizando o resultado em cards divididos rigorosamente nos 4 blocos obrigatórios:
1. **Mote do conteúdo** (Conceito + conexão com a dor da persona)
2. **Headline da Arte** (Texto curto de capa / gancho de Reels)
3. **Legenda para redes** (Copy completa com quebra de objeções + CTA)
4. **Formato + Justificativa com Dados** (Citação dos percentuais reais da persona)

---

## 2. Cenários de Teste Executados

### Cenário 1: Caminho Feliz — Motor Local Inteligente (Sem Chave Externa)
- **Entrada:**
  - Persona: *Lucas Rocha (Universitário Alunos)*
  - Foco: *[Mundo Conexões] Palestra Monja Coen*
  - Canal: *Instagram*
  - Linha Editorial: *Terça IA/Futuro*
  - Qtd: *2 Pautas*
  - Chave de API: *Vazia*
- **Ação:** Clicar em "Gerar 2 Pauta(s) com IA".
- **Resultado Esperado:**
  - O sistema aciona o endpoint `POST /api/generate`.
  - Como a chave está vazia, o Motor Local Inteligente é ativado instantaneamente.
  - Notificação informativa: *"Pautas geradas com sucesso via Motor Inteligente Local (Base Oficial 2026)..."*.
  - Exibição de 2 cards estruturados contendo exatamente os 4 blocos com os dados de estudantes (83.3% transporte público/carona, 80.8% IA).
- **Resultado Obtido:** ✅ PASSOU. Geração imediata com todos os 4 blocos preenchidos e embasados.

---

### Cenário 2: Caminho Feliz — Integração com Google Gemini 2.5 Flash
- **Entrada:**
  - Clicar em "⚙️ Inserir Chave Gemini".
  - Inserir uma API Key válida do Google AI Studio no campo dedicado.
  - Selecionar Persona *Juliana Mendes (Comunidade Foz)* e clicar em gerar.
- **Resultado Esperado:**
  - O endpoint `/api/generate` envia o prompt estruturado com schema JSON ao modelo `gemini-2.5-flash`.
  - O badge do motor no topo atualiza para *"Motor: Google Gemini 2.5 Flash"*.
  - Pautas retornam formatadas com criatividade expandida pelo LLM e métricas dos moradores de Foz.
- **Resultado Obtido:** ✅ PASSOU. Suporte nativo à SDK `@google/genai` com retorno JSON formatado.

---

### Cenário 3: Resiliência e Fallback com Chave Inválida / Cota Excedida
- **Entrada:**
  - Inserir uma chave propositalmente incorreta (ex: `AIzaFakeKey12345`).
  - Clicar em gerar pautas.
- **Resultado Esperado:**
  - A API captura o erro do Gemini em bloco `try/catch`.
  - O sistema NÃO quebra nem exibe tela preta/erro técnico; automaticamente aciona o Motor Local Inteligente como fallback de segurança.
  - Notificação amigável avisa o usuário que o Motor Local foi acionado para não interromper seu trabalho.
- **Resultado Obtido:** ✅ PASSOU. Resiliência comprovada com fallback imediato e pautas entregues.

---

### Cenário 4: Botão "Copiar Conteúdo"
- **Entrada:** Clicar no botão "Copiar Pauta" de qualquer card gerado.
- **Resultado Esperado:**
  - O texto completo formatado com emojis, mote, headline, legenda e justificativa é copiado para o clipboard do sistema operacional.
  - O botão exibe feedback visual imediato ("Copiado!" com ícone verde) e toast de confirmação.
- **Resultado Obtido:** ✅ PASSOU. Texto copiado perfeitamente formatado para colar direto no WhatsApp ou Trello.

---

### Cenário 5: Prevenção contra Duplo Clique (Anti-Race Condition)
- **Entrada:** Cliques repetidos em rápida sucessão no botão "Gerar Pautas com IA".
- **Resultado Esperado:**
  - O botão entra em estado `disabled={isLoading}` no primeiro clique.
  - O texto muda para "Validando Briefing e Gerando..." com spinner giratório.
- **Resultado Obtido:** ✅ PASSOU. Impossível disparar múltiplas requisições simultâneas.

---

### Cenário 6: Segurança contra Injeção de Scripts (Anti-XSS) e Mass Assignment
- **Entrada:** Inserção de payload malicioso no campo de ideia inicial (`<script>window.location='malicious.com'</script>`) e parâmetros extras arbitrários no JSON da requisição (`role: 'admin'`).
- **Resultado Esperado:**
  - Apenas os campos autorizados pelo `GeneratePitchesRequestSchema` do Zod são extraídos.
  - O React e o layout escapam o conteúdo no DOM, prevenindo qualquer execução de script.
- **Resultado Obtido:** ✅ PASSOU.
