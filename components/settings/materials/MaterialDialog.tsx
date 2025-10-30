import React, { useState, useEffect } from "react";
import { useMaterials } from "../../../hooks/useMaterials";
import { MediaUploadCard } from "../../media/MediaUploadCard";
import Modal from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Plus, Loader2 } from 'lucide-react';
import { toast } from "../../../hooks/use-toast";

export function MaterialDialog() {
  const { groups, createMaterial } = useMaterials();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", group_id: "", sku: "", unit: "m", drive_file_id: "", url_public: "" });

  useEffect(() => {
    if (!isOpen) {
        setForm({ name: "", group_id: "", sku: "", unit: "m", drive_file_id: "", url_public: "" });
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!form.name || !form.group_id) {
        toast({ title: "Atenção", description: "Nome e Grupo são obrigatórios.", variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    await createMaterial(form);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  const handleUploadSuccess = (result: { drive_file_id: string; url_public: string }) => {
      setForm(prev => ({ ...prev, drive_file_id: result.drive_file_id, url_public: result.url_public }));
      toast({ title: "Imagem Anexada!", description: "A imagem do material foi vinculada."});
  };

  const inputStyle = "w-full px-3 py-2 border border-border dark:border-dark-border rounded-xl shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Material
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Novo Material Básico">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome do material"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputStyle}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
                type="text"
                placeholder="SKU / Código"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={inputStyle}
            />
            <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className={inputStyle}
            >
                <option value="m">Metro (m)</option>
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilo (kg)</option>
            </select>
          </div>
          <select
            value={form.group_id}
            onChange={(e) => setForm({ ...form, group_id: e.target.value })}
            className={inputStyle}
          >
            <option value="">Selecione o grupo de suprimento</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <div>
            <p className="text-sm font-medium text-textSecondary mb-2">Imagem do Material</p>
            <MediaUploadCard module="materials" category="texture" onUploadSuccess={handleUploadSuccess} />
             {form.url_public && (
                <div className="mt-2 text-xs text-green-600">
                    Imagem selecionada: <a href={form.url_public} target="_blank" rel="noreferrer" className="underline">Visualizar</a>
                </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Salvar Material
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}