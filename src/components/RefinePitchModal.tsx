"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, History, Check } from "lucide-react";
import { PitchContent } from "@/data/mockData";

interface RefinePitchModalProps {
  pitch: PitchContent | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyRefine: (pitchId: string, updatedPitch: Partial<PitchContent>) => void;
  userApiKey?: string;
}

export function RefinePitchModal({ pitch, isOpen, onClose, onApplyRefine, userApiKey }: RefinePitchModalProps) {
  const [instruction, setInstruction] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("manter");
  const [selectedTone, setSelectedTone] = useState<string>("manter");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!pitch) return null;

  const handleRefine = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const effectiveKey =
      userApiKey?.trim() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("inova_gemini_api_key")?.trim() || localStorage.getItem("inova_pauta_gemini_key")?.trim()
        : "") ||
      undefined;

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId: pitch.id,
          instruction: instruction.trim(),
          format: selectedFormat,
          tone: selectedTone,
          userApiKey: effectiveKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao refinar pauta.");
      }

      onApplyRefine(pitch.id, data.pitch);
      setInstruction("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Falha ao comunicar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreVersion = async (v: any) => {
    if (!confirm(`Deseja restaurar o conteúdo para a versão v${v.version}?`)) return;

    try {
      const restoredFields: Partial<PitchContent> = {
        mote: v.mote,
        headlineArte: v.headlineArte,
        legenda: v.legenda,
        formato: v.formato
      };

      const res = await fetch("/api/pitches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pitch.id,
          fields: restoredFields
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao restaurar versão.");
      }

      onApplyRefine(pitch.id, data.pitch);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao restaurar versão.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-slate-900 border-slate-700 text-slate-100 p-5">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Versão Atual: v{pitch.version}
            </Badge>
            <Badge variant="outline" className="text-slate-200 border-slate-700">
              {pitch.personaName.split("(")[0]}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
            <RefreshCw className="w-5 h-5 text-amber-400 shrink-0" />
            Refazer ou Ajustar esta Pauta com IA
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-xs">
            Peça alterações pontuais no texto ou troque os parâmetros desta pauta sem mexer nas outras.
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da Pauta Atual */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-700 text-xs space-y-1.5 my-1 break-words">
          <p className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Pauta Selecionada:</p>
          <p className="font-medium text-slate-100 break-words">
            <span className="text-slate-400">Headline Atual:</span> &ldquo;{pitch.headlineArte}&rdquo;
          </p>
          <p className="text-slate-300">
            <span className="text-slate-400">Formato Atual:</span> {pitch.formato}
          </p>
        </div>

        {/* Campo de Instrução do Conteudista */}
        <div className="space-y-3 pt-1">
          <div>
            <label htmlFor="refine-instruction" className="block text-xs font-bold text-white mb-1.5">
              O que você gostaria de mudar nesta pauta?
            </label>
            <Textarea
              id="refine-instruction"
              placeholder="Ex: 'Achei essa headline estranha, crie uma nova mais criativa chamando os amigos', 'Deixe em forma de pergunta' ou 'Foque nos shows gratuitos'."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="bg-slate-950 border-slate-600 text-white text-xs placeholder:text-slate-400 resize-none h-24 focus:border-amber-400"
              maxLength={600}
            />
            <p className="text-[11px] text-slate-300 text-right mt-1">{instruction.length}/600 caracteres</p>
          </div>

          {/* Troca Rápida de Parâmetros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Forçar outro Formato:</label>
              <Select value={selectedFormat} onValueChange={(val) => val && setSelectedFormat(val)}>
                <SelectTrigger className="bg-slate-950 border-slate-600 text-white text-sm h-10 w-full">
                  <SelectValue placeholder="Manter o formato atual" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[280px] p-1.5">
                  <SelectItem value="manter" className="py-2 px-2.5">Manter formato atual</SelectItem>
                  <SelectItem value="reels" className="py-2 px-2.5">Reels Curto (Roteiro em 3 Cenas)</SelectItem>
                  <SelectItem value="carrossel" className="py-2 px-2.5">Carrossel Educativo (4 a 6 Telas)</SelectItem>
                  <SelectItem value="card" className="py-2 px-2.5">Card Único de Alto Impacto</SelectItem>
                  <SelectItem value="stories" className="py-2 px-2.5">Sequência de 3 Stories Interativos</SelectItem>
                  <SelectItem value="linkedin" className="py-2 px-2.5">Artigo / Post Executivo (LinkedIn)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Ajustar Tom de Voz:</label>
              <Select value={selectedTone} onValueChange={(val) => val && setSelectedTone(val)}>
                <SelectTrigger className="bg-slate-950 border-slate-600 text-white text-sm h-10 w-full">
                  <SelectValue placeholder="Manter tom padrão da persona" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-sm min-w-[280px] p-1.5">
                  <SelectItem value="manter" className="py-2 px-2.5">Manter tom da Persona</SelectItem>
                  <SelectItem value="descontraido" className="py-2 px-2.5">Mais Jovem e Descontraído</SelectItem>
                  <SelectItem value="provocativo" className="py-2 px-2.5">Mais Provocativo e Urgente</SelectItem>
                  <SelectItem value="emocional" className="py-2 px-2.5">Mais Afetivo e Comunitário</SelectItem>
                  <SelectItem value="b2b" className="py-2 px-2.5">Mais Executivo / B2B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Histórico de Versões se houver */}
          {pitch.previousVersions && pitch.previousVersions.length > 0 && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2">
              <p className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Versões Anteriores Preservadas:
              </p>
              <div className="space-y-2 text-xs">
                {pitch.previousVersions.map((v) => (
                  <div key={v.version} className="flex items-start justify-between gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="min-w-0 flex-1 break-words">
                      <span className="font-mono text-amber-400 font-bold mr-1.5">v{v.version}:</span>
                      <span className="text-slate-300 text-[11px] break-words">{v.changeNote}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(v)}
                      className="h-6 text-[10px] px-2.5 shrink-0 border-slate-700 bg-slate-950 text-amber-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs cursor-pointer">
            Cancelar
          </Button>
          <Button
            onClick={handleRefine}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 text-xs gap-1.5 font-black px-5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                Reescrevendo Pauta...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                Reescrever e Salvar Nova Versão (v{pitch.version + 1})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
