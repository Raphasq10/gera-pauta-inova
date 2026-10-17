"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Upload, FileSpreadsheet, Plus, Edit, Bus, MapPin, GraduationCap, Briefcase, RefreshCw, CheckCircle2 } from "lucide-react";
import { PersonaData } from "@/data/mockData";
import { PersonaEditModal } from "@/components/PersonaEditModal";
import { toast } from "sonner";

interface PersonasScreenProps {
  personas: PersonaData[];
  onPersonasUpdated: (newPersonas: PersonaData[]) => void;
}

export function PersonasScreen({ personas, onPersonasUpdated }: PersonasScreenProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaData>(personas[1] || personas[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<PersonaData | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isUploading) return; // Prevenção contra race condition / double-click

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-xlsx", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erro ao processar planilha.");
      }

      onPersonasUpdated(data.personas);
      setSelectedPersona(data.personas[0]);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message || "Falha no envio da planilha.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reseta o input para permitir reenvio
    }
  };

  const handleOpenEdit = (p: PersonaData) => {
    setEditingPersona(p);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = (saved: PersonaData) => {
    const exists = personas.some((p) => p.id === saved.id);
    let updatedList: PersonaData[];
    if (exists) {
      updatedList = personas.map((p) => (p.id === saved.id ? saved : p));
    } else {
      updatedList = [...personas, saved];
    }
    onPersonasUpdated(updatedList);
    setSelectedPersona(saved);
  };

  return (
    <div className="space-y-8">
      {/* SEÇÃO SUPERIOR: CARREGAMENTO DA PLANILHA YAZO 2026 */}
      <Card className="border-slate-800 bg-slate-900/90 shadow">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Importar Nova Base da Yazo Tickets (.xlsx)</h3>
                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Filtro LGPD Ativo
                </Badge>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Ao subir uma nova exportação da Yazo, o sistema descarta automaticamente menores de idade (colunas de autorização e menores de 18 anos) e remove CPFs, telefones e e-mails no próprio computador, recalculando os percentuais das 4 personas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <span className={`inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs px-3.5 py-2 gap-2 font-semibold transition ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      Processando e Filtrando Menores...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      Subir Nova Planilha .xlsx
                    </>
                  )}
                </span>
              </label>

              <Button
                variant="outline"
                onClick={handleOpenCreate}
                className="border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs gap-1.5 font-semibold"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                Nova Persona
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SELEÇÃO DAS PERSONAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {personas.map((p) => {
          const isSelected = p.id === selectedPersona.id;
          return (
            <Card
              key={p.id}
              onClick={() => setSelectedPersona(p)}
              className={`cursor-pointer transition-all border ${
                isSelected
                  ? "border-amber-500 bg-slate-900 shadow-md shadow-amber-500/10"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start gap-1">
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 uppercase tracking-wider font-mono">
                    {p.category}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-amber-400">{p.pctOfAdults}%</span>
                </div>
                <CardTitle className="text-sm font-bold text-slate-100 mt-2 leading-snug">
                  {p.name.split("(")[0]}
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400 line-clamp-1">
                  {p.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Inscritos adultos:</span>
                  <span className="font-bold text-slate-200 font-mono">{p.count}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Idade média:</span>
                  <span className="text-slate-200 font-mono">{p.avgAge} anos</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* DETALHES DA PERSONA SELECIONADA */}
      <Card className="border-slate-800 bg-slate-900 shadow-xl">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-lg font-bold text-white">{selectedPersona.name}</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400 mt-1">
                {selectedPersona.role} • Média de {selectedPersona.avgAge} anos • {selectedPersona.genderPct}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(selectedPersona)}
                className="border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-amber-400" />
                Editar Parâmetros
              </Button>
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
                {selectedPersona.count} Inscritos Válidos (16/10/2026)
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 text-xs">
          {/* Dor Principal & Tom de Voz */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                🔴 Dor Principal do Segmento:
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">&ldquo;{selectedPersona.keyPain}&rdquo;</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                🎯 Tom de Voz Ideal para Pautas:
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">{selectedPersona.tone}</p>
            </div>
          </div>

          {/* Gráficos de Barras com Interesses Reais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Interesses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Top Áreas de Interesse (Coluna 41 Yazo)
              </h4>
              <div className="space-y-2.5">
                {selectedPersona.topInterests.map((interest) => (
                  <div key={interest.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{interest.label}</span>
                      <span className="font-mono font-bold text-amber-400">{interest.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(interest.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Objetivos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Principal Objetivo ao Participar (Coluna 42 Yazo)
              </h4>
              <div className="space-y-2.5">
                {selectedPersona.topGoals.map((goal) => (
                  <div key={goal.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{goal.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{goal.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${Math.min(goal.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formatos Sugeridos */}
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              📐 Formatos de Pauta Recomendados para esta Persona:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedPersona.suggestedFormats.map((fmt) => (
                <Badge key={fmt} className="bg-slate-800 text-slate-200 border-slate-700 text-xs">
                  {fmt}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação / Edição */}
      <PersonaEditModal
        persona={editingPersona}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
