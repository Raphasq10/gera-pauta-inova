"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonaData } from "@/data/mockData";
import { PersonaFormSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { Save, UserPlus, Users } from "lucide-react";

interface PersonaEditModalProps {
  persona: PersonaData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (savedPersona: PersonaData) => void;
}

export function PersonaEditModal({ persona, isOpen, onClose, onSaveSuccess }: PersonaEditModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState<string>("professores");
  const [keyPain, setKeyPain] = useState("");
  const [tone, setTone] = useState("");
  const [suggestedFormats, setSuggestedFormats] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (persona) {
      setName(persona.name);
      setRole(persona.role);
      setCategory(persona.category);
      setKeyPain(persona.keyPain);
      setTone(persona.tone);
      setSuggestedFormats(persona.suggestedFormats.join(", "));
    } else {
      setName("");
      setRole("");
      setCategory("comunidade");
      setKeyPain("");
      setTone("");
      setSuggestedFormats("Carrossel, Reels Curto, Card Único");
    }
    setErrors({});
  }, [persona, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevenção contra double-submit (race conditions)

    const rawFormats = suggestedFormats
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    // Validação com Zod no cliente
    const validation = PersonaFormSchema.safeParse({
      id: persona?.id,
      name,
      role,
      category,
      keyPain,
      tone,
      suggestedFormats: rawFormats.length ? rawFormats : ["Carrossel"]
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Corrija os erros apontados no formulário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!persona?.id;
      const endpoint = "/api/personas";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        id: persona?.id,
        name: name.trim(),
        role: role.trim(),
        category,
        keyPain: keyPain.trim(),
        tone: tone.trim(),
        suggestedFormats: rawFormats
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Falha ao salvar persona.");
      }

      toast.success(isEdit ? "Persona atualizada com sucesso!" : "Nova persona cadastrada com sucesso!");
      onSaveSuccess(data.persona);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado ao salvar persona.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
              {persona ? <Users className="w-5 h-5 text-amber-400" /> : <UserPlus className="w-5 h-5 text-emerald-400" />}
              {persona ? "Editar Persona do Público" : "Cadastrar Nova Persona Customizada"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Personalize dores, tom de voz e formatos recomendados. Esses parâmetros orientam diretamente o gerador de IA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-xs">
            {/* Nome da Persona */}
            <div>
              <label htmlFor="p-name" className="block font-semibold text-slate-200 mb-1">
                Nome da Persona *
              </label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fernanda (Mulheres Empreendedoras RME)"
                maxLength={100}
                className="bg-slate-950 border-slate-700 text-slate-100 text-xs"
              />
              {errors.name && <span className="text-rose-400 text-[11px] mt-0.5 block">{errors.name}</span>}
            </div>

            {/* Descrição do Perfil e Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-role" className="block font-semibold text-slate-200 mb-1">
                  Perfil / Papel *
                </label>
                <Input
                  id="p-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Empreendedoras locais e autônomas"
                  maxLength={150}
                  className="bg-slate-950 border-slate-700 text-slate-100 text-xs"
                />
                {errors.role && <span className="text-rose-400 text-[11px] mt-0.5 block">{errors.role}</span>}
              </div>

              <div>
                <label htmlFor="p-category" className="block font-semibold text-slate-200 mb-1">
                  Categoria
                </label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger id="p-category" className="bg-slate-950 border-slate-700 text-slate-100 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs">
                    <SelectItem value="professores">Professores / Pesquisadores</SelectItem>
                    <SelectItem value="alunos">Universitários Alunos</SelectItem>
                    <SelectItem value="comunidade">Comunidade Local</SelectItem>
                    <SelectItem value="empresarios">Empresários / Negócios</SelectItem>
                    <SelectItem value="outros">Outros Públicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dor Principal */}
            <div>
              <label htmlFor="p-keypain" className="block font-semibold text-slate-200 mb-1">
                Dor Principal / Objeção Chave *
              </label>
              <Textarea
                id="p-keypain"
                value={keyPain}
                onChange={(e) => setKeyPain(e.target.value)}
                placeholder="Qual o maior obstáculo ou dúvida que impede essa persona de se conectar com o festival?"
                maxLength={500}
                className="bg-slate-950 border-slate-700 text-slate-100 text-xs resize-none h-20"
              />
              {errors.keyPain && <span className="text-rose-400 text-[11px] mt-0.5 block">{errors.keyPain}</span>}
            </div>

            {/* Tom de Voz */}
            <div>
              <label htmlFor="p-tone" className="block font-semibold text-slate-200 mb-1">
                Tom de Voz Recomendado *
              </label>
              <Input
                id="p-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ex: Empoderador, prático, acolhedor e focado em conexões reais."
                maxLength={200}
                className="bg-slate-950 border-slate-700 text-slate-100 text-xs"
              />
              {errors.tone && <span className="text-rose-400 text-[11px] mt-0.5 block">{errors.tone}</span>}
            </div>

            {/* Formatos sugeridos */}
            <div>
              <label htmlFor="p-formats" className="block font-semibold text-slate-200 mb-1">
                Formatos Recomendados (separados por vírgula) *
              </label>
              <Input
                id="p-formats"
                value={suggestedFormats}
                onChange={(e) => setSuggestedFormats(e.target.value)}
                placeholder="Carrossel Educativo, Reels Curto, Stories Interativos"
                maxLength={250}
                className="bg-slate-950 border-slate-700 text-slate-100 text-xs"
              />
              {errors.suggestedFormats && (
                <span className="text-rose-400 text-[11px] mt-0.5 block">{errors.suggestedFormats}</span>
              )}
            </div>
          </div>

          <DialogFooter className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 text-xs">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "Salvando..." : "Salvar Persona"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
