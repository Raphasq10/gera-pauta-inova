"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Plus, Mic, Music, Newspaper, Sparkles, Trash2, Filter, Info, Bus } from "lucide-react";
import { FestivalUpdate } from "@/data/mockData";
import { FestivalUpdateFormSchema } from "@/lib/schemas";
import { toast } from "sonner";

interface HubScreenProps {
  updates: FestivalUpdate[];
  onAddUpdate: (newUpdate: FestivalUpdate) => void;
  onDeleteUpdate?: (id: string) => void;
}

export function HubScreen({ updates, onAddUpdate, onDeleteUpdate }: HubScreenProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<"speaker" | "show" | "release" | "world" | "logistics">("speaker");
  const [title, setTitle] = useState("");
  const [world, setWorld] = useState("Itaipu Parquetec");
  const [dateOrTime, setDateOrTime] = useState("");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevenção contra race conditions / double-click

    // 1. Validação no cliente com Zod
    const validation = FestivalUpdateFormSchema.safeParse({
      type,
      title: title.trim(),
      world: world.trim(),
      dateOrTime: dateOrTime.trim() || undefined,
      summary: summary.trim()
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Por favor, corrija os campos indicados.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erro ao salvar no Hub.");
      }

      onAddUpdate(data.update);
      setTitle("");
      setSummary("");
      setDateOrTime("");
      setIsAdding(false);
      toast.success(`"${data.update.title}" cadastrado e disponível imediatamente no Gerador de Pautas!`);
    } catch (err: any) {
      toast.error(err.message || "Falha na comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Deseja realmente remover "${itemTitle}" do Hub?`)) return;

    try {
      const res = await fetch(`/api/updates?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erro ao excluir.");
      }

      if (onDeleteUpdate) onDeleteUpdate(id);
      toast.success("Item removido do Hub com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Falha ao excluir item.");
    }
  };

  const filteredUpdates = updates.filter((u) => {
    if (filterType === "all") return true;
    return u.type === filterType;
  });

  const worldsList = [
    { name: "Mundo Itaipu Parquetec", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", focus: "Inovação aplicada, negócios, inteligência artificial e anfitrião do festival" },
    { name: "Mundo FICiências", color: "text-rose-400 bg-rose-400/10 border-rose-400/30", focus: "4.300+ inscrições, 500 projetos expostos de jovens pesquisadores (BR, PY, AR)" },
    { name: "Mundo Sapiens", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", focus: "16+ universidades, cultura gamer, tecnologias do futuro e profissões" },
    { name: "Mundo Summit Tour", color: "text-orange-400 bg-orange-400/10 border-orange-400/30", focus: "Futuro do turismo sustentável, hospitalidade e traveltechs" },
    { name: "Mundo FIMS (Música)", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", focus: "Feira de música, negócios fonográficos e 4 grandes shows nacionais" },
    { name: "Mundo RME (Mulheres)", color: "text-purple-400 bg-purple-400/10 border-purple-400/30", focus: "Rede Mulher Empreendedora, liderança feminina e negócios de impacto" }
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

      {/* ÁREA DE ATUALIZAÇÕES & FORMULÁRIO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-400" />
              Repositório de Atualizações e Contexto Oficial
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {updates.length} atrações, releases e notas oficiais que alimentam a Inteligência Artificial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Tipo */}
            <Select value={filterType} onValueChange={(val) => val && setFilterType(val)}>
              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 text-xs h-8 w-36">
                <SelectValue placeholder="Filtrar tipo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                <SelectItem value="all">Todos ({updates.length})</SelectItem>
                <SelectItem value="speaker">Palestrantes</SelectItem>
                <SelectItem value="show">Shows</SelectItem>
                <SelectItem value="release">Releases</SelectItem>
                <SelectItem value="world">Mundos</SelectItem>
                <SelectItem value="logistics">Logística</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-semibold h-8"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? "Fechar Formulário" : "Cadastrar Nova Atualização"}
            </Button>
          </div>
        </div>

        {/* FORMULÁRIO SEGURO DE CADASTRO */}
        {isAdding && (
          <Card className="border-amber-500/40 bg-slate-950 p-5 shadow-lg">
            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Cadastrar Nova Informação Oficial para a IA
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="update-type" className="block text-slate-300 mb-1 font-semibold">
                    Tipo de Atualização *
                  </label>
                  <Select value={type} onValueChange={(val: any) => val && setType(val)}>
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
                  <label htmlFor="update-world" className="block text-slate-300 mb-1 font-semibold">
                    Mundo Relacionado *
                  </label>
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
                      <SelectItem value="Todos os Mundos">Todos os Mundos / Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="update-title" className="block text-slate-300 mb-1 font-semibold">
                    Título ou Nome da Atração *
                  </label>
                  <Input
                    id="update-title"
                    placeholder="Ex: Novo Palestrante de Inteligência Artificial"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs"
                    maxLength={150}
                  />
                  {errors.title && <span className="text-rose-400 text-[11px] block mt-0.5">{errors.title}</span>}
                </div>
              </div>

              <div>
                <label htmlFor="update-summary" className="block text-slate-300 mb-1 font-semibold">
                  Resumo dos Fatos / Detalhes para a IA *
                </label>
                <Textarea
                  id="update-summary"
                  placeholder="Cole o trecho do comunicado, biografia do palestrante, data/horário ou aviso prático que a IA deve utilizar para fundamentar as pautas..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100 text-xs resize-none h-24"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  {errors.summary ? (
                    <span className="text-rose-400">{errors.summary}</span>
                  ) : (
                    <span>Mínimo 10 caracteres. A IA usará esses detalhes como base fática.</span>
                  )}
                  <span>{summary.length}/2000</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-400 text-xs">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold gap-1.5"
                >
                  {isSubmitting ? "Salvando no Banco..." : "Salvar e Disponibilizar no Gerador"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* LISTAGEM DOS ITENS NO HUB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUpdates.map((item) => (
            <Card key={item.id} className="border-slate-800 bg-slate-900 p-4 space-y-2 hover:border-slate-700 transition relative group">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                  {item.world}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1 font-bold">
                    {item.type === "speaker" && <Mic className="w-3 h-3" />}
                    {item.type === "show" && <Music className="w-3 h-3" />}
                    {item.type === "release" && <Newspaper className="w-3 h-3" />}
                    {item.type === "logistics" && <Bus className="w-3 h-3" />}
                    {item.type === "world" && <Layers className="w-3 h-3" />}
                    {item.type}
                  </span>

                  {onDeleteUpdate && item.id.startsWith("up-") && item.id.length > 15 && (
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-rose-400 p-1"
                      title="Excluir do Hub"
                      aria-label={`Excluir ${item.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
