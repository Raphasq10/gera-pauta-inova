"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History, Users, Layers, ExternalLink, Calendar, MapPin, ShieldCheck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { GeneratorScreen } from "@/components/GeneratorScreen";
import { HistoryScreen } from "@/components/HistoryScreen";
import { PersonasScreen } from "@/components/PersonasScreen";
import { HubScreen } from "@/components/HubScreen";
import { INITIAL_PERSONAS, INITIAL_UPDATES, INITIAL_PITCHES, PersonaData, FestivalUpdate, PitchContent } from "@/data/mockData";

export default function Home() {
  const [personas, setPersonas] = useState<PersonaData[]>(INITIAL_PERSONAS);
  const [updates, setUpdates] = useState<FestivalUpdate[]>(INITIAL_UPDATES);
  const [pitches, setPitches] = useState<PitchContent[]>(INITIAL_PITCHES);
  const [activeTab, setActiveTab] = useState<string>("generator");

  const handleNewPitchesGenerated = (newPitches: PitchContent[]) => {
    // Adiciona as novas pautas no topo da lista (histórico automático)
    setPitches((prev) => [...newPitches, ...prev]);
  };

  const handleUpdatePitch = (pitchId: string, updatedFields: Partial<PitchContent>) => {
    setPitches((prev) =>
      prev.map((p) => (p.id === pitchId ? { ...p, ...updatedFields } : p))
    );
  };

  const handleAddUpdate = (newUpdate: FestivalUpdate) => {
    setUpdates((prev) => [newUpdate, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      <Toaster position="top-right" richColors />

      {/* HEADER SUPERIOR FIXO / INSTITUCIONAL */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo e Nome do Produto */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-white text-base">
              II
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  InovaPauta AI
                </h1>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] py-0 px-2 font-mono">
                  Festival 2026
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Gerador Inteligente de Conteúdo baseado nos Inscritos • Itaipu Parquetec
              </p>
            </div>
          </div>

          {/* Dados Rápidos do Evento & Conformidade */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="hidden lg:flex items-center gap-4 border-r border-slate-800 pr-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                25 a 28 de Novembro de 2026
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Foz do Iguaçu (PR)
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-mono font-semibold">7.065</span>
              <span className="text-slate-400">adultos mapeados</span>
            </div>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL COM AS 4 TELAS EM ABAS */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto h-auto">
            <TabsTrigger
              value="generator"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs font-semibold py-2 gap-1.5 text-slate-300 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              1. Gerador de Pautas
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs font-semibold py-2 gap-1.5 text-slate-300 transition"
            >
              <History className="w-3.5 h-3.5" />
              2. Histórico ({pitches.length})
            </TabsTrigger>

            <TabsTrigger
              value="personas"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs font-semibold py-2 gap-1.5 text-slate-300 transition"
            >
              <Users className="w-3.5 h-3.5" />
              3. Personas & Dados
            </TabsTrigger>

            <TabsTrigger
              value="hub"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs font-semibold py-2 gap-1.5 text-slate-300 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              4. Hub do Festival
            </TabsTrigger>
          </TabsList>

          {/* TELA 1: GERADOR DE PAUTAS */}
          <TabsContent value="generator" className="outline-none focus:ring-0">
            <GeneratorScreen
              personas={personas}
              updates={updates}
              pitches={pitches}
              onNewPitchesGenerated={handleNewPitchesGenerated}
              onUpdatePitch={handleUpdatePitch}
            />
          </TabsContent>

          {/* TELA 2: HISTÓRICO DE PAUTAS */}
          <TabsContent value="history" className="outline-none focus:ring-0">
            <HistoryScreen
              pitches={pitches}
              personas={personas}
              onUpdatePitch={handleUpdatePitch}
            />
          </TabsContent>

          {/* TELA 3: PERSONAS & DADOS DOS INSCRITOS */}
          <TabsContent value="personas" className="outline-none focus:ring-0">
            <PersonasScreen
              personas={personas}
              onPersonasUpdated={(updatedPersonas) => setPersonas(updatedPersonas)}
            />
          </TabsContent>

          {/* TELA 4: HUB DO FESTIVAL */}
          <TabsContent value="hub" className="outline-none focus:ring-0">
            <HubScreen updates={updates} onAddUpdate={handleAddUpdate} />
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER INFORMATIVO */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Festival Iguassu Inova 2026 • Realização: <strong>Itaipu Parquetec & Itaipu Binacional</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            Uso interno de comunicação • Dados anonimizados em conformidade com a LGPD
          </p>
        </div>
      </footer>
    </div>
  );
}
