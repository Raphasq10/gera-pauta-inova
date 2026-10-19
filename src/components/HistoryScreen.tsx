"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, RefreshCw, Copy, Check, Filter, Sparkles, Clock, ArrowUpDown } from "lucide-react";
import { PitchContent, PersonaData } from "@/data/mockData";
import { RefinePitchModal } from "@/components/RefinePitchModal";
import { toast } from "sonner";

interface HistoryScreenProps {
  pitches: PitchContent[];
  personas: PersonaData[];
  onUpdatePitch: (pitchId: string, updatedPitch: Partial<PitchContent>) => void;
}

export function HistoryScreen({ pitches, personas, onUpdatePitch }: HistoryScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPersona, setFilterPersona] = useState<string>("all");
  const [activePitchForRefine, setActivePitchForRefine] = useState<PitchContent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPitches = pitches.filter((p) => {
    const matchesSearch =
      p.mote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.headlineArte.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.legenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.initialIdea && p.initialIdea.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPersona = filterPersona === "all" || p.personaId === filterPersona;

    return matchesSearch && matchesPersona;
  });

  const handleCopy = (pitch: PitchContent) => {
    const textToCopy = `📌 CONTEÚDO (Festival Iguassu Inova 2026)
🎯 MOTE: ${pitch.mote}
🖼️ HEADLINE: ${pitch.headlineArte}
✍️ LEGENDA:
${pitch.legenda}
📐 FORMATO: ${pitch.formato}
💡 JUSTIFICATIVA COM DADOS: ${pitch.justificativaFormato}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(pitch.id);
    toast.success("Pauta copiada do histórico!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyRefine = (pitchId: string, updatedPitch: Partial<PitchContent>) => {
    onUpdatePitch(pitchId, updatedPitch);
    toast.success(`Pauta atualizada no histórico para a versão v${updatedPitch.version}!`);
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO & FILTROS DO HISTÓRICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Histórico Automático de Pautas Criadas
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Todas as pautas geradas são preservadas aqui. Você pode reabrir qualquer pauta para refazer ou ajustar com a IA.
          </p>
        </div>

        {/* Barra de Busca e Filtro */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Buscar por termo ou headline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border-slate-700 text-slate-100 pl-8 text-xs h-9"
              maxLength={100}
            />
          </div>

          <Select value={filterPersona} onValueChange={(val) => val && setFilterPersona(val)}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100 text-xs h-9 w-48">
              <SelectValue placeholder="Todas as Personas" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
              <SelectItem value="all">Todas as Personas</SelectItem>
              {personas.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name.split("(")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LISTAGEM DE CARDS DO HISTÓRICO */}
      {filteredPitches.length === 0 ? (
        <Card className="border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <History className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-200">Nenhuma pauta encontrada no histórico</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || filterPersona !== "all"
              ? "Tente ajustar os filtros ou a busca acima para encontrar a pauta desejada."
              : "As pautas geradas na aba principal serão salvas aqui automaticamente."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPitches.map((pitch) => (
            <Card key={pitch.id} className="border-slate-800 bg-slate-900 flex flex-col justify-between hover:border-slate-700 transition shadow">
              <CardHeader className="pb-3 border-b border-slate-800/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10 text-[11px] font-mono">
                      v{pitch.version}
                    </Badge>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {pitch.createdAt}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[11px]">
                    {pitch.personaName.split("(")[0]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5 pt-4 text-xs">
                {pitch.initialIdea && (
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px] text-slate-400">
                    <span className="text-amber-400 font-semibold">💡 Ideia Inicial:</span> &ldquo;{pitch.initialIdea}&rdquo;
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">🎯 Mote:</span>
                  <p className="text-slate-200 text-sm font-medium mt-0.5">{pitch.mote}</p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">🖼️ Headline:</span>
                  <p className="text-amber-200 text-sm font-bold">&ldquo;{pitch.headlineArte}&rdquo;</p>
                </div>

                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 text-[11px]">
                  <span className="text-slate-400 font-semibold">📐 Formato: </span>
                  <span className="text-emerald-300">{pitch.formato}</span>
                  <p className="text-slate-400 mt-1 line-clamp-2">{pitch.justificativaFormato}</p>
                </div>

                {pitch.previousVersions && pitch.previousVersions.length > 0 && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 flex items-center justify-between">
                    <span>Versões anteriores salvas:</span>
                    <span className="text-amber-400 font-semibold">{pitch.previousVersions.length} versão(ões)</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-3 pb-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePitchForRefine(pitch)}
                  className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Refazer / Ajustar
                </Button>

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

      {/* Modal para refazer pauta selecionada no histórico */}
      <RefinePitchModal
        pitch={activePitchForRefine}
        isOpen={!!activePitchForRefine}
        onClose={() => setActivePitchForRefine(null)}
        onApplyRefine={handleApplyRefine}
      />
    </div>
  );
}
