# 🚀 InovaPauta AI — Gerador Inteligente de Pautas (Festival Iguassu Inova 2026)

O **InovaPauta AI** é uma aplicação web de inteligência editorial desenvolvida para a equipe de comunicação do **Festival Iguassu Inova 2026**. O sistema cruza os dados reais dos **7.065 inscritos adultos** exportados da plataforma Yazo Tickets (excluindo menores de idade e anonimizando dados pessoais sensíveis), as **4 Personas Oficiais do evento** (*Universitário Professores e Pesquisadores, Universitário Alunos, Comunidade Foz do Iguaçu e Público Empresário*) e as atualizações diárias do festival (*6 Mundos, Palestrantes, Shows Nacionais, Releases da Imprensa e Ideias Iniciais do Conteudista*) para gerar pautas completas de redes sociais via Inteligência Artificial (**Google Gemini**), salvando histórico automático e permitindo refazer/ajustar pautas específicas.

---

## 🛠️ Como Rodar Localmente

1. **Abra o terminal** dentro desta pasta (`C:\xampp\htdocs\festivaliguassuinova\gerador de pautas`).
2. **Configure sua chave do Google Gemini (Opcional para teste inicial):**
   - Abra o arquivo `.env.local` na raiz do projeto.
   - Cole sua chave gratuita obtida no [Google AI Studio](https://aistudio.google.com/app/apikey) dentro de `GEMINI_API_KEY="sua_chave_aqui"`.
3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm.cmd run dev
   ```
4. **Acesse no navegador:**
   - Abra [http://localhost:3000](http://localhost:3000)

---

## 💻 Stack Técnica

- **Framework Full-Stack:** Next.js (App Router) + React 19 + TypeScript
- **Estilização & UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Inteligência Artificial:** Google Gemini SDK (`@google/genai` — modelo `gemini-2.5-flash` com Structured Outputs)
- **Processamento de Dados:** SheetJS (`xlsx`) com filtro automático de menores de idade e conformidade LGPD
- **Formulários & Validação:** React Hook Form + Zod
- **Banco de Dados:** Persistência Local em Disco (`src/data/*.json`) compatível com ambiente XAMPP

---

## 📄 Documentação do Projeto

- 📋 **[PRD do MVP (PRD.md)](./PRD.md)** — Visão do produto, personas de usuário, user stories priorizadas (MoSCoW), features Must Have, fluxos e regras de negócio.
- 📊 **[PRD Base & Análise de Dados 2026 (PRD_GERADOR_DE_PAUTAS.md)](./PRD_GERADOR_DE_PAUTAS.md)** — Diagnóstico estatístico completo da planilha de inscritos 2026 e detalhamento das 4 Personas de Público.
- 🏗️ **[Arquitetura & Stack Técnica (TECH_STACK.md)](./TECH_STACK.md)** — Justificativa das escolhas técnicas, funcionamento do banco de dados local/XAMPP e guia de integração com o Google Gemini.
