# 🧪 Testes Manuais — Feature 1: Motor de Dados e Personas 2026

**Feature:** Motor de Dados e Personas 2026 (Pré-carregado + Upload .xlsx sem Menores + Edição/Criação)  
**Data:** 16 de Outubro de 2026  
**Ambiente:** Localhost (`http://localhost:3000`)

---

## 1. Caminho Feliz (Happy Path)

### Teste 1.1: Visualização Inicial dos Dados de 2026
1. Abra o navegador em `http://localhost:3000`.
2. Clique na aba **"3. Personas & Dados"**.
3. **Resultado esperado:**
   - As 4 Personas aparecem no topo com seus dados oficiais:
     - *Dra. Helena (Professores e Pesquisadores)*: **1.046 inscritos** (14.8%)
     - *Lucas & Sofia (Universitários Alunos)*: **2.268 inscritos** (32.1%)
     - *Carla & Família (Comunidade Foz)*: **2.677 inscritos** (37.9%)
     - *Rodrigo & Camila (Público Empresário)*: **501 inscritos** (7.1%)
   - Ao clicar em qualquer persona, as barras de porcentagem de interesses (ex: 59.6% Arte & Cultura nos alunos) e objetivos se atualizam na hora.

### Teste 1.2: Edição de Parâmetros de uma Persona
1. Na aba **"3. Personas & Dados"**, selecione *Lucas & Sofia* e clique em **"Editar Parâmetros"**.
2. Altere o campo *Tom de Voz* para: `"Super descontraído, memes acadêmicos e direto ao ponto"`.
3. Clique em **"Salvar Persona"**.
4. **Resultado esperado:**
   - Notificação toast verde: *"Persona atualizada com sucesso!"*.
   - O novo tom de voz passa a aparecer no card de detalhes da persona e também no mini-painel do Gerador de Pautas.

### Teste 1.3: Upload de Nova Planilha .xlsx
1. Na aba **"3. Personas & Dados"**, clique no botão **"Subir Nova Planilha .xlsx"**.
2. Selecione o arquivo real `dados publico inscrito 2026/Inscrições-Festival Iguassu Inova-16-10-2026 16_10_42.xlsx`.
3. **Resultado esperado:**
   - O botão muda para estado de carregamento com spinner: *"Processando e Filtrando Menores..."*.
   - Em menos de 2 segundos, surge a notificação verde informando que **822 menores de idade foram descartados com sucesso** e os dados das 4 personas foram recalculados e salvos em `src/data/personas-2026.json`.

---

## 2. Testes de Inputs Inválidos

### Teste 2.1: Campos Vazios no Modal de Persona
1. Clique em **"Nova Persona"**.
2. Tente clicar em **"Salvar Persona"** sem preencher nada.
3. **Resultado esperado:**
   - O formulário bloqueia o envio e o Zod exibe mensagens em vermelho abaixo dos campos obrigatórios (*"O nome deve ter no mínimo 3 caracteres"*, *"A dor principal deve ter no mínimo 5 caracteres"*, etc.).

### Teste 2.2: Arquivo com Formato Incorreto no Upload
1. Clique em **"Subir Nova Planilha .xlsx"**.
2. Tente selecionar um arquivo `.pdf`, `.png` ou `.txt`.
3. **Resultado esperado:**
   - O seletor de arquivos do sistema operacional restringe a `.xlsx` e `.xls`. Se forçar o envio via script, o backend devolve status 400 com a mensagem: *"Formato inválido. Apenas planilhas .xlsx ou .xls são permitidas."*.

---

## 3. Teste de Tentativa de Injeção de Código (XSS)

### Teste 3.1: Injeção de Script no Nome da Persona
1. Abra o modal **"Nova Persona"**.
2. No campo *Nome da Persona*, cole exatamente:
   ```html
   <script>alert('XSS atacou!')</script>
   ```
3. Preencha os outros campos normalmente e clique em **"Salvar Persona"**.
4. **Resultado esperado:**
   - Nenhum alerta de JavaScript é disparado na tela. O React e o Next.js renderizam a tag como texto puro e inofensivo no card: `&lt;script&gt;alert('XSS atacou!')&lt;/script&gt;`.

---

## 4. Teste de Double-Submit / Race Condition

### Teste 4.1: Cliques Rápidos Repetidos no Botão de Salvar
1. Abra o modal de edição de persona.
2. Clique 3 vezes consecutivas e muito rápidas no botão **"Salvar Persona"**.
3. **Resultado esperado:**
   - O botão entra em estado `disabled` imediatamente no primeiro clique (*"Salvando..."*), ignorando os cliques subsequentes e evitando requisições duplicadas.

---

## 5. Teste de Loading State (Conexão Lenta)
1. Durante o upload da planilha `.xlsx`, observe o botão.
2. **Resultado esperado:**
   - O botão de upload desabilita novas interações e exibe o ícone de spinner animado (*"Processando e Filtrando Menores..."*), garantindo que o usuário saiba que a planilha está sendo processada.
