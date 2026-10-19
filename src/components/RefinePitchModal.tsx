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

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId: pitch.id,
          instruction: instruction.trim(),
          format: selectedFormat,
          tone: selectedTone,
          userApiKey: userApiKey?.trim() || undefined
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
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Versão Atual: v{pitch.version}
            </Badge>
            <Badge variant="outline" className="text-slate-300 border-slate-700">
              {pitch.personaName.split("(")[0]}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            Refazer ou Ajustar esta Pauta com IA
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Peça alterações pontuais no texto ou troque os parâmetros desta pauta sem mexer nas outras.
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da Pauta Atual */}
        <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5 my-1">
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Pauta Selecionada:</p>
          <p className="font-medium text-slate-200">
            <span className="text-slate-400">Headline Atual:</span> &ldquo;{pitch.headlineArte}&rdquo;
          </p>
          <p className="text-slate-400">
            <span className="text-slate-400">Formato:</span> {pitch.formato}
          </p>
        </div>

        {/* Campo de Instrução do Conteudista */}
        <div className="space-y-3 pt-2">
          <div>
            <label htmlFor="refine-instruction" className="block text-xs font-semibold text-slate-200 mb-1">
              O que você gostaria de mudar nesta pauta?
            </label>
            <Textarea
              id="refine-instruction"
              placeholder="Ex: 'Achei o tom muito sério. Deixe mais informal e jovem, cite que o ingresso é grátis na bio e faça a headline em forma de pergunta para gerar curiosidade.'"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="bg-slate-950 border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 resize-none h-24"
              maxLength={600}
            />
            <p className="text-[11px] text-slate-400 text-right mt-1">{instruction.length}/600 caracteres</p>
          </div>

          {/* Troca Rápida de Parâmetros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Forçar outro Formato:</label>
              <Select value={selectedFormat} onValueChange={(val) => val && setSelectedFormat(val)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 text-xs">
                  <SelectValue placeholder="Manter o formato atual" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                  <SelectItem value="manter">Manter formato atual ({pitch.formato.split("(")[0]})</SelectItem>
                  <SelectItem value="reels">Reels Curto (Roteiro em 3 Cenas)</SelectItem>
                  <SelectItem value="carrossel">Carrossel Educativo (4 a 6 Telas)</SelectItem>
                  <SelectItem value="card">Card Único de Alto Impacto</SelectItem>
                  <SelectItem value="stories">Sequência de 3 Stories Interativos</SelectItem>
                  <SelectItem value="linkedin">Artigo / Post Executivo (LinkedIn)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Ajustar Tom de Voz:</label>
              <Select value={selectedTone} onValueChange={(val) => val && setSelectedTone(val)}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 text-xs">
                  <SelectValue placeholder="Manter tom padrão da persona" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                  <SelectItem value="manter">Manter tom recomendado da Persona</SelectItem>
                  <SelectItem value="descontraido">Mais Jovem e Bem-humorado</SelectItem>
                  <SelectItem value="provocativo">Mais Provocativo e Urgente</SelectItem>
                  <SelectItem value="emocional">Mais Afetivo e Comunitário</SelectItem>
                  <SelectItem value="b2b">Mais Executivo e Focado em Negócios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Histórico de Versões se houver */}
          {pitch.previousVersions && pitch.previousVersions.length > 0 && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 mt-2">
              <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-amber-400" />
                Versões Anteriores Preservadas:
              </p>
              <div className="space-y-2 text-xs">
                {pitch.previousVersions.map((v) => (
                  <div key={v.version} className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="truncate">
                      <span className="font-mono text-amber-400 font-bold mr-1.5">v{v.version}:</span>
                      <span className="text-slate-300 text-[11px] truncate">{v.changeNote}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(v)}
                      className="h-6 text-[10px] px-2 border-slate-700 bg-slate-950 text-amber-300 hover:text-white hover:bg-slate-800"
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

        <DialogFooter className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs">
            Cancelar
          </Button>
          <Button
            onClick={handleRefine}
            disabled={isSubmitting || (!instruction && selectedFormat === "manter" && selectedTone === "manter")}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-semibold"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Reescrevendo com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Aplicar Mudanças e Salvar Nova Versão (v{pitch.version + 1})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
