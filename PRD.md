# PRD — InovaPauta AI (Gerador Inteligente de Pautas — Festival Iguassu Inova 2026)

> **Nota de Referência:** Este documento segue o framework executivo de MVP de Web Apps e utiliza como base de dados e contexto o documento de referência [PRD_GERADOR_DE_PAUTAS.md](./PRD_GERADOR_DE_PAUTAS.md).

---

## Contexto do Produto (Prompt Preenchido)

- **Nome do produto:** **InovaPauta AI** — Gerador Inteligente de Pautas e Conteúdo (Festival Iguassu Inova 2026)
- **Ideia em uma frase:** Web app que cruza os dados reais dos 7.065 inscritos adultos do Festival Iguassu Inova 2026 (interesses, objetivos e logística), as 4 personas estratégicas do evento e as atualizações diárias (palestrantes, shows e releases) para gerar pautas completas de redes sociais via IA (Mote, Headline da arte, Legenda e Formato com justificativa estatística).
- **Problema que resolve:** A equipe de comunicação possui apenas 1 conta oficial de Instagram do Festival (além dos canais institucionais do Itaipu Parquetec) para impactar 4 públicos com dores e interesses muito distintos (professores/pesquisadores, alunos universitários, comunidade de Foz do Iguaçu e empresários) até novembro de 2026. Hoje, criar conteúdos segmentados que conectem novidades do evento com os dados reais dos inscritos é um processo lento, manual e desconectado das planilhas da Yazo Tickets.
- **Público-alvo (Usuários do Sistema):** Conteudistas (Social Media), Redatores/Copywriters, Assessores de Imprensa e Gestores de Comunicação do Festival Iguassu Inova e do Itaipu Parquetec.
- **Como o usuário resolve esse problema hoje:** Processo 100% manual e fragmentado — o conteudista lê releases em `.docx`/PDF, consulta planilhas brutas do Excel (`.xlsx`) exportadas da Yazo Tickets, tenta cruzar mentalmente com o PDF da *Tática de Redes Sociais* e escreve pautas no Google Docs ou pede ideias genéricas no ChatGPT sem o contexto estatístico real dos inscritos.
- **Modelo de negócio:** Ferramenta interna gratuita (Uso exclusivo da equipe de comunicação e marketing do Festival Iguassu Inova / Itaipu Parquetec).
- **Precisa de login?** Não para o MVP (execução local/intranet; apenas configuração de chave de API da LLM salva localmente no navegador).
- **Precisa de pagamentos?** Não.
- **Prazo para o MVP:** Imediato (Outubro de 2026), pois o Festival ocorre de **25 a 28 de novembro de 2026** e a campanha de captação para atingir a meta de 20.000 check-ins únicos já está em andamento.

---

## 1. Visão Geral

- **Nome do produto:** **InovaPauta AI**
- **Elevator pitch:**  
  O **InovaPauta AI** é uma ferramenta web de inteligência editorial criada especificamente para a equipe de comunicação do Festival Iguassu Inova 2026. Ele transforma dados reais da planilha de inscritos da Yazo Tickets (7.065 adultos mapeados em 4 personas), novidades de palestrantes/shows e ideias iniciais do conteudista em pautas de redes sociais prontas para produção. Em segundos, entrega o **Mote criativo**, a **Headline para a arte**, a **Legenda completa com CTA** e a **recomendação de Formato justificada com estatísticas reais do público**.
- **Objetivo do MVP:**  
  Entregar uma aplicação web funcional rodando localmente em `C:\xampp\htdocs\festivaliguassuinova\gerador de pautas` que já venha pré-carregada com as **4 Personas Oficiais de 2026** (sem menores de idade) e o contexto completo do Festival (6 Mundos, 15 Keynotes, 4 Shows), permitindo ao conteudista imputar uma ideia inicial ou atualização do evento, atualizar a base `.xlsx` de inscritos e gerar cards de pauta estruturados via IA.

---

## 2. Personas

### 2.1. Personas de Usuário do Sistema (1 a 3 Máximo)

#### 1. Júlia — A Conteudista / Social Media do Festival (Usuária Principal)
- **Perfil:** 26 anos, Social Media e Copywriter na equipe de comunicação do Festival Iguassu Inova, em Foz do Iguaçu. Trabalha com metas semanais de postagens seguindo a grade tática (Terça: Futuro, Quarta: Ciência, Quinta: B2B, Sexta/FDS: Lazer).
- **Dores principais:**
  - Tem ideias soltas, mas perde muito tempo transformando um insight em briefing completo (mote + texto de arte + legenda + defesa do formato para aprovação).
  - Tem dificuldade de adaptar o mesmo anúncio (ex: um novo palestrante ou show) para públicos tão diferentes quanto um estudante da UNILA que vai de ônibus e um CEO local que busca networking B2B.
  - Não tem tempo de abrir e filtrar uma planilha de 7.888 linhas no Excel toda vez que vai escrever um post.
- **O que ela quer alcançar com o produto:** Digitar uma ideia inicial rápida (ou escolher uma novidade do festival), selecionar uma das 4 personas do público e receber em 10 segundos opções de pautas completas, no tom de voz certo e com justificativa baseada nos dados reais dos inscritos.
- **Como ela descobriria o produto:** Ferramenta oficial disponibilizada pela coordenação de marketing/inovação no repositório de trabalho do Festival (`gerador de pautas`).

#### 2. Carlos — O Assessor de Imprensa e Conteúdo Institucional
- **Perfil:** 34 anos, jornalista responsável pelos releases oficiais, passaporte de imprensa e comunicação institucional do Itaipu Parquetec.
- **Dores principais:**
  - Escreve comunicados densos e detalhados sobre os 6 Mundos (Itaipu Parquetec, FICiências, Sapiens, Summit Tour, FIMS e RME), mas sente que as informações técnicas se perdem ou ficam "corporativas demais" quando vão para as redes sociais.
- **O que ele quer alcançar com o produto:** Colar um release recém-escrito ou uma atualização oficial do evento no sistema e desdobrá-lo automaticamente em pautas nativas para Instagram (foco jovem/comunidade) e LinkedIn do Itaipu Parquetec (foco B2B/acadêmico).
- **Como ele descobriria o produto:** Integração direta no fluxo de trabalho entre a assessoria de imprensa e o time de redes sociais do Festival.

#### 3. Rafael — O Estrategista de Marketing e Dados do Festival
- **Perfil:** 31 anos, gestor de produto/marketing digital responsável por acompanhar as inscrições na Yazo Tickets, tráfego pago e metas de conversão rumo aos 20.000 check-ins únicos.
- **Dores principais:**
  - Percebe gargalos claros nos dados (ex: baixa presença empresarial de 7,1% ou o fato de 43,7% dos universitários dependerem de transporte público), mas precisa que esses insights virem conteúdo prático na ponta sem precisar gerar relatórios manuais toda semana.
- **O que ele quer alcançar com o produto:** Subir a planilha atualizada da Yazo Tickets (`.xlsx`) toda semana para recalcular os interesses das 4 personas automaticamente e garantir que toda pauta gerada pela equipe esteja ancorada em dados reais.
- **Como ele descobriria o produto:** Idealizador e administrador da ferramenta junto ao time do projeto.

---

### 2.2. As 4 Personas de Público-Alvo do Festival (Entidades de Dados do Sistema — Base 2026 $\ge 18$ anos)
*(Extraídas de `Inscrições-Festival Iguassu Inova-16-10-2026 16_10_42.xlsx`, excluindo 822 menores de idade, totalizando **7.065 adultos válidos**)*:

1. **👩‍🏫 Público Universitário — Professores e Pesquisadores (`n = 1.046` | 14,8%):**
   - **Perfil:** Média 38,7 anos, 65,0% mulheres, 70,8% de Foz (*UNILA, UNIOESTE, IFPR, UTFPR, SEED*).
   - **Top Interesses:** Arte & Cultura (64,2%), **Aprendizagem do Futuro (47,4%)**, **Sustentabilidade (41,3%)**, Corpo & Mente (39,7%), Impacto Social (39,6%).
   - **Objetivos & Logística:** Atividades culturais (77,5%), tendências/conhecimento (77,0%), **apresentar pesquisa (11,5%)**. 50,2% querem programação completa; 60,6% vão de carro particular.
2. **🎓 Público Universitário — Alunos (`n = 2.268` | 32,1%):**
   - **Perfil:** Média 25,2 anos (mediana 23), 60,9% mulheres, alta diversidade, 74,1% de Foz (*UNILA 30,7%, UNIOESTE 11,6%, UDC, UCP, UniAmérica*).
   - **Top Interesses:** Arte & Cultura (59,6%), **Tecnologias do Futuro (41,8%)**, Corpo & Mente (38,7%), Impacto Social (33,1%), Aprendizagem do Futuro (30,5%), **Geeks & Games (28,3% — 641 alunos)**.
   - **Objetivos & Logística:** **Explorar tendências/conhecimento (76,9%)**, cultura (64,3%), novas tecnologias (51,3%), **networking (41,8%)**. **50,9% dependem de ônibus** (43,7% transporte público + 7,2% ônibus do festival).
3. **🏘️ Público Comunidade Foz do Iguaçu (`n = 2.677` | 37,9% — sendo `543` estrito Entusiasta/Comunidade):**
   - **Perfil:** Média 35,8 anos, 60,2% mulheres, 100% moradores de Foz (*Centro, Vila A, Campos do Iguaçu, Morumbi, Lancaster, Porto Belo, Porto Meira*).
   - **Top Interesses:** **Arte & Cultura (63,5% a 72,6%)**, **Corpo & Mente (44,5%)**, Negócios & Marketing (40,5%), Tecnologias do Futuro (40,1%).
   - **Objetivos & Logística:** **30,6% vão exclusivamente pelos Shows Nacionais** e 46,2% programação completa; **68,1% conheceram pelas redes sociais do festival**; 65,0% vão de carro particular.
4. **💼 Público Empresário (`n = 501` | 7,1%):**
   - **Perfil:** Média 37,4 anos, **51,7% mulheres** e 46,1% homens, *CEOs, Proprietários, Diretores, Startupeiros e Investidores* (77,4% Foz / 22,6% outras cidades como Curitiba, Cascavel e Toledo).
   - **Top Interesses:** **Negócios & Marketing (73,7%)**, Arte & Cultura (45,3%), **Tecnologias do Futuro (43,3%)**, Corpo & Mente (34,9%), Turismo Sustentável (18,8%).
   - **Objetivos & Logística:** Conhecimento/tendências (74,1%), **ampliar networking (59,5%)**, **buscar oportunidades de negócio (41,5%)** e **investimento (19,0%)**. 21,2% focam exclusivamente na programação diurna + networking; 73,5% vão de carro particular.

---

## 3. User Stories Priorizadas (MoSCoW)

### Must Have (Sem isso o MVP não funciona)
- **US-01:** Como **conteudista (Júlia)**, eu quero **selecionar uma das 4 Personas de Público (já alimentadas com os dados reais de 2026 maiores de 18 anos)** para **direcionar a pauta exatamente para as dores, interesses e logística daquele segmento**.
- **US-02:** Como **conteudista (Júlia)**, eu quero **ter um campo de "Ideia Inicial / Briefing" onde posso digitar um rascunho livre (ou deixar em branco para ideação automática)** para **guiar a IA com a minha criatividade quando eu já tiver um gancho pensado**.
- **US-03:** Como **assessor/conteudista (Carlos/Júlia)**, eu quero **selecionar ou cadastrar atualizações do Festival (novos palestrantes, shows, releases de imprensa, avisos importantes ou os 6 Mundos)** para **que a IA use fatos reais e atualizados do evento na criação do conteúdo**.
- **US-04:** Como **conteudista (Júlia)**, eu quero **gerar pautas com IA que entreguem obrigatoriamente: (1) Mote do conteúdo, (2) Headline da arte, (3) Legenda para redes e (4) Formato recomendado com justificativa baseada nos dados** para **ter o material pronto para enviar ao design e publicar**.
- **US-05:** Como **conteudista (Júlia)**, eu quero **que todas as pautas geradas sejam salvas automaticamente em um Histórico de Pautas Criadas** para **consultar, filtrar, reaproveitar ou continuar trabalhando em pautas geradas anteriormente sem perder nada**.
- **US-06:** Como **conteudista (Júlia)**, eu quero **poder refazer ou ajustar uma pauta específica caso eu não goste dela (inserindo novos parâmetros ou pedindo mudanças pontuais para a IA, como mudar o ângulo, encurtar a headline ou trocar o formato)** para **lapidar um conteúdo específico sem precisar regerar o lote inteiro do zero**.
- **US-07:** Como **estrategista (Rafael)**, eu quero **fazer upload de uma nova planilha `.xlsx` de inscritos da Yazo Tickets (ignorando automaticamente menores de idade e dados pessoais)** para **atualizar os números e percentagens das 4 personas conforme as inscrições avançam**.
- **US-08:** Como **conteudista (Júlia)**, eu quero **editar os dados de uma persona existente ou cadastrar uma persona adicional** para **ajustar nuances de tom de voz, objeções ou recortes específicos quando necessário**.

