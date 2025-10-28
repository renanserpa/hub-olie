// This file is being prepared for migration to Supabase.
// All Firebase-specific logic has been removed by ArquitetoSupremo.
// SupaDataMaster will implement the Supabase logic.

import {
    AnyProduct,
    AppData,
    BasicMaterial,
    Contact,
    InventoryBalance,
    InventoryMovement,
    Order, OrderStatus,
    Product,
    ProductCategory,
    ProductionOrder,
    SettingsCategory,
    SystemSetting,
    Task,
    TaskStatus,
    User
} from "../types";

const notImplemented = (functionName: string) => {
    console.warn(`firebaseService.${functionName} is not implemented yet.`);
    return Promise.resolve([]);
}

const emptyAppData: AppData = {
    catalogs: { paletas_cores: [], cores_texturas: { tecido: [], ziper: [], forro: [], puxador: [], vies: [], bordado: [], texturas: [] }, fontes_monogramas: [] },
    materials: { grupos_suprimento: [], materiais_basicos: [] },
    logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
    sistema: [],
    midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
};

export const firebaseService = {
  getCollection: <T>(path: string): Promise<T[]> => notImplemented(`getCollection(${path})`) as Promise<T[]>,
  getDocument: <T>(path: string, id: string): Promise<T | null> => {
      console.warn(`firebaseService.getDocument(${path}, ${id}) is not implemented yet.`);
      return Promise.resolve(null);
  },
  addDocument: (path: string, data: any) => notImplemented(`addDocument(${path})`),
  updateDocument: (path: string, id: string, data: any) => notImplemented(`updateDocument(${path}, ${id})`),
  deleteDocument: (path: string, id: string) => notImplemented(`deleteDocument(${path}, ${id})`),
  
  // App-specific methods
  getSettings: async (): Promise<AppData> => {
    console.warn('getSettings not implemented');
    return Promise.resolve(emptyAppData);
  },

  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) => notImplemented('addSetting'),
  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) => notImplemented('updateSetting'),
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) => notImplemented('deleteSetting'),
  updateSystemSettings: async (settings: SystemSetting[]) => notImplemented('updateSystemSettings'),

  getOrders: (): Promise<Order[]> => notImplemented('getOrders'),
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
      throw new Error("updateOrderStatus not implemented");
  },
  addOrder: async (orderData: Partial<Order>) => notImplemented('addOrder'),
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => {
        throw new Error("updateOrder not implemented");
  },

  getProductionOrders: (): Promise<ProductionOrder[]> => notImplemented('getProductionOrders'),
  getTasks: (): Promise<Task[]> => notImplemented('getTasks'),
  getTaskStatuses: (): Promise<TaskStatus[]> => notImplemented('getTaskStatuses'),
  updateTask: (taskId: string, data: Partial<Task>) => notImplemented('updateTask'),

  getInventoryBalances: (): Promise<InventoryBalance[]> => notImplemented('getInventoryBalances'),
  getAllBasicMaterials: (): Promise<BasicMaterial[]> => notImplemented('getAllBasicMaterials'),
  getInventoryMovements: async (materialId: string): Promise<InventoryMovement[]> => notImplemented('getInventoryMovements'),
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => notImplemented('addInventoryMovement'),
  
  getProducts: (): Promise<Product[]> => notImplemented('getProducts'),
  getProductCategories: (): Promise<ProductCategory[]> => notImplemented('getProductCategories'),
  addProduct: (productData: AnyProduct) => notImplemented('addProduct'),
  updateProduct: (productId: string, productData: Product | AnyProduct) => notImplemented('updateProduct'),
};