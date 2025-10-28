// services/firestoreService.ts
import { supabase } from '../lib/supabaseClient';
import {
    AnyProduct,
    AppData,
    BasicMaterial,
    BiasColor,
    BondType,
    ColorPalette,
    Contact,
    DeliveryMethod,
    EmbroideryColor,
    FabricColor,
    FabricTexture,
    FreightParams,
    InventoryBalance,
    InventoryMovement,
    LiningColor,
    MonogramFont,
    Order, OrderStatus,
    PackagingType,
    Product,
    ProductCategory,
    ProductionOrder,
    PullerColor,
    SettingsCategory,
    SupplyGroup,
    SystemSetting,
    Task,
    TaskStatus,
    ZipperColor,
} from "../types";


const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    throw new Error(`Supabase operation failed in ${context}.`);
};

// --- Generic Helpers ---

const getCollection = async <T>(table: string, join?: string): Promise<T[]> => {
    const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
    const { data, error } = await query;
    if (error) handleError(error, `getCollection(${table})`);
    return (data as T[]) || [];
};

const getDocument = async <T>(table: string, id: string): Promise<T | null> => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { // Ignore "exact one row" error for not found
      handleError(error, `getDocument(${table}, ${id})`);
    }
    return data as T | null;
};

const addDocument = async <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>): Promise<T> => {
    const { data, error } = await supabase.from(table).insert(docData).select().single();
    if (error) handleError(error, `addDocument(${table})`);
    return data as T;
};

const updateDocument = async <T>(table: string, id: string, docData: Partial<T>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(docData).eq('id', id).select().single();
    if (error) handleError(error, `updateDocument(${table}, ${id})`);
    return data as T;
};

const deleteDocument = async (table: string, id: string): Promise<void> => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) handleError(error, `deleteDocument(${table}, ${id})`);
};


// --- App-specific Methods ---

const getTableNameForSetting = (category: SettingsCategory, subTab: string | null, subSubTab: string | null): string => {
    if (subSubTab) return subSubTab;
    if (subTab) return subTab;
    return category;
};

export const supabaseService = {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  
  getSettings: async (): Promise<AppData> => {
    try {
        const [
            paletas_cores, tecido, ziper, forro, puxador, vies, bordado, texturas, fontes_monogramas,
            grupos_suprimento, materiais_basicos,
            metodos_entrega, calculo_frete, tipos_embalagem, tipos_vinculo,
            sistema
        ] = await Promise.all([
// FIX: Added explicit generic types to `getCollection` calls to resolve type errors.
            getCollection<ColorPalette>('paletas_cores'), getCollection<FabricColor>('cores_tecido'), getCollection<ZipperColor>('cores_ziper'), getCollection<LiningColor>('cores_forro'), getCollection<PullerColor>('cores_puxador'), getCollection<BiasColor>('cores_vies'), getCollection<EmbroideryColor>('cores_bordado'), getCollection<FabricTexture>('texturas_tecido'), getCollection<MonogramFont>('fontes_monograma'),
            getCollection<SupplyGroup>('grupos_suprimento'), getCollection<BasicMaterial>('materiais_basicos'),
            getCollection<DeliveryMethod>('metodos_entrega'), getCollection<FreightParams>('calculo_frete'), getCollection<PackagingType>('tipos_embalagem'), getCollection<BondType>('tipos_vinculo'),
            getCollection<SystemSetting>('sistema')
        ]);
        
        return {
            catalogs: { 
                paletas_cores, 
                cores_texturas: { tecido, ziper, forro, puxador, vies, bordado, texturas }, 
                fontes_monogramas 
            },
            materials: { grupos_suprimento, materiais_basicos },
            logistica: { metodos_entrega, calculo_frete, tipos_embalagem, tipos_vinculo },
            sistema,
            // --- These are placeholders as they are fetched by their own modules ---
            midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
        };
    } catch (error) {
        handleError(error, 'getSettings');
        // Return an empty structure on failure
        return {
            catalogs: { paletas_cores: [], cores_texturas: { tecido: [], ziper: [], forro: [], puxador: [], vies: [], bordado: [], texturas: [] }, fontes_monogramas: [] },
            materials: { grupos_suprimento: [], materiais_basicos: [] },
            logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
            sistema: [],
            midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
        };
    }
  },

  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) => {
      const table = getTableNameForSetting(category, subTab, subSubTab);
      return addDocument(table, data);
  },
  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) => {
      const table = getTableNameForSetting(category, subTab, subSubTab);
      return updateDocument(table, id, data);
  },
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) => {
      const table = getTableNameForSetting(category, subTab, subSubTab);
      return deleteDocument(table, id);
  },
  updateSystemSettings: async (settings: SystemSetting[]) => {
      const updates = settings.map(s => updateDocument('sistema', s.id, { value: s.value }));
      return Promise.all(updates);
  },

  getOrders: (): Promise<Order[]> => getCollection<Order>('orders', '*, contacts(*)'),
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
// FIX: Explicitly provided the generic type argument to `updateDocument` to ensure correct type inference for the return value.
      return updateDocument<Order>('orders', orderId, { status: newStatus, updated_at: new Date().toISOString() });
  },
  addOrder: async (orderData: Partial<Order>) => {
      const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const fullOrderData = {
          ...orderData,
          order_number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      };
      return addDocument('orders', fullOrderData);
  },
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => {
        return updateDocument('orders', orderId, { ...data, updated_at: new Date().toISOString() });
  },

  getProductionOrders: (): Promise<ProductionOrder[]> => getCollection('production_orders', '*, products(*)'),
  getTasks: (): Promise<Task[]> => getCollection('tasks'),
  getTaskStatuses: (): Promise<TaskStatus[]> => getCollection('task_statuses'),
  updateTask: (taskId: string, data: Partial<Task>) => updateDocument('tasks', taskId, data),

  getInventoryBalances: (): Promise<InventoryBalance[]> => getCollection('inventory_balances', '*, materials_basicos(*)'),
  getAllBasicMaterials: (): Promise<BasicMaterial[]> => getCollection('materiais_basicos'),
  getInventoryMovements: async (materialId: string): Promise<InventoryMovement[]> => {
    const { data, error } = await supabase.from('inventory_movements').select('*').eq('material_id', materialId).order('created_at', { ascending: false });
    if (error) handleError(error, 'getInventoryMovements');
    return data || [];
  },
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => {
// FIX: Added `created_at` field to the movement data to match the expected type for `addDocument`.
      return addDocument('inventory_movements', { ...movementData, created_at: new Date().toISOString() });
  },
  
  getProducts: (): Promise<Product[]> => getCollection('products', '*, product_categories(*)'),
  getProductCategories: (): Promise<ProductCategory[]> => getCollection('product_categories'),
  addProduct: (productData: AnyProduct) => addDocument('products', productData),
  updateProduct: (productId: string, productData: Product | AnyProduct) => {
      const { id, category, ...updateData } = productData as Product;
      return updateDocument('products', productId, updateData);
  },
};