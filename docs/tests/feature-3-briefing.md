# Testes Manuais: Feature 3 - Painel de Briefing com Ideia Inicial do Conteudista

**Data da execução:** 19/10/2026  
**Responsável:** Engenheiro Full-Stack / Arquiteto de Software  
**Status:** APROVADO ✅

---

## 1. Objetivo da Feature
Permitir que o conteudista defina a estratégia de conteúdo com parâmetros bem delineados (Persona-Alvo, Foco/Novidade do Festival, Canal de Destino, Linha Editorial da Grade Semanal, Quantidade de Pautas) e disponha de um campo livre "💡 Ideia Inicial / Briefing do Conteudista" (até 800 caracteres).
- **Modo Guiado:** Se preenchido, a IA desdobra e lapida a ideia do usuário cruzando com as dores da persona.
- **Modo Ideação Automática:** Se vazio, a IA sugere ganchos e motes automaticamente.

---

## 2. Cenários de Teste Executados

### Cenário 1: Caminho Feliz (Happy Path) — Modo Guiado por Ideia
- **Entrada:**
  - Persona: *Lucas Rocha (Universitário Alunos)*
  - Foco: *[Mundo Conexões] Palestra Monja Coen*
  - Canal: *Instagram (@festivaliguassuinova)*
  - Linha Editorial: *Terça IA/Futuro*
  - Qtd: *2 Pautas*
  - Ideia Inicial: *"Fazer um meme amigável sobre quem tem ansiedade no fim de semestre e precisa de um respiro com inovação e a Monja Coen"*
- **Resultado Esperado:** 
  - Requisição validada com sucesso pelo endpoint `POST /api/briefing/validate`.
  - Notificação de sucesso indicando geração no "Modo Guiado".
  - Cards gerados com mote referenciando a ideia do conteudista e justificativa conectada às métricas dos estudantes (83.3% Carona/Ônibus, 80.8% IA/Tech).
- **Resultado Obtido:** ✅ PASSOU. Pautas geradas com a tag `[Terça do Futuro & IA]` e headline contextualizada à ideia.

---

### Cenário 2: Caminho Feliz — Modo Ideação Automática (Ideia Vazia)
- **Entrada:**
  - Persona: *Juliana Mendes (Comunidade Foz)*
  - Foco: *Geral do Festival*
  - Canal: *Instagram*
  - Linha Editorial: *Sexta Shows*
  - Qtd: *1 Pauta*
  - Ideia Inicial: *Em branco*
- **Resultado Esperado:**
  - Identificação visual imediata do badge "Modo Ideação Automática".
  - Endpoint valida sem erros (`initialIdea` é opcional).
  - Pauta gerada focada nas atrações culturais/shows e gratuidade do evento.
- **Resultado Obtido:** ✅ PASSOU. Badge dinâmico reagiu em tempo real e o card foi gerado corretamente.

---

### Cenário 3: Validação de Limites — Campo de Ideia > 800 Caracteres
- **Entrada:** Tentativa de colar um texto de 950 caracteres no campo de Ideia Inicial.
- **Resultado Esperado:**
  - O atributo `maxLength={800}` do componente `<Textarea />` impede digitação além de 800 caracteres.
  - O contador visual exibe aviso destacado quando próximo ao limite (`>750`).
  - O schema Zod rejeita qualquer requisição maliciosa que tente ultrapassar 800 caracteres via payload direto.
- **Resultado Obtido:** ✅ PASSOU. Bloqueio no front e no back com mensagem "A ideia inicial não pode ultrapassar 800 caracteres."

---

### Cenário 4: Segurança contra Injeção de Scripts (Anti-XSS)
- **Entrada:** Ideia inicial contendo payload malicioso: `<script>alert('xss')</script>`.
- **Resultado Esperado:**
  - Sanitização e tratamento como texto plano (escapado pelo React).
  - O script não é executado no DOM em nenhum momento.
- **Resultado Obtido:** ✅ PASSOU. O texto é tratado estritamente como string literal no estado e no card.

---

### Cenário 5: Proteção Contra Duplo Clique (Anti-Race Condition)
- **Entrada:** Cliques múltiplos e rápidos no botão "Gerar Pautas com IA".
- **Resultado Esperado:**
  - O botão deve entrar em estado desabilitado (`disabled={isLoading}`) imediatamente no primeiro clique, com spinner de loading animado.
- **Resultado Obtido:** ✅ PASSOU. Uma única requisição é disparada por ciclo.
