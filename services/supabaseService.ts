import { supabase } from '../lib/supabaseClient';
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
    console.warn(`[DATA] Falha em ${context}:`, error.message);
    // Não lançar erro para evitar que a UI quebre
};

// --- Generic Helpers ---
const getCollection = async <T>(table: string, join?: string): Promise<T[]> => {
    try {
        const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
        const { data, error } = await query;
        if (error) {
            handleError(error, `getCollection(${table})`);
            return [];
        }
        return (data as T[]) || [];
    } catch (e) {
        handleError(e, `getCollection(${table})`);
        return [];
    }
};

export const supabaseService = {
  getCollection,

  listenToCollection: <T>(table: string, join: string | undefined, callback: (payload: T[]) => void) => {
      const channel = supabase.channel(`public:${table}`);
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: table },
          async () => {
            console.log(`Change detected in ${table}, refetching...`);
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
          { event: 'UPDATE', schema: 'public', table: table, filter: `id=eq.${id}` },
          (payload) => { callback(payload.new as T); }
        )
        .subscribe();
      return { unsubscribe: () => { supabase.removeChannel(channel); }, };
  },

  getSettings: async (): Promise<AppData> => {
    const [tecido, ziper, vies, fontes_monogramas, materiais_basicos] = await Promise.all([
        getCollection('fabric_colors'),
        getCollection('zipper_colors'),
        getCollection('bias_colors'),
        getCollection('config_fonts'),
        getCollection('config_basic_materials'),
    ]);
    console.warn("[DATA] Tabela/coluna ausente: Funções que dependem de 'config_color_palettes', 'lining_colors', 'puller_colors', 'embroidery_colors', 'fabric_textures', 'system_settings' etc. usarão um estado vazio.");
    return {
        catalogs: { paletas_cores: [], cores_texturas: { tecido: tecido as any[], ziper: ziper as any[], vies: vies as any[], forro: [], puxador: [], bordado: [], texturas: [] }, fontes_monogramas: fontes_monogramas as any[], },
        materials: { grupos_suprimento: [], materiais_basicos: materiais_basicos as any[] },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: [], midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
    };
  },

  getOrders: async (): Promise<Order[]> => {
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*, customers(*)');
    if (ordersError) { handleError(ordersError, 'getOrders'); return []; }
    if (!ordersData) return [];
    const orderIds = ordersData.map(o => o.id);
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (itemsError) handleError(itemsError, 'getOrders (items)');
    const itemsByOrderId = itemsData?.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
    }, {} as Record<string, OrderItem[]>) || {};
    return ordersData.map(order => ({ ...order, items: itemsByOrderId[order.id] || [] })) as Order[];
  },

  getOrder: async (id: string): Promise<Order | null> => {
    const { data, error } = await supabase.from('orders').select('*, customers(*)').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { handleError(error, `getOrder(${id})`); }
    if (!data) return null;
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);
    if (itemsError) handleError(itemsError, `getOrder(${id}) (items)`);
    return { ...data, items: itemsData || [] } as Order;
  },

  addOrder: async (orderData: Partial<Order>) => {
    const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const { items, ...orderToInsert } = orderData;
    const { data: newOrder, error } = await supabase.from('orders').insert({ ...orderToInsert, number: orderNumber }).select().single();
    if (error) { handleError(error, 'addOrder'); throw error; }
    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({ ...item, order_id: newOrder.id }));
      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) { handleError(itemsError, 'addOrder (items)'); throw itemsError; }
    }
    return newOrder;
  },

  getProductionOrders: (): Promise<ProductionOrder[]> => getCollection('production_orders', '*, products(*)'),
  
  getTasks: (): Promise<Task[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'tasks'. O Kanban de Produção usará um estado vazio.");
    return Promise.resolve([]);
  },
  
  getTaskStatuses: (): Promise<TaskStatus[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'task_statuses'. O Kanban de Produção usará um estado vazio.");
    return Promise.resolve([]);
  },
  
  getInventoryBalances: (): Promise<InventoryBalance[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'inventory_balances'. O módulo de Estoque usará um estado vazio.");
    return Promise.resolve([]);
  },
  
  getInventoryMovements: (materialId: string): Promise<InventoryMovement[]> => getCollection<InventoryMovement>('inventory_movements'),
  
  getProducts: (): Promise<Product[]> => getCollection('products'),
  
  getProductCategories: (): Promise<ProductCategory[]> => {
    console.warn("[DATA] Tabela/coluna ausente: 'product_categories'. O formulário de Produtos usará um estado vazio.");
    return Promise.resolve([]);
  },
  
  getContacts: (): Promise<Contact[]> => getCollection<Contact>('customers'),

  updateDocument: async <T>(table: string, id: string, docData: Partial<T>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(docData).eq('id', id).select().single();
    if (error) { handleError(error, `updateDocument(${table}, ${id})`); throw error; }
    return data as T;
  },

  addDocument: async <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>): Promise<T> => {
    const { data, error } = await supabase.from(table).insert(docData).select().single();
    if (error) { handleError(error, `addDocument(${table})`); throw error; }
    return data as T;
  },
};