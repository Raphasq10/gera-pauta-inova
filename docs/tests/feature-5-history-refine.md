# Testes Manuais: Feature 5 - Histórico Automático de Pautas & Refinamento Individual

**Data da execução:** 19/10/2026  
**Responsável:** Engenheiro Full-Stack / Arquiteto de Software  
**Status:** APROVADO ✅

---

## 1. Objetivo da Feature
Garantir que toda pauta gerada (seja via Google Gemini ou Motor Inteligente Local) seja salva automaticamente no banco de dados local (`src/data/saved-pitches.json`) e permitir que o conteudista refine uma pauta específica através do botão "🔄 Refazer / Ajustar esta Pauta" com versionamento completo (`v1` -> `v2` -> `v3`), possibilitando também a restauração de versões anteriores.

---

## 2. Cenários de Teste Executados

### Cenário 1: Salvamento Automático no Histórico
- **Ação:** No Gerador de Pautas, selecionar a persona *Juliana Mendes (Comunidade Foz)* e gerar 2 novas pautas.
- **Resultado Esperado:**
  - As 2 pautas são exibidas na tela do Gerador.
  - Ao clicar na aba **"2. Histórico"**, as 2 pautas recém-criadas já aparecem listadas no topo com timestamp atualizado e versão `v1`.
  - As pautas persistem no arquivo local `src/data/saved-pitches.json`.
- **Resultado Obtido:** ✅ PASSOU. Persistência automática confirmada sem necessidade de botão manual de salvar.

---

### Cenário 2: Caminho Feliz — Refazer Pauta com Instrução e Troca de Formato
- **Entrada:**
  - No card de uma pauta existente (versão `v1`), clicar no botão **"Refazer / Ajustar"**.
  - O modal de refinamento abre exibindo a versão atual `v1` e a headline.
  - No campo "O que você gostaria de mudar nesta pauta?", digitar: *"Deixe a headline em forma de pergunta curiosa e foque no acesso 100% gratuito"*.
  - No seletor de formato, escolher: *"Reels Curto (Roteiro em 3 Cenas)"*.
  - Clicar em **"Aplicar Mudanças e Salvar Nova Versão (v2)"**.
- **Resultado Esperado:**
  - A API `/api/refine` processa a alteração.
  - O card atualiza para **v2** com a nova headline formulada como pergunta.
  - O formato passa para Reels Curto.
  - A versão anterior `v1` é arquivada no histórico interno da pauta.
- **Resultado Obtido:** ✅ PASSOU. Card atualizado com sucesso e notificação: *"Pauta atualizada para a versão v2!"*.

---

### Cenário 3: Restauração de Versão Anterior
- **Entrada:**
  - Abrir o modal de refinamento em uma pauta que já possui versão `v2`.
  - Na seção **"Versões Anteriores Preservadas"**, visualizar a linha `v1`.
  - Clicar no botão **"Restaurar"** ao lado da versão `v1`.
- **Resultado Esperado:**
  - O sistema solicita confirmação do usuário.
  - Ao confirmar, o endpoint `PUT /api/pitches` restaura os campos de mote, headline e formato para o estado da `v1`.
  - O card na tela exibe o texto da versão restaurada.
- **Resultado Obtido:** ✅ PASSOU. Restauração suave e imediata no estado da interface e no disco.

---

### Cenário 4: Busca e Filtros no Histórico
- **Entrada:**
  - Na aba Histórico, digitar uma palavra-chave no campo de busca (ex: *"Duda Beat"* ou *"UNILA"*).
  - Alternar o filtro de Persona para *"Universitário Alunos"*.
- **Resultado Esperado:**
  - A listagem filtra reativamente apenas os cards que contêm o termo buscado ou a persona correspondente.
  - Se nenhum resultado for encontrado, exibe empty state amigável.
- **Resultado Obtido:** ✅ PASSOU. Busca rápida e fluida sem recarregar a página.

---

### Cenário 5: Proteção Anti-Race Condition e Validação de Limites
- **Entrada:**
  - Digitar instrução com mais de 600 caracteres no modal de refinamento (o atributo `maxLength={600}` bloqueia a digitação).
  - Clicar rapidamente 2 vezes no botão de aplicar mudanças.
- **Resultado Esperado:**
  - Botão entra em estado de loading desabilitado (`disabled={isSubmitting}`) no primeiro clique, impedindo duplicidade de versão.
- **Resultado Obtido:** ✅ PASSOU. Proteção ativada com sucesso.
