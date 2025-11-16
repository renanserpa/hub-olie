import { useEffect, useState, useCallback } from "react";
import { materialsService } from "../services/materialsService";
import { Material, MaterialGroup, Supplier } from "../types";
import { toast } from "./use-toast";
import { dataService } from "../services/dataService";

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [groups, setGroups] = useState<MaterialGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Initial fetch remains the same
      const [sups] = await Promise.all([
        dataService.getCollection<Supplier>('suppliers'),
      ]);
      setSuppliers(sups);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível carregar dados de apoio.", variant: "destructive" });
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    
    // Subscribe to realtime updates for materials and groups
    const materialsListener = dataService.listenToCollection<Material>('config_materials', '*, config_supply_groups(name)', (data) => {
      setMaterials(data);
      setLoading(false);
    }, setMaterials);

    const groupsListener = dataService.listenToCollection<MaterialGroup>('config_supply_groups', undefined, (data) => {
      setGroups(data);
      setLoading(false);
    }, setGroups);

    // Unsubscribe on cleanup
    return () => {
      materialsListener.unsubscribe();
      groupsListener.unsubscribe();
    };
  }, [loadInitialData]);


  async function createMaterial(data: any) {
    try {
      await materialsService.addMaterial(data);
      toast({ title: "Sucesso!", description: "Novo material criado." });
      // No manual refresh needed, realtime listener will update state
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível criar o material.", variant: "destructive" });
    }
  }

  async function createGroup(data: any) {
    try {
      await materialsService.addMaterialGroup(data);
      toast({ title: "Sucesso!", description: "Novo grupo de suprimento criado." });
       // No manual refresh needed, realtime listener will update state
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível criar o grupo.", variant: "destructive" });
    }
  }

  return { materials, groups, suppliers, loading, createMaterial, createGroup };
}