### Should Have (Importante, mas pode entrar na sequência imediata do MVP)
- **US-09:** Como **conteudista (Júlia)**, eu quero **copiar com 1 clique cada pauta gerada, favoritar as melhores no histórico e exportar em Markdown/TXT** para **facilitar o envio para aprovação e design**.
- **US-10:** Como **conteudista (Júlia)**, eu quero **filtrar a geração pelo dia da Grade Semanal da Tática de Redes (Terça: Futuro, Quarta: Ciência, Quinta: B2B, Sexta/FDS: Lazer) e pelo Canal (Instagram do Festival vs. LinkedIn/WhatsApp Parquetec)** para **evitar ruído no canal único do evento**.

### Could Have (Seria legal ter)
- **US-11:** Como **conteudista (Júlia)**, eu quero **comparar a versão anterior (`v1`) com a versão refeita (`v2`) de uma pauta após pedir alterações** para **escolher a melhor redação**.
- **US-12:** Como **estrategista (Rafael)**, eu quero **visualizar gráficos comparativos de interesses entre as 4 personas na aba de Dados** para **identificar rapidamente temas transversais (como Arte & Cultura e Corpo & Mente)**.

### Won't Have (Explicitamente fora do escopo por enquanto)
- **US-13:** Geração de imagens/artes finais ou vídeos renderizados dentro do sistema (o sistema gera o *briefing visual / headline da arte*, não substitui o Figma/Canva/Designer).
- **US-14:** Publicação ou agendamento automático via API da Meta (Instagram) ou LinkedIn.
- **US-15:** Sistema de login multiusuário com controle de permissões complexo e cobrança/assinatura.

---

## 4. Features do MVP (Apenas as Must Have)

### Feature 1: Motor de Dados e Personas 2026 (Pré-carregado + Upload `.xlsx` sem Menores)
- **Descrição curta:** Módulo que já traz embutidas as estatísticas reais dos **7.065 inscritos adultos** divididos nas **4 Personas Oficiais** e permite subir novas planilhas `.xlsx` da Yazo Tickets no navegador, filtrando menores de idade e recalculando os percentuais de interesses, objetivos, bairros e transporte. Também permite editar/criar personas manualmente.
- **Justificativa Must Have:** O pedido central do projeto é que as pautas e personas sejam baseadas nos dados reais dos inscritos do festival (ignorando menores de idade).
- **Critérios de aceitação:**
  - [ ] Ao abrir o app, as 4 personas (*Universitário Professores/Pesquisadores*, *Universitário Alunos*, *Comunidade Foz*, *Público Empresário*) já exibem seus números reais da planilha de 16/10/2026.
  - [ ] Ao fazer upload de um arquivo `.xlsx` no padrão Yazo Tickets, o sistema descarta registos cancelados e menores de 18 anos (`Coluna 8` menor de 14, `Coluna 25 == 'Sim'` ou `Data de Nascimento < 18 anos`) em menos de 3 segundos.
  - [ ] O usuário consegue editar campos de uma persona ou adicionar uma nova persona em modal/formulário simples, persistindo no banco local.
- **Dependências:** Nenhuma (é a fundação de dados do sistema).

### Feature 2: Hub de Atualizações e Contexto do Festival
- **Descrição curta:** Repositório vivo que já vem populado com os dados oficiais do Festival Iguassu Inova 2026 (6 Mundos, 4 Shows Nacionais, 15 Keynotes confirmados, Circuito Esquenta e "O Festival é Seu") e permite cadastrar novas atualizações (novos palestrantes, releases da imprensa, avisos importantes).
- **Justificativa Must Have:** Sem o contexto atualizado do festival, a IA inventaria atrações (alucinação) ou geraria conteúdos genéricos desconectados da programação real.
- **Critérios de aceitação:**
  - [ ] Lista inicial já contém os 6 Mundos, 4 Shows e 15 Palestrantes extraídos do `llms-full.txt`.
  - [ ] Formulário permite adicionar uma nova atualização informando: *Tipo* (Palestrante, Show, Release de Imprensa, Novidade/Aviso), *Título*, *Mundo Relacionado* e *Texto/Detalhes*.
  - [ ] As atualizações cadastradas aparecem imediatamente como opções selecionáveis na tela do Gerador de Pautas.
- **Dependências:** Nenhuma.

### Feature 3: Painel de Briefing com Campo de "Ideia Inicial do Conteudista"
- **Descrição curta:** Interface de entrada do gerador onde o conteudista seleciona a Persona-Alvo, a Atualização/Mundo do Festival, a quantidade de conteúdos desejada (1 a 5) e conta com o campo aberto **"💡 Ideia Inicial / Briefing do Conteudista"**.
- **Justificativa Must Have:** Garante que o sistema funcione tanto para desenvolver uma ideia específica que o conteudista já teve quanto para sugerir pautas do zero quando o campo for deixado em branco.
- **Critérios de aceitação:**
  - [ ] Seletor obrigatório de Persona (com resumo visual dos Top Interesses e Dores da persona selecionada).
  - [ ] Seletor de Atualização/Foco do Festival (com opção de selecionar itens do Hub).
  - [ ] Campo de texto livre para a **Ideia Inicial do Conteudista** (opcional: se preenchido, a IA desenvolve a ideia; se vazio, a IA propõe ângulos automaticamente).
  - [ ] Seletor de Canal/Grade Semanal (Instagram do Festival vs. LinkedIn/Canais Itaipu Parquetec).
- **Dependências:** Feature 1 (Personas) e Feature 2 (Hub de Atualizações).

### Feature 4: Orquestrador de IA e Renderizador de Cards de Pauta Estruturados
- **Descrição curta:** Motor que monta o prompt de engenharia contextual (injetando os percentuais reais da Persona + Atualização do Festival + Ideia Inicial do Conteudista + Regras da Tática de Redes), consulta a API de LLM (Google Gemini) e exibe o resultado na UI no formato exato de 4 blocos por conteúdo.
- **Justificativa Must Have:** É a entrega final de valor exigida pelo usuário na interface.
- **Critérios de aceitação:**
  - [ ] Cada conteúdo gerado é exibido em um Card visualmente organizado contendo obrigatoriamente os 4 campos:
    1. **Mote do conteúdo:** Conceito criativo + conexão com os dados da persona.
    2. **Headline (O que vai na arte):** Texto curto de capa / lâminas do carrossel ou gancho de tela do Reels.
    3. **Legenda para redes:** Copy completa com tom de voz adequado, quebra de objeções (`100% Gratuito`, certificado, etc.), CTA e hashtags.
    4. **Formato + Justificativa:** Formato recomendado acompanhado da justificativa explícita citando os dados reais da persona (ex: *"Escolhemos Reels curto de serviço porque 43,7% dos 2.268 alunos universitários inscritos vão de transporte público..."*).
  - [ ] Botão "Copiar Conteúdo" individual em cada card que copia o texto formatado para a área de transferência.
  - [ ] Possui configuração de API Key do Gemini na própria interface + um **Modo Inteligente Local (Gerador Estruturado Offline/Fallback)** para que o usuário possa testar e gerar pautas imediatamente mesmo antes de inserir uma chave de API externa.
- **Dependências:** Features 1, 2 e 3.

