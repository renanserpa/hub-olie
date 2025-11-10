import { useEffect, useState, useCallback } from "react";
import { materialsService } from "../services/materialsService";
import { Material, MaterialGroup, Supplier } from "../types";
import { toast } from "./use-toast";
import { dataService } from "../services/dataService";

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [groups, setGroups] = useState<MaterialGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [mats, gps, sups] = await Promise.all([
        materialsService.getMaterials(),
        materialsService.getMaterialGroups(),
        dataService.getCollection<Supplier>('suppliers'),
      ]);
      setMaterials(mats);
      setGroups(gps);
      setSuppliers(sups);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível carregar os dados de materiais.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  async function createMaterial(data: any) {
    try {
      await materialsService.addMaterial(data);
      toast({ title: "Sucesso!", description: "Novo material criado." });
      await refresh();
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível criar o material.", variant: "destructive" });
    }
  }

  async function createGroup(data: any) {
    try {
      await materialsService.addMaterialGroup(data);
      toast({ title: "Sucesso!", description: "Novo grupo de suprimento criado." });
      await refresh();
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível criar o grupo.", variant: "destructive" });
    }
  }

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { materials, groups, suppliers, loading, refresh, createMaterial, createGroup };
}