"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Plus, Mic, Music, Newspaper, Sparkles, Calendar, ExternalLink } from "lucide-react";
import { FestivalUpdate } from "@/data/mockData";
import { toast } from "sonner";

interface HubScreenProps {
  updates: FestivalUpdate[];
  onAddUpdate: (newUpdate: FestivalUpdate) => void;
}

export function HubScreen({ updates, onAddUpdate }: HubScreenProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<"speaker" | "show" | "release" | "world" | "logistics">("speaker");
  const [title, setTitle] = useState("");
  const [world, setWorld] = useState("Itaipu Parquetec");
  const [summary, setSummary] = useState("");

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      toast.error("Preencha o título e o resumo da novidade.");
      return;
    }

    const newUpdate: FestivalUpdate = {
      id: `up-${Date.now()}`,
      type,
      title: title.trim(),
      world,
      summary: summary.trim()
    };

    onAddUpdate(newUpdate);
    setTitle("");
    setSummary("");
    setIsAdding(false);
    toast.success("Atualização adicionada ao Hub e disponível para o Gerador de Pautas!");
  };

  const worldsList = [
    { name: "Mundo Itaipu Parquetec", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", focus: "Inovação aplicada, negócios, transição energética e anfitrião" },
    { name: "Mundo FICiências", color: "text-rose-400 bg-rose-400/10 border-rose-400/30", focus: "4.300+ inscrições, 500 projetos de jovens pesquisadores (BR, PY, AR)" },
    { name: "Mundo Sapiens", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", focus: "16+ universidades, cultura gamer, IA, futuro das profissões" },
    { name: "Mundo Summit Tour", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", focus: "Futuro do turismo sustentável, hotelaria e hospitalidade" },
    { name: "Mundo FIMS (Música)", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", focus: "Feira de música do sul, negócios fonográficos e 4 grandes shows" },
    { name: "Mundo RME (Mulheres)", color: "text-purple-400 bg-purple-400/10 border-purple-400/30", focus: "Rede Mulher Empreendedora, liderança feminina e autonomia" }
  ];

  return (
    <div className="space-y-8">
      {/* OS 6 MUNDOS DO FESTIVAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Os 6 Mundos Oficiais do Festival Iguassu Inova 2026
          </h2>
          <Badge variant="outline" className="text-slate-400 border-slate-700 text-xs">
            25 a 28 de Novembro • 100% Gratuito
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {worldsList.map((w) => (
            <Card key={w.name} className="border-slate-800 bg-slate-900/80 p-4 space-y-1.5">
              <Badge className={`${w.color} border text-xs`}>{w.name}</Badge>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{w.focus}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ÁREA DE ATUALIZAÇÕES CADASTRADAS & FORMULÁRIO DE NOVA ATUALIZAÇÃO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-400" />
              Feed de Novidades e Atualizações do Evento
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Palestrantes, shows, releases da assessoria e avisos que a IA pode cruzar nas pautas.
            </p>
          </div>

          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? "Fechar Formulário" : "Cadastrar Nova Atualização"}
          </Button>
        </div>

        {/* FORMULÁRIO COLAPSÁVEL DE CADASTRO */}
        {isAdding && (
          <Card className="border-amber-500/40 bg-slate-950 p-5 shadow-lg">
            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Cadastrar Novidade Oficial do Festival
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="update-type" className="block text-slate-300 mb-1 font-semibold">Tipo de Atualização:</label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger id="update-type" className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                      <SelectItem value="speaker">Novo Palestrante / Keynote</SelectItem>
                      <SelectItem value="show">Show Musical Confirmado</SelectItem>
                      <SelectItem value="release">Release de Imprensa Oficial</SelectItem>
                      <SelectItem value="logistics">Aviso Logístico / Transporte</SelectItem>
                      <SelectItem value="world">Destaque de Mundo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="update-world" className="block text-slate-300 mb-1 font-semibold">Mundo Relacionado:</label>
                  <Select value={world} onValueChange={(val) => val && setWorld(val)}>
                    <SelectTrigger id="update-world" className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                      <SelectItem value="Itaipu Parquetec">Itaipu Parquetec</SelectItem>
                      <SelectItem value="FICiências">FICiências</SelectItem>
                      <SelectItem value="Sapiens">Sapiens</SelectItem>
                      <SelectItem value="Summit Tour">Summit Tour</SelectItem>
                      <SelectItem value="FIMS">FIMS (Música)</SelectItem>
                      <SelectItem value="RME">RME (Mulher Empreendedora)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="update-title" className="block text-slate-300 mb-1 font-semibold">Título ou Nome da Atração:</label>
                  <Input
                    id="update-title"
                    placeholder="Ex: Caito Maia confirmado no Parquetec"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs"
                    maxLength={150}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="update-summary" className="block text-slate-300 mb-1 font-semibold">Resumo dos Fatos / Detalhes para a IA:</label>
                <Textarea
                  id="update-summary"
                  placeholder="Cole o trecho do release, tópicos da palestra, horários ou informações que a IA deve usar..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100 text-xs resize-none h-20"
                  maxLength={1000}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-400 text-xs">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold">
                  Salvar e Disponibilizar no Gerador
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* LISTAGEM DOS ITENS NO HUB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {updates.map((item) => (
            <Card key={item.id} className="border-slate-800 bg-slate-900 p-4 space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                  {item.world}
                </Badge>
                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1 font-bold">
                  {item.type === "speaker" && <Mic className="w-3 h-3" />}
                  {item.type === "show" && <Music className="w-3 h-3" />}
                  {item.type === "release" && <Newspaper className="w-3 h-3" />}
                  {item.type}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