### Feature 5: Histórico Automático de Pautas & Refinamento Individual ("Refazer Pauta")
- **Descrição curta:** Toda pauta gerada é salva automaticamente no banco de dados local com data/hora, persona e parâmetros utilizados. Além disso, cada card de pauta possui o botão **"🔄 Refazer / Ajustar esta Pauta"**, permitindo ao conteudista pedir mudanças específicas para a IA (ex: *"mude para formato Reels"*, *"foque mais no show gratuito"*, *"deixe a headline mais curta"*) ou alterar os parâmetros daquela pauta individualmente sem perder as demais.
- **Justificativa Must Have:** Na rotina real de criação, a primeira geração nem sempre acerta 100% o tom ou o formato desejado pelo conteudista, e pautas criadas em dias anteriores precisam ficar salvas para consulta e retrabalho.
- **Critérios de aceitação:**
  - [ ] **Salvamento Automático:** Assim que a IA gera 1 ou mais conteúdos, eles são gravados automaticamente no Histórico de Pautas (com filtro por Persona, Mundo, Data ou palavra-chave).
  - [ ] **Botão "🔄 Refazer / Ajustar Pauta" em cada Card:** Ao clicar, abre um painel rápido no próprio card (ou modal) onde o conteudista pode:
    - Digitar o **que deseja mudar** (ex: *"Não gostei desse gancho, quero algo mais focado em carreira e networking"*);
    - Alterar parâmetros opcionais daquela pauta (*Forçar outro Formato* como Carrossel/Reels/Card, *Trocar Tom de Voz* ou *Trocar Persona/Atração*).
  - [ ] **Atualização Inteligente + Versionamento:** A IA reescreve apenas aquele card específico aplicando as mudanças solicitadas, salva a nova versão no histórico e permite alternar/restaurar a versão anterior se o usuário preferir.
- **Dependências:** Feature 4 (Orquestrador de IA e Cards de Pauta).

---

## 5. Fluxos Principais

### 5.1. Primeiro Uso e Configuração Rápida
1. O usuário abre o sistema no navegador (`gerador de pautas`).
2. O sistema carrega instantaneamente os dados pré-processados dos **7.065 inscritos adultos** nas **4 Personas de 2026**, os itens oficiais do Festival (6 Mundos, 15 Palestrantes, 4 Shows) e o **Histórico de Pautas**.
3. *(Opcional)* O usuário clica no ícone de "Configurar IA", insere sua chave de API do Google Gemini ou mantém o motor integrado ativo.

### 5.2. Fluxo Principal de Valor (Geração + Histórico Automático)
1. Na aba **"Gerador de Pautas"**, o conteudista escolhe uma das **4 Personas** (ex: *Público Universitário — Alunos*).
2. O sistema exibe ao lado um mini-resumo dos dados reais daquela persona (*2.268 inscritos | 59,6% Arte & Cultura | 41,8% Tecnologias do Futuro | 43,7% Transporte Público*).
3. O conteudista seleciona uma **Atualização/Tema do Festival** (ex: *Palestra Rapha do RH + Mundo Sapiens* ou um *Release recém-cadastrado*).
4. No campo **"💡 Ideia Inicial do Conteudista"**, ele digita seu rascunho — ou deixa em branco para sugestão automática.
5. Escolhe a quantidade de pautas (ex: *3 opções*) e clica em **"✨ Gerar Pautas com IA"**.
6. O sistema exibe na tela os **3 Cards de Conteúdo** (**Mote**, **Headline da Arte**, **Legenda** e **Formato + Justificativa com dados**) e **salva automaticamente todas as pautas no Histórico**.

### 5.3. Fluxo de Refinamento ("Refazer / Ajustar uma Pauta Específica")
1. O conteudista lê o **Conteúdo 2** (que pode estar na tela atual de geração ou aberto lá na aba **"Histórico de Pautas"**) e decide que não gostou do ângulo ou quer mudar o formato.
2. Ele clica no botão **"🔄 Refazer / Ajustar esta Pauta"** dentro do card do Conteúdo 2.
3. Abre-se uma caixa de ajuste rápido onde ele:
   - Seleciona novos parâmetros se quiser (ex: mudar Formato de *Card Único* para *Reels Curto*, ou mudar o foco para outro palestrante); e/ou
   - Digita a instrução de mudança: *"Achei muito formal. Deixe mais jovem, cite que vale certificado de horas complementares para a UNILA e faça uma headline em formato de pergunta"*.
