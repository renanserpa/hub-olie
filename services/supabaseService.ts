// Renamed from firestoreService.ts
import { supabase } from '../lib/supabaseClient';
// FIX: Added missing type imports for Task, TaskStatus, InventoryBalance, InventoryMovement, and ProductCategory.
import {
    AnyProduct,
    AppData,
    BasicMaterial,
    BiasColor,
    Contact,
    InventoryBalance,
    InventoryMovement,
    MonogramFont,
    Order, OrderItem, OrderStatus,
    Product,
    ProductCategory,
    ProductionOrder,
    SettingsCategory,
    Task,
    TaskStatus,
    ZipperColor,
} from "../types";

const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    // Avoid throwing here to let components handle the UI state
    // throw new Error(`Supabase operation failed in ${context}.`);
};

// --- Generic Helpers ---

const getCollection = async <T>(table: string, join?: string): Promise<T[]> => {
    const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
    const { data, error } = await query;
    if (error) {
        handleError(error, `getCollection(${table})`);
        return []; // Return empty array on error
    }
    return (data as T[]) || [];
};

// --- App-specific Methods ---
export const supabaseService = {
  // FIX: Exposed getCollection for use in other parts of the application, like the useInventory hook.
  getCollection,
  // ... existing generic helpers can be exposed if needed, but specific functions are safer.
  
  listenToCollection: <T>(table: string, join: string | undefined, callback: (payload: T[]) => void) => {
      const channel = supabase.channel(`public:${table}`);
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: table },
          async (payload) => {
            console.log(`Change detected in ${table}, refetching...`, payload);
            const data = await getCollection<T>(table, join);
            callback(data);
          }
        )
        .subscribe();

      return {
        unsubscribe: () => {
          supabase.removeChannel(channel);
        },
      };
  },
  
  listenToDocument: <T>(table: string, id: string, callback: (payload: T) => void) => {
      const channel = supabase.channel(`public:${table}:${id}`);
      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: table,
            filter: `id=eq.${id}`,
          },
          (payload) => {
            callback(payload.new as T);
          }
        )
        .subscribe();

      return {
        unsubscribe: () => {
          supabase.removeChannel(channel);
        },
      };
  },

  getSettings: async (): Promise<AppData> => {
    console.log("[DATA] Fetching settings...");
    // Only fetch from tables that are confirmed to exist in schema.json
    const [
        tecido,
        ziper,
        vies,
        fontes_monogramas,
        materiais_basicos,
    ] = await Promise.all([
        getCollection('fabric_colors'),
        getCollection('zipper_colors'),
        getCollection('bias_colors'),
        getCollection('config_fonts'),
        getCollection('config_basic_materials'),
    ]).catch(err => {
        handleError(err, 'getSettings');
        return [[],[],[],[],[]]; // Return empty arrays on Promise.all failure
    });
    
    // Warn about missing tables that were previously queried
    console.warn("[DATA] Tabela/coluna ausente: 'config_color_palettes', 'lining_colors', 'puller_colors', 'embroidery_colors', 'fabric_textures', 'config_supply_groups', 'system_settings' e tabelas de logística não foram consultadas pois não existem no schema.json. A UI usará um estado vazio.");

    return {
        catalogs: {
            paletas_cores: [], // Non-existent table
            cores_texturas: {
                tecido: tecido as any[],
                ziper: ziper as any[],
                vies: vies as any[],
                forro: [], // Non-existent
                puxador: [], // Non-existent
                bordado: [], // Non-existent
                texturas: [], // Non-existent
            },
            fontes_monogramas: fontes_monogramas as any[],
        },
        materials: {
            grupos_suprimento: [], // Non-existent
            materiais_basicos: materiais_basicos as any[],
        },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] }, // All non-existent
        sistema: [], // Non-existent
        // Placeholder for module-specific data
        midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
    };
  },

  getOrders: async (): Promise<Order[]> => {
    // Corrected join from 'contacts' to 'customers'
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*, customers(*)');
    if (ordersError) {
        handleError(ordersError, 'getOrders');
        return [];
    }
    if (!ordersData) return [];

    const orderIds = ordersData.map(o => o.id);
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (itemsError) {
        handleError(itemsError, 'getOrders (items)');
        // Continue with orders even if items fail
    }

    const itemsByOrderId = itemsData?.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
    }, {} as Record<string, OrderItem[]>) || {};

    return ordersData.map(order => ({ ...order, items: itemsByOrderId[order.id] || [] })) as Order[];
  },

  getProductionOrders: (): Promise<ProductionOrder[]> => getCollection<ProductionOrder>('production_orders', '*, products(*)'),

  getTasks: (): Promise<Task[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'tasks' não existe. O Kanban de Produção usará um estado vazio.");
    return Promise.resolve([]);
  },
  getTaskStatuses: (): Promise<TaskStatus[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'task_statuses' não existe. O Kanban de Produção usará um estado vazio.");
    return Promise.resolve([]);
  },
  
  getInventoryBalances: (): Promise<InventoryBalance[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'inventory_balances' não existe. O módulo de Estoque usará um estado vazio.");
    return Promise.resolve([]);
  },
  
  getInventoryMovements: (materialId: string): Promise<InventoryMovement[]> => getCollection<InventoryMovement>('inventory_movements'), // Assuming this table exists
  
  getProducts: (): Promise<Product[]> => {
      // Corrected: Removed invalid join on 'category'. The 'category' field is just text.
      return getCollection<Product>('products');
  },

  getProductCategories: (): Promise<ProductCategory[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'product_categories' não existe. O formulário de Produtos usará um estado vazio para categorias.");
    return Promise.resolve([]);
  },

  getContacts: (): Promise<Contact[]> => getCollection<Contact>('customers'),
  
  // Expose base methods for direct use where necessary
  getDocument: async <T>(table: string, id: string): Promise<T | null> => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { 
      handleError(error, `getDocument(${table}, ${id})`);
    }
    return data as T | null;
  },

  addDocument: async <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>): Promise<T> => {
    const { data, error } = await supabase.from(table).insert(docData).select().single();
    if (error) handleError(error, `addDocument(${table})`);
    return data as T;
  },
  
  updateDocument: async <T>(table: string, id: string, docData: Partial<T>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(docData).eq('id', id).select().single();
    if (error) handleError(error, `updateDocument(${table}, ${id})`);
    return data as T;
  },
};