"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Copy, Check, RefreshCw, Lightbulb, Users, ArrowRight, Layers, FileText, Send } from "lucide-react";
import { PersonaData, FestivalUpdate, PitchContent } from "@/data/mockData";
import { RefinePitchModal } from "@/components/RefinePitchModal";
import { toast } from "sonner";

interface GeneratorScreenProps {
  personas: PersonaData[];
  updates: FestivalUpdate[];
  pitches: PitchContent[];
  onNewPitchesGenerated: (newPitches: PitchContent[]) => void;
  onUpdatePitch: (pitchId: string, updatedPitch: Partial<PitchContent>) => void;
}

export function GeneratorScreen({
  personas,
  updates,
  pitches,
  onNewPitchesGenerated,
  onUpdatePitch
}: GeneratorScreenProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(personas[0]?.id || "p2");
  const [selectedUpdateId, setSelectedUpdateId] = useState<string>("none");
  const [channel, setChannel] = useState<"instagram" | "linkedin" | "whatsapp">("instagram");
  const [weeklyTheme, setWeeklyTheme] = useState<"terca-futuro" | "quarta-ciencia" | "quinta-b2b" | "sexta-lazer" | "livre">("livre");
  const [pitchCount, setPitchCount] = useState<number>(2);
  const [initialIdea, setInitialIdea] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePitchForRefine, setActivePitchForRefine] = useState<PitchContent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentPersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];
  const selectedUpdate = updates.find((u) => u.id === selectedUpdateId);

  const handleCopy = (pitch: PitchContent) => {
    const textToCopy = `📌 CONTEÚDO (Festival Iguassu Inova 2026)
🎯 MOTE: ${pitch.mote}
🖼️ HEADLINE (O que vai na arte): ${pitch.headlineArte}
✍️ LEGENDA:
${pitch.legenda}
📐 FORMATO RECOMENDADO: ${pitch.formato}
💡 JUSTIFICATIVA COM DADOS: ${pitch.justificativaFormato}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(pitch.id);
    toast.success("Pauta copiada com sucesso para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    // 1. Limpar erros prévios
    setFieldErrors({});

    // 2. Validação client-side com Zod para feedback instantâneo ao designer
    const formPayload = {
      personaId: selectedPersonaId,
      updateId: selectedUpdateId,
      channel,
      weeklyTheme,
      pitchCount: Number(pitchCount),
      initialIdea: initialIdea.trim()
    };

    // 3. Validação no backend via API /api/briefing/validate
    setIsLoading(true);
    try {
      const res = await fetch("/api/briefing/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        if (resData.details) {
          const errorsMap: Record<string, string> = {};
          resData.details.forEach((err: { field: string; message: string }) => {
            errorsMap[err.field] = err.message;
          });
          setFieldErrors(errorsMap);
          toast.error("Por favor, corrija os erros no formulário de briefing.");
        } else {
          toast.error(resData.error || "Erro ao validar briefing.");
        }
        setIsLoading(false);
        return;
      }

      // Validação passou com sucesso!
      const isIdeaGiven = initialIdea.trim().length > 0;
      const baseTitle = selectedUpdate ? selectedUpdate.title : "Novidades do Festival 2026";

      const themeLabels: Record<string, string> = {
        "terca-futuro": "Terça do Futuro & IA",
        "quarta-ciencia": "Quarta da Ciência & Pesquisa",
        "quinta-b2b": "Quinta de Negócios & Conexões",
        "sexta-lazer": "Sexta de Lazer & Shows",
        "livre": "Grade Livre"
      };

      const generated: PitchContent[] = Array.from({ length: pitchCount }).map((_, idx) => {
        return {
          id: `pitch-${Date.now()}-${idx}`,
          version: 1,
          createdAt: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
          personaId: currentPersona.id,
          personaName: currentPersona.name,
          updateTitle: selectedUpdate?.title,
          initialIdea: isIdeaGiven ? initialIdea.trim() : undefined,
          channel: channel,
          mote: isIdeaGiven
            ? `[${themeLabels[weeklyTheme]}] Desdobramento guiado da sua ideia conectada a ${currentPersona.topInterests[0]?.label || "inovação"}: transformar a curiosidade em inscrição confirmada.`
            : `[${themeLabels[weeklyTheme]}] Conectando ${baseTitle} com a principal dor de ${currentPersona.name.split(" ")[0]} (${currentPersona.keyPain}).`,
          headlineArte: isIdeaGiven
            ? `"${initialIdea.trim().slice(0, 48)}..." — viva essa experiência no Festival.`
            : `A inovação que você esperava tem data e hora marcada no Itaipu Parquetec.`,
          legenda: `De 25 a 28 de novembro de 2026, o maior encontro de inovação da Tríplice Fronteira reúne o que há de mais vibrante em ciência, negócios e cultura! ✨\n\nPara quem busca ${currentPersona.topGoals[0]?.label.toLowerCase() || "crescimento"}, o festival é 100% gratuito e aberto para todos.\n\nGaranta seu passaporte digital gratuito no aplicativo Yazo Tickets pelo link da bio e venha viver essa experiência completa!\n\n#FestivalIguassuInova2026 #ItaipuParquetec #${currentPersona.category}`,
          formato: currentPersona.suggestedFormats[idx % currentPersona.suggestedFormats.length] || "Carrossel de 4 Telas",
          justificativaFormato: `Formato escolhido com base nas métricas reais da persona: ${currentPersona.topInterests[0]?.pct}% dos ${currentPersona.count} inscritos adultos deste segmento priorizam ${currentPersona.topInterests[0]?.label} e ${currentPersona.transport[0]?.pct}% utilizam ${currentPersona.transport[0]?.label}. Canal: ${channel.toUpperCase()} (${themeLabels[weeklyTheme]}).`
        };
      });

      onNewPitchesGenerated(generated);
      setIsLoading(false);
      toast.success(`${generated.length} pauta(s) gerada(s) com sucesso no ${isIdeaGiven ? "Modo Guiado" : "Modo Automático"}!`);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao processar briefing no servidor.");
      setIsLoading(false);
    }
  };

  const handleApplyRefine = (pitchId: string, instruction: string, newFormat?: string, newTone?: string) => {
    const pitch = pitches.find((p) => p.id === pitchId);
    if (!pitch) return;

    const previousVersion = {
      version: pitch.version,
      mote: pitch.mote,
      headlineArte: pitch.headlineArte,
      legenda: pitch.legenda,
      formato: pitch.formato,
      changeNote: instruction || `Ajuste de formato para ${newFormat || "novo formato"}`
    };

    const updated: Partial<PitchContent> = {
      version: pitch.version + 1,
      headlineArte: instruction.toLowerCase().includes("pergunta")
        ? `Você sabia que o Festival é 100% gratuito no Parquetec?`
        : `[Ajustada v${pitch.version + 1}] ${pitch.headlineArte}`,
      formato: newFormat && newFormat !== "manter" ? newFormat : pitch.formato,
      mote: `${pitch.mote} (Lapidado com instrução: ${instruction || "ajuste de tom"})`,
      previousVersions: [...(pitch.previousVersions || []), previousVersion]
    };

    onUpdatePitch(pitchId, updated);
    toast.success(`Pauta atualizada para a versão v${pitch.version + 1}!`);
  };

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: FORMULÁRIO DE BRIEFING & ENTRADA */}
      <Card className="border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur">
        <CardHeader className="pb-4 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Painel de Briefing & Gerador de Pautas
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Configure os parâmetros de audiência e a linha editorial ou insira uma ideia inicial para a IA desenvolver.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs py-1">
                Base 2026: 7.065 Adultos
              </Badge>
              <Badge variant="outline" className={initialIdea.trim() ? "text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs py-1" : "text-blue-400 border-blue-500/30 bg-blue-500/10 text-xs py-1"}>
                {initialIdea.trim() ? "Modo Guiado por Ideia" : "Modo Ideação Automática"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Seletor de Persona */}
            <div>
              <label htmlFor="select-persona" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                1. Persona-Alvo *
              </label>
              <Select value={selectedPersonaId} onValueChange={(val) => val && setSelectedPersonaId(val)}>
                <SelectTrigger id="select-persona" className="bg-slate-950 border-slate-700 text-slate-100 text-xs">
                  <SelectValue placeholder="Selecione a Persona" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.count} inscritos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.personaId && (
                <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.personaId}</span>
              )}
            </div>

            {/* 2. Seletor de Atualização / Foco do Festival */}
            <div>
              <label htmlFor="select-update" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                2. Foco / Novidade do Evento
              </label>
              <Select value={selectedUpdateId} onValueChange={(val) => val && setSelectedUpdateId(val)}>
                <SelectTrigger id="select-update" className="bg-slate-950 border-slate-700 text-slate-100 text-xs">
                  <SelectValue placeholder="Geral do Festival" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                  <SelectItem value="none">Geral do Festival (Sem atração específica)</SelectItem>
                  {updates.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      [{u.world}] {u.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Canal de Destino */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">3. Canal de Destino</label>
              <Select value={channel} onValueChange={(val: any) => val && setChannel(val)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                  <SelectItem value="instagram">Instagram (@festivaliguassuinova)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn (Itaipu Parquetec B2B)</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp / E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Grade Semanal & Qtd */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Linha Editorial</label>
                <Select value={weeklyTheme} onValueChange={(val: any) => val && setWeeklyTheme(val)}>
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                    <SelectItem value="livre">Tema Livre</SelectItem>
                    <SelectItem value="terca-futuro">Terça IA/Futuro</SelectItem>
                    <SelectItem value="quarta-ciencia">Quarta Ciência</SelectItem>
                    <SelectItem value="quinta-b2b">Quinta Negócios</SelectItem>
                    <SelectItem value="sexta-lazer">Sexta Shows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qtd Pautas</label>
                <Select value={pitchCount.toString()} onValueChange={(v) => v && setPitchCount(parseInt(v))}>
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                    <SelectItem value="1">1 Pauta</SelectItem>
                    <SelectItem value="2">2 Pautas</SelectItem>
                    <SelectItem value="3">3 Pautas</SelectItem>
                    <SelectItem value="4">4 Pautas</SelectItem>
                    <SelectItem value="5">5 Pautas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mini-Painel de Dados da Persona Selecionada */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Volume Real na Base:</span>
              <span className="font-bold text-slate-200 text-sm">
                {currentPersona.count} adultos <span className="text-slate-400 text-xs">({currentPersona.pctOfAdults}%)</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Top 2 Interesses:</span>
              <span className="text-slate-200">
                {currentPersona.topInterests[0]?.label} ({currentPersona.topInterests[0]?.pct}%) e {currentPersona.topInterests[1]?.label} ({currentPersona.topInterests[1]?.pct}%)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Logística Principal:</span>
              <span className="text-slate-200">
                {currentPersona.transport[0]?.label} ({currentPersona.transport[0]?.pct}%)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tom de Voz Recomendado:</span>
              <span className="text-slate-300 italic truncate block">{currentPersona.tone}</span>
            </div>
          </div>

          {/* Campo em Destaque: Ideia Inicial / Briefing do Conteudista */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="initial-idea" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                💡 Ideia Inicial / Briefing do Conteudista (Opcional)
              </label>
              <span className="text-[11px] text-slate-400">
                {initialIdea.trim() ? "✨ A IA vai transformar sua ideia em pautas completas" : "🤖 Deixe em branco para ideação 100% autônoma"}
              </span>
            </div>
            <Textarea
              id="initial-idea"
              placeholder="Digite um insight, trend ou ângulo que você pensou. Ex: 'Fazer um meme sobre quem deixou pra emitir ingresso na última hora' ou 'Conectar a palestra da Monja Coen com saúde mental no trabalho'."
              value={initialIdea}
              onChange={(e) => setInitialIdea(e.target.value)}
              className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm min-h-[85px] resize-none"
              maxLength={800}
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>A IA vai cruzar esta ideia com as dores da persona selecionada.</span>
              <span className={initialIdea.length > 750 ? "text-amber-400 font-semibold" : ""}>
                {initialIdea.length}/800 caracteres
              </span>
            </div>
            {fieldErrors.initialIdea && (
              <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.initialIdea}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 border-t border-slate-800 flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-6 py-2.5 shadow-lg shadow-orange-950/30 gap-2 cursor-pointer transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Validando Briefing e Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar {pitchCount} Pauta(s) com IA
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* SEÇÃO 2: RESULTADOS GERADOS (CARDS ESTRUTURADOS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Pautas Geradas para Avaliação e Uso
          </h2>
          <span className="text-xs text-slate-400">
            Total gerado na sessão: {pitches.length} pauta(s)
          </span>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <Card key={i} className="border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <Skeleton className="h-6 w-3/4 bg-slate-800" />
                <Skeleton className="h-16 w-full bg-slate-800/60" />
                <Skeleton className="h-28 w-full bg-slate-800/40" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24 bg-slate-800" />
                  <Skeleton className="h-8 w-28 bg-slate-800" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && pitches.length === 0 && (
          <Card className="border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Nenhuma pauta gerada ainda</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Escolha uma persona acima, selecione uma novidade ou digite uma ideia inicial no campo e clique em &ldquo;Gerar Pautas com IA&rdquo;.
            </p>
          </Card>
        )}

        {/* LISTAGEM DOS CARDS DE PAUTA */}
        {!isLoading && pitches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pitches.map((pitch, idx) => (
              <Card key={pitch.id} className="border-slate-800 bg-slate-900 flex flex-col justify-between hover:border-slate-700 transition shadow-lg">
                <CardHeader className="pb-3 border-b border-slate-800/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        Conteúdo #{idx + 1}
                      </span>
                      {pitch.version > 1 && (
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                          Versão v{pitch.version}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[11px]">
                      {pitch.personaName.split("(")[0]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-xs">
                  {/* Bloco 1: Mote */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      🎯 Mote do Conteúdo:
                    </span>
                    <p className="text-slate-200 text-sm mt-0.5 font-medium leading-snug">{pitch.mote}</p>
                  </div>

                  {/* Bloco 2: Headline */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      🖼️ Headline (O que vai na Arte):
                    </span>
                    <p className="text-amber-200 text-sm font-bold">&ldquo;{pitch.headlineArte}&rdquo;</p>
                  </div>

                  {/* Bloco 3: Legenda */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      ✍️ Legenda para Redes:
                    </span>
                    <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-slate-300 font-mono text-[11px] whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
                      {pitch.legenda}
                    </div>
                  </div>

                  {/* Bloco 4: Formato + Justificativa com Dados */}
                  <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">📐 Formato:</span>
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[11px]">
                        {pitch.formato}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-slate-300">Justificativa com dados:</strong> {pitch.justificativaFormato}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  {/* BOTÃO PARA REFAZER / AJUSTAR PAUTA ESPECÍFICA */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivePitchForRefine(pitch)}
                    className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Refazer / Ajustar
                  </Button>

                  {/* BOTÃO DE COPIAR CONTEÚDO */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCopy(pitch)}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs gap-1.5"
                  >
                    {copiedId === pitch.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Pauta
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Refinamento / Reescrita */}
      <RefinePitchModal
        pitch={activePitchForRefine}
        isOpen={!!activePitchForRefine}
        onClose={() => setActivePitchForRefine(null)}
        onApplyRefine={handleApplyRefine}
      />
    </div>
  );
}
