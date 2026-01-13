import { dataService } from "./dataService";
import { Material, MaterialGroup } from "../types";

export const materialsService = {
  getMaterials: (): Promise<Material[]> => dataService.getMaterials(),
  getMaterialGroups: (): Promise<MaterialGroup[]> => dataService.getMaterialGroups(),
  addMaterial: (material: any): Promise<Material> => dataService.addMaterial(material),
  addMaterialGroup: (group: any): Promise<MaterialGroup> => dataService.addMaterialGroup(group),
};