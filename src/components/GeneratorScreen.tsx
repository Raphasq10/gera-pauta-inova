"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Copy, Check, RefreshCw, Lightbulb, Users, ArrowRight, Layers, FileText, Send, Trash2 } from "lucide-react";
import { PersonaData, FestivalUpdate, PitchContent } from "@/data/mockData";
import { RefinePitchModal } from "@/components/RefinePitchModal";
import { toast } from "sonner";

interface GeneratorScreenProps {
  personas: PersonaData[];
  updates: FestivalUpdate[];
  pitches: PitchContent[];
  onNewPitchesGenerated: (newPitches: PitchContent[]) => void;
  onUpdatePitch: (pitchId: string, updatedPitch: Partial<PitchContent>) => void;
  onDeletePitch?: (pitchId: string) => void;
}

export function GeneratorScreen({
  personas,
  updates,
  pitches,
  onNewPitchesGenerated,
  onUpdatePitch,
  onDeletePitch
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
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [activeEngine, setActiveEngine] = useState<"gemini" | "local">("local");

  // Carrega a chave Gemini salva no navegador (localStorage) para não precisar digitar toda vez
  React.useEffect(() => {
    try {
      const savedKey = localStorage.getItem("inova_gemini_api_key");
      if (savedKey) {
        setUserApiKey(savedKey);
        setActiveEngine("gemini");
      }
    } catch {
      // ignora erro de storage
    }
  }, []);

  const handleSaveApiKey = (val: string) => {
    setUserApiKey(val);
    try {
      if (val.trim()) {
        localStorage.setItem("inova_gemini_api_key", val.trim());
        setActiveEngine("gemini");
      } else {
        localStorage.removeItem("inova_gemini_api_key");
        setActiveEngine("local");
      }
    } catch {
      // ignora erro de storage
    }
  };

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

    // 2. Montar payload validado com Zod
    const formPayload = {
      personaId: selectedPersonaId,
      updateId: selectedUpdateId,
      channel,
      weeklyTheme,
      pitchCount: Number(pitchCount),
      initialIdea: initialIdea.trim(),
      userApiKey: userApiKey.trim() || undefined
    };

    // 3. Chamar o Orquestrador de IA (/api/generate)
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
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
          toast.error("Por favor, verifique os campos do briefing.");
        } else {
          toast.error(resData.error || "Erro ao gerar pautas.");
        }
        setIsLoading(false);
        return;
      }

      // 4. Receber pautas formatadas da API (seja Gemini em nuvem ou Motor Offline com dados reais)
      const generatedPitches: PitchContent[] = resData.pitches;
      setActiveEngine(resData.source === "gemini_api" ? "gemini" : "local");
      onNewPitchesGenerated(generatedPitches);
      setIsLoading(false);

      if (resData.source === "gemini_api") {
        toast.success(`✨ ${generatedPitches.length} pauta(s) inédita(s) gerada(s) via Google Gemini 2.5 Flash!`);
      } else {
        toast.success(`${generatedPitches.length} pautas criativas distintas geradas!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao comunicar com o servidor de IA.");
      setIsLoading(false);
    }
  };

  const handleApplyRefine = (pitchId: string, updatedPitch: Partial<PitchContent>) => {
    onUpdatePitch(pitchId, updatedPitch);
    toast.success(`Pauta atualizada para a versão v${updatedPitch.version}!`);
  };

  const handleDelete = async (pitchId: string, headline: string) => {
    if (!confirm(`Deseja realmente apagar a pauta "${headline.slice(0, 45)}..." do banco de dados?`)) return;

    try {
      const res = await fetch(`/api/pitches?id=${encodeURIComponent(pitchId)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao excluir pauta.");
      }
      if (onDeletePitch) onDeletePitch(pitchId);
      toast.success("Pauta apagada do banco de dados com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Falha ao apagar pauta.");
    }
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
              <CardDescription className="text-slate-300 text-xs mt-1">
                Configure os parâmetros de audiência e a linha editorial ou insira uma ideia inicial para a IA desenvolver.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={userApiKey.trim() ? "h-8 text-xs border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-semibold cursor-pointer" : "h-8 text-xs border-amber-500/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-semibold cursor-pointer"}
              >
                🔑 {userApiKey.trim() ? "IA Gemini Conectada (Alterar Chave)" : "Conectar Chave Gemini (Google AI Studio)"}
              </Button>
              <Badge variant="outline" className={userApiKey.trim() ? "text-purple-300 border-purple-500/40 bg-purple-500/10 text-xs py-1 font-semibold" : "text-emerald-300 border-emerald-500/30 bg-emerald-500/10 text-xs py-1"}>
                {userApiKey.trim() ? "⚡ Gemini 2.5 Flash Ativo" : "🧠 Motor Criativo Local Ativo"}
              </Badge>
            </div>
          </div>

          {/* Input expansível ou aviso de Chave Gemini */}
          {(showKeyInput || !userApiKey.trim()) && (
            <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  🔑 Conectar ao Google Gemini 2.5 Flash (Chave da sua aba aberta do Google AI Studio):
                </span>
                <span className="text-[11px] text-slate-300">
                  A chave fica salva no seu navegador com segurança.
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Cole aqui sua chave API do Google AI Studio (começa com AIzaSy...)"
                  value={userApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  maxLength={200}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                />
                {userApiKey.trim() && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowKeyInput(false)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4"
                  >
                    Pronto!
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Seletor de Persona */}
            <div>
              <label htmlFor="select-persona" className="block text-sm font-bold text-slate-100 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                1. Persona-Alvo *
              </label>
              <Select value={selectedPersonaId} onValueChange={(val) => val && setSelectedPersonaId(val)}>
                <SelectTrigger id="select-persona" className="w-full h-11 bg-slate-950 border-slate-600 text-white font-medium text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
                  <SelectValue placeholder="Selecione a Persona" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[340px] max-h-80 shadow-2xl p-1.5">
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="py-2.5 px-3 text-sm cursor-pointer hover:bg-slate-800">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-xs text-slate-400">{p.count} inscritos ({p.pctOfAdults}% dos adultos) • {p.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.personaId && (
                <span className="text-xs text-rose-400 mt-1.5 block font-medium">{fieldErrors.personaId}</span>
              )}
            </div>

            {/* 2. Seletor de Atualização / Foco do Festival */}
            <div>
              <label htmlFor="select-update" className="block text-sm font-bold text-slate-100 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                2. Foco / Novidade do Evento
              </label>
              <Select value={selectedUpdateId} onValueChange={(val) => val && setSelectedUpdateId(val)}>
                <SelectTrigger id="select-update" className="w-full h-11 bg-slate-950 border-slate-600 text-white font-medium text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
                  <SelectValue placeholder="Geral do Festival" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[360px] max-h-80 shadow-2xl p-1.5">
                  <SelectItem value="none" className="py-2.5 px-3 text-sm cursor-pointer hover:bg-slate-800">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-amber-400">🌐 Geral do Festival</span>
                      <span className="text-xs text-slate-400">Sem atração específica (institucional / visão geral)</span>
                    </div>
                  </SelectItem>
                  {updates.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="py-2.5 px-3 text-sm cursor-pointer hover:bg-slate-800">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-white">[{u.world}] {u.title}</span>
                        <span className="text-xs text-slate-400 capitalize">{u.type} • {(u.summary || "").slice(0, 60)}...</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Canal de Destino */}
            <div>
              <label className="block text-sm font-bold text-slate-100 mb-2 flex items-center gap-1.5">
                3. Canal de Destino
              </label>
              <Select value={channel} onValueChange={(val: any) => val && setChannel(val)}>
                <SelectTrigger className="w-full h-11 bg-slate-950 border-slate-600 text-white font-medium text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[320px] shadow-2xl p-1.5">
                  <SelectItem value="instagram" className="py-2.5 px-3 text-sm cursor-pointer hover:bg-slate-800">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-white">📸 Instagram</span>
                      <span className="text-xs text-slate-400">Feed & Reels (@festivaliguassuinova)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin" className="py-2.5 px-3 text-sm cursor-pointer hover:bg-slate-800">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-white">💼 LinkedIn</span>
                      <span className="text-xs text-slate-400">Tom profissional / B2B (Itaipu Parquetec)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp" className="py-2.5 px-3 text-sm cursor-pointer hover:bg-slate-800">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-white">💬 WhatsApp / E-mail</span>
                      <span className="text-xs text-slate-400">Comunicação direta e avisos aos inscritos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Grade Semanal & Qtd */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-100 mb-2">Linha Editorial</label>
                <Select value={weeklyTheme} onValueChange={(val: any) => val && setWeeklyTheme(val)}>
                  <SelectTrigger className="w-full h-11 bg-slate-950 border-slate-600 text-white font-medium text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[220px] shadow-2xl p-1.5">
                    <SelectItem value="livre" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">Tema Livre</SelectItem>
                    <SelectItem value="terca-futuro" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">Terça IA/Futuro</SelectItem>
                    <SelectItem value="quarta-ciencia" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">Quarta Ciência</SelectItem>
                    <SelectItem value="quinta-b2b" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">Quinta Negócios</SelectItem>
                    <SelectItem value="sexta-lazer" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">Sexta Shows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-100 mb-2">Qtd Pautas</label>
                <Select value={pitchCount.toString()} onValueChange={(v) => v && setPitchCount(parseInt(v))}>
                  <SelectTrigger className="w-full h-11 bg-slate-950 border-slate-600 text-white font-medium text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[160px] shadow-2xl p-1.5">
                    <SelectItem value="1" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">1 Pauta</SelectItem>
                    <SelectItem value="2" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">2 Pautas</SelectItem>
                    <SelectItem value="3" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">3 Pautas</SelectItem>
                    <SelectItem value="4" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">4 Pautas</SelectItem>
                    <SelectItem value="5" className="py-2 px-3 text-sm cursor-pointer hover:bg-slate-800">5 Pautas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mini-Painel de Dados da Persona Selecionada */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 text-xs grid grid-cols-1 md:grid-cols-4 gap-4 shadow-inner">
            <div>
              <span className="text-slate-300 block text-[11px] uppercase font-bold tracking-wider">Volume Real na Base:</span>
              <span className="font-extrabold text-white text-base">
                {currentPersona.count} adultos <span className="text-amber-400 text-xs font-semibold">({currentPersona.pctOfAdults}%)</span>
              </span>
            </div>
            <div>
              <span className="text-slate-300 block text-[11px] uppercase font-bold tracking-wider">Top 2 Interesses:</span>
              <span className="text-slate-100 font-medium leading-tight block">
                {currentPersona.topInterests[0]?.label} <strong className="text-amber-300">({currentPersona.topInterests[0]?.pct}%)</strong> e {currentPersona.topInterests[1]?.label} <strong className="text-amber-300">({currentPersona.topInterests[1]?.pct}%)</strong>
              </span>
            </div>
            <div>
              <span className="text-slate-300 block text-[11px] uppercase font-bold tracking-wider">Logística Principal:</span>
              <span className="text-slate-100 font-medium block">
                {currentPersona.transport[0]?.label} <strong className="text-blue-300">({currentPersona.transport[0]?.pct}%)</strong>
              </span>
            </div>
            <div>
              <span className="text-slate-300 block text-[11px] uppercase font-bold tracking-wider">Tom de Voz Recomendado:</span>
              <span className="text-slate-200 italic font-medium truncate block">{currentPersona.tone}</span>
            </div>
          </div>

          {/* Campo em Destaque: Ideia de Conteúdo */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label htmlFor="initial-idea" className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                💡 Ideia de Conteúdo{" "}
                <span className="text-amber-300 font-normal text-xs">
                  (Escreva aqui a ideia de conteúdo ou o que precisamos comunicar)
                </span>
              </label>
              <span className="text-xs font-medium text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                {initialIdea.trim() ? "✨ A IA vai transformar sua ideia em pautas completas" : "🤖 Deixe em branco para ideação 100% autônoma"}
              </span>
            </div>
            <Textarea
              id="initial-idea"
              placeholder="Escreva aqui o que precisamos comunicar. Ex: 'Anunciar que o show do CPM 22 é 100% gratuito mas precisa retirar ingresso antecipado pelo site...', 'Explicar como funciona o credenciamento de estudantes', ou 'Destacar a palestra da Monja Coen sobre foco'. (Se deixar em branco, a IA propõe ângulos automáticos)."
              value={initialIdea}
              onChange={(e) => setInitialIdea(e.target.value)}
              className="bg-slate-950 border-slate-600 text-white placeholder:text-slate-400 text-sm min-h-[96px] resize-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-normal leading-relaxed p-3.5"
              maxLength={800}
            />
            <div className="flex justify-between items-center text-xs text-slate-300 mt-1.5 font-medium">
              <span>A IA vai cruzar este briefing com os dados demográficos e dores da persona selecionada.</span>
              <span className={initialIdea.length > 750 ? "text-amber-400 font-bold" : "text-slate-300"}>
                {initialIdea.length}/800 caracteres
              </span>
            </div>
            {fieldErrors.initialIdea && (
              <span className="text-xs text-rose-400 mt-1.5 block font-medium">{fieldErrors.initialIdea}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 border-t border-slate-800 flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black px-7 py-3 shadow-xl shadow-orange-950/40 gap-2 cursor-pointer transition disabled:opacity-50 text-sm tracking-wide"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Validando Briefing e Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
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
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      🎯 Mote do Conteúdo:
                    </span>
                    <p className="text-white text-sm mt-1 font-semibold leading-relaxed">{pitch.mote}</p>
                  </div>

                  {/* Bloco 2: Headline */}
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      🖼️ Headline (O que vai na Arte):
                    </span>
                    <p className="text-amber-300 text-sm font-bold">&ldquo;{pitch.headlineArte}&rdquo;</p>
                  </div>

                  {/* Bloco 3: Legenda */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      ✍️ Legenda para Redes:
                    </span>
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-700 text-slate-100 font-sans text-xs whitespace-pre-line max-h-56 overflow-y-auto leading-relaxed">
                      {pitch.legenda}
                    </div>
                  </div>

                  {/* Bloco 4: Formato + Justificativa com Dados */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-700 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase text-slate-300">📐 Formato:</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-semibold">
                        {pitch.formato}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-200 leading-normal">
                      <strong className="text-amber-300 font-semibold">Justificativa com dados:</strong> {pitch.justificativaFormato}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* BOTÃO PARA REFAZER / AJUSTAR PAUTA ESPECÍFICA */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePitchForRefine(pitch)}
                      className="border-slate-600 hover:bg-slate-800 text-slate-100 font-semibold text-xs gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      Refazer / Ajustar
                    </Button>

                    {/* BOTÃO DE APAGAR PAUTA */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pitch.id, pitch.headlineArte)}
                      title="Apagar esta pauta do banco de dados"
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs px-2.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* BOTÃO DE COPIAR CONTEÚDO */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCopy(pitch)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs gap-1.5 border border-slate-700 cursor-pointer"
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
        userApiKey={userApiKey}
      />
    </div>
  );
}
