import React, { useState, useEffect } from "react";
import { useMaterials } from "../../../hooks/useMaterials";
import Modal from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Plus, Loader2 } from 'lucide-react';

export function MaterialGroupDialog() {
  const { createGroup } = useMaterials();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  
  useEffect(() => {
    if (!isOpen) {
        setForm({ name: "", description: "" });
    }
  }, [isOpen]);

  async function handleSave() {
    setIsSubmitting(true);
    await createGroup(form);
    setIsSubmitting(false);
    setIsOpen(false);
  }
  
  const inputStyle = "w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Grupo
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Novo Grupo de Suprimento">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome do grupo (ex: Tecidos)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputStyle}
            required
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputStyle}
            rows={3}
          />
           <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Salvar Grupo
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