4. Ele clica em **"Aplicar Mudanças com IA"**.
5. O sistema envia a pauta original + os novos parâmetros/instruções para a IA, atualiza apenas o **Conteúdo 2** na tela (guardando a versão anterior caso ele queira desfazer) e atualiza o registro no **Histórico de Pautas**.

### 5.4. Fluxo de Atualização de Dados de Inscritos (`.xlsx`)
1. O usuário acessa a aba **"Personas & Dados 2026"**.
2. Clica em **"Importar Nova Planilha Yazo (.xlsx)"** e seleciona o arquivo exportado da plataforma de ingressos.
3. O sistema lê o arquivo localmente, ignora cancelados e menores de 18 anos, recalcula o tamanho da base e os percentuais de interesses/objetivos/transporte das 4 personas e salva no banco local.

---

## 6. Regras de Negócio

1. **RN-01 — Exclusão Estrita de Menores de Idade:** Todo processamento de planilha de inscritos deve ignorar obrigatoriamente qualquer linha onde:
   - A coluna `Ingresso` (col. 8) contenha `"menor de 14 anos"`; **OU**
   - A coluna `Você é menor de idade?` (col. 25) seja igual a `"Sim"`; **OU**
   - A idade calculada a partir da `Data de nascimento` (col. 16) em relação à data atual seja `< 18 anos`.
2. **RN-02 — Anonimização de Dados Pessoais (LGPD):** Nenhuma informação pessoal identificável (Nome, CPF/Documento, Telefone, WhatsApp, E-mail ou QR Code) pode ser exibida na tela de geração ou enviada em prompts para APIs externas de IA. Apenas agregações estatísticas (contagens e percentuais) são utilizadas.
3. **RN-03 — Mapeamento Determinístico das 4 Personas na Planilha:**
   - **Persona 1 (Universitário Professores e Pesquisadores):** Adultos com `Coluna 29` = `"Professor(a) / Educador(a)"` ou `"Pesquisador(a) / Cientista"`.
   - **Persona 2 (Universitário Alunos):** Adultos com `Coluna 29` = `"Estudante"`.
   - **Persona 3 (Comunidade Foz do Iguaçu):** Adultos com `Coluna 21 (Mora em Foz) == "Sim"` que pertençam aos perfis gerais da cidade (`"Entusiasta / Comunidade"`, `"Profissional autonomo e/ou freelancer"`, `"Profissional de empresa privada"`, `"Profissional do setor público"`, `"Organizacao da sociedade civil / terceiro setor"`), destacando também as métricas do subgrupo estrito `"Entusiasta / Comunidade"`.
   - **Persona 4 (Público Empresário):** Adultos com `Coluna 29` = `"Empresario(a) / Executivo(a)"`, `"Empreendedor(a) / Startupeiro(a)"` ou `"Investidor(a)"`.
4. **RN-04 — Estrutura Obrigatória de Saída (4 Pilares):** Nenhuma pauta (seja na primeira geração ou ao refazer/ajustar) pode ser entregue sem conter explicitamente os 4 elementos: **Mote do conteúdo**, **Headline (arte)**, **Legenda para redes** e **Formato com justificativa baseada em dados**.
5. **RN-05 — Persistência Automática e Versionamento de Refinamento:** Toda pauta gerada deve ser salva automaticamente no Histórico com ID único e carimbo de data/hora. Quando uma pauta for refeita/ajustada pelo usuário, o sistema deve manter a estrutura dos 4 pilares e guardar a versão anterior no array `historicoVersoes` daquela pauta para permitir restauração com 1 clique.
6. **RN-06 — Alinhamento com a Regra do Canal Único (Tática de Redes):** Quando a persona selecionada for *Público Empresário* ou *Professores/Pesquisadores*, o sistema deve orientar como a pauta se comporta no Instagram do Festival (visual/direto) vs. LinkedIn/E-mail do Itaipu Parquetec (foco em ROI, pesquisa e negócios), evitando ruído editorial.

---

## 7. Fora do Escopo (O que NÃO estará no MVP)

- **Design gráfico automatizado:** O MVP não gera arquivos `.png`, `.mp4` ou `.psd` das artes (entrega apenas a *Headline* que vai na arte e a orientação visual do formato).
- **Publicação direta nas redes sociais:** Sem integração OAuth com Graph API do Instagram, TikTok ou LinkedIn para postagem automática.
- **Conexão em tempo real via Webhook pago da Yazo:** A atualização da base de inscritos no MVP será feita via upload do arquivo `.xlsx` exportado da Yazo Tickets (processamento instantâneo client-side), sem necessidade de servidor intermediário de sincronização contínua.
- **Gestão de tráfego pago (Meta Ads / Google Ads):** O sistema foca em pautas de conteúdo orgânico e estratégico para redes sociais.

---

## 8. Requisitos Não-Funcionais

- **Performance esperada:**
  - Carregamento inicial da interface e das 4 personas pré-processadas em **menos de 1 segundo**.
  - Processamento local de uma planilha `.xlsx` de até 25.000 linhas em **menos de 3 segundos** no navegador (usando `SheetJS / xlsx`).
  - Tempo de resposta da geração de pautas pela IA entre **3 e 12 segundos**.
- **Requisitos de segurança e privacidade:**
  - Processamento 100% client-side da planilha `.xlsx` (o arquivo Excel bruto com CPFs e telefones nunca sai do computador do usuário).
  - Chave de API da LLM armazenada exclusivamente no `localStorage` do navegador do usuário.
- **Acessibilidade (WCAG 2.1 AA):**
  - Contraste mínimo de `4.5:1` em todos os textos e badges de personas/mundos.
  - Navegação completa por teclado (`Tab`, `Enter`, `Esc` em modais) e atributos `aria-label` nos botões de cópia e seletores.
- **Compatibilidade:**
  - Navegadores modernos Desktop e Mobile (Chrome 110+, Edge 110+, Firefox 110+, Safari 16+). Layout responsivo priorizando Desktop/Notebook (ambiente de trabalho do conteudista).
- **LGPD/GDPR:**
  - O produto **não coleta nem armazena dados pessoais (PII)** em banco de dados externo. Ao ler a planilha de inscritos, aplica descarte imediato das colunas 1 a 12 e 26 a 28 (dados cadastrais nominais), retendo apenas somatórios anônimos por segmento.

---

## 9. Métricas de Sucesso do MVP

1. **Velocidade de Criação de Pauta:** Reduzir o tempo médio de criação de um briefing completo de post (Mote + Headline + Legenda + Justificativa) de **~40 minutos para menos de 3 minutos**.
2. **Adoção pela Equipe:** 100% das pautas semanais das redes sociais do Festival Iguassu Inova (até 28/11/2026) utilizando dados reais dos inscritos nas justificativas de formato e nos ganchos de copy.
3. **Cobertura Equilibrada dos 4 Públicos:** Garantir a produção semanal de conteúdos direcionados para as 4 personas, apoiando diretamente a meta de conversão de **20.000 ingressos únicos no check-in** (7.000 universitários, 6.500 ensino básico/FICiências, 4.500 comunidade e 2.000 empresas).

---

## 10. Decisões Técnicas Iniciais

- **Precisa de banco de dados?** **Não para o MVP.** Os dados estatísticos de 2026 já vêm consolidados em um arquivo JSON/JS local (`data_personas_2026.js` gerado a partir da planilha real), e novas atualizações de planilhas, novas personas, releases e histórico de pautas ficam salvos no `localStorage` do navegador (com opção de exportar/importar backup `.json`). *(Caso no futuro queiram compartilhar em nuvem em tempo real entre vários computadores sem exportar arquivo, pode-se aplicar o Anexo A com Supabase/SQLite).*
- **Precisa de autenticação/login?** **Não para o MVP**, pois roda localmente no ambiente de trabalho da equipe (`C:\xampp\htdocs\festivaliguassuinova\gerador de pautas`).
- **Precisa de pagamentos?** **Não**, é uma ferramenta interna proprietária do projeto Festival Iguassu Inova.
- **Vai publicar na internet?** **Opcional (Anexo C no final).** Durante o desenvolvimento e uso imediato, roda 100% local (via XAMPP/Node ou abertura direta no navegador), podendo ser publicado facilmente em uma URL interna/Vercel caso a equipe queira acessar de casa.
