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
 - **Inteligência Artificial:** Google Gemini AI (REST API + SDK)
 - **Formulários & Validação:** React Hook Form + Zod
