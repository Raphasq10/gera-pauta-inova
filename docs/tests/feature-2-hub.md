# 🧪 Testes Manuais — Feature 2: Hub de Atualizações e Contexto do Festival

**Feature:** Repositório Oficial do Festival (6 Mundos, 4 Shows, 15 Keynotes + Cadastro de Novidades com Zod)  
**Data:** 16 de Outubro de 2026  
**Ambiente:** Localhost (`http://localhost:3000`)

---

## 1. Caminho Feliz (Happy Path)

### Teste 1.1: Visualização do Repositório Oficial Completo
1. Abra `http://localhost:3000`.
2. Clique na aba **"4. Hub do Festival"**.
3. **Resultado esperado:**
   - No topo, aparecem em destaque os **6 Mundos Oficiais**: *Itaipu Parquetec, FICiências, Sapiens, Summit Tour, FIMS e RME*.
   - No feed de novidades, estão pré-carregados os **4 Shows Nacionais** (*Os Garotin, Duda Beat, Arnaldo Antunes, Emicida*) e os **15 Palestrantes Confirmados** (*Drauzio Varella, Caito Maia, Monja Coen, Gabriela Prioli, etc.*).
   - O contador exibe o total de novidades cadastradas.

### Teste 1.2: Cadastro de Nova Atualização
1. Na aba **"4. Hub do Festival"**, clique em **"Cadastrar Nova Atualização"**.
2. Preencha:
   - *Tipo:* `Novo Palestrante / Keynote`
   - *Mundo:* `Itaipu Parquetec`
   - *Título:* `Silvio Meira confirmado para painel de IA`
   - *Resumo:* `Cientista-chefe da TDS Company abordará cidades inteligentes e transformação digital no palco principal.`
3. Clique em **"Salvar e Disponibilizar no Gerador"**.
4. **Resultado esperado:**
   - Toast verde confirmando o salvamento.
   - O novo palestrante aparece no topo da lista do Hub.
   - O dado é gravado no arquivo `src/data/festival-context.json` no HD.
5. Vá até a aba **"1. Gerador de Pautas"** e abra o seletor **"2. Foco / Novidade do Evento"**:
   - `[Itaipu Parquetec] Silvio Meira confirmado para painel de IA` aparece imediatamente selecionável!

---

## 2. Testes de Inputs Inválidos

### Teste 2.1: Envio com Título ou Resumo Vazio
1. Abra o formulário de cadastro no Hub.
2. Deixe o campo *Título* em branco e tente salvar.
3. **Resultado esperado:**
   - O formulário bloqueia o envio e o Zod exibe a mensagem: *"O título deve ter no mínimo 3 caracteres."*.
4. Digite um resumo com menos de 10 caracteres (ex: `"Teste"`).
5. **Resultado esperado:**
   - O Zod exibe: *"O resumo / detalhes deve ter no mínimo 10 caracteres para orientar a IA."*.

---

## 3. Teste de Tentativa de Injeção de Código (XSS)

### Teste 3.1: Injeção de Script no Título da Atração
1. No campo *Título*, cole:
   ```html
   <script>alert('Ataque no Hub')</script>
   ```
2. No *Resumo*, cole:
   ```html
   <img src="x" onerror="alert('XSS')" /> Detalhes da atração
   ```
3. Clique em **Salvar**.
4. **Resultado esperado:**
   - Nenhum pop-up de alerta é executado. O React exibe o texto como strings seguras e escapadas nos cards do Hub e no seletor do Gerador.

---

## 4. Teste de Double-Submit / Race Condition

### Teste 4.1: Cliques Rápidos no Botão Salvar
1. Preencha os campos válidos e clique 3 vezes bem rápido em **"Salvar e Disponibilizar no Gerador"**.
2. **Resultado esperado:**
   - O botão entra em estado desabilitado no primeiro clique (*"Salvando no Banco..."*), evitando criar itens duplicados no arquivo `festival-context.json`.

---

## 5. Teste de Exclusão de Item
1. Passe o mouse sobre um item recém-cadastrado no Hub.
2. Clique no ícone de lixeira.
3. Confirme o prompt do navegador.
4. **Resultado esperado:**
   - O item é removido do Hub e do arquivo JSON em disco.
