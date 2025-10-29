import { supabase } from '../lib/supabaseClient';
import {
    AnyProduct,
    AppData,
    BasicMaterial,
    BiasColor,
    Contact,
    FabricColor,
    InventoryBalance,
    InventoryMovement,
    MonogramFont,
    Order, OrderItem, OrderStatus,
    Product,
    ProductCategory,
    ProductionOrder,
    SettingsCategory,
    SystemSetting,
    Task,
    TaskStatus,
    ZipperColor,
} from "../types";

// NOTE: This service is only active when RUNTIME is 'SUPABASE'.
// Reativar quando voltarmos ao SUPABASE.

const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    throw new Error(`Supabase operation failed in ${context}.`);
};

const settingsTableMap: Record<string, string> = {
    'catalogs-cores_texturas-tecido': 'fabric_colors',
    'catalogs-cores_texturas-ziper': 'zipper_colors',
    'catalogs-cores_texturas-vies': 'bias_colors',
    'catalogs-fontes_monogramas': 'config_fonts',
    'materials-materiais_basicos': 'config_basic_materials',
};

const getTableNameForSetting = (category: SettingsCategory, subTab: string | null, subSubTab: string | null): string => {
    let key = category;
    if (subTab) key += `-${subTab}`;
    if (subSubTab) key += `-${subSubTab}`;
    const tableName = settingsTableMap[key];
    if (!tableName) {
      throw new Error(`No table mapping found for key: ${key}`);
    }
    return tableName;
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

const updateDocument = async <T extends { id: string }>(table: string, id: string, docData: Partial<T>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(docData).eq('id', id).select().single();
    if (error) handleError(error, `updateDocument(${table}, ${id})`);
    return data as T;
};

const deleteDocument = async (table: string, id: string): Promise<void> => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) handleError(error, `deleteDocument(${table}, ${id})`);
};

export const supabaseService = {
  getCollection,
  getDocument,
  updateDocument,
  addDocument,
  deleteDocument,

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
    try {
        const [
            tecido, ziper, vies, fontes_monogramas, materiais_basicos,
        ] = await Promise.all([
            getCollection<FabricColor>('fabric_colors'), 
            getCollection<ZipperColor>('zipper_colors'), 
            getCollection<BiasColor>('bias_colors'), 
            getCollection<MonogramFont>('config_fonts'),
            getCollection<BasicMaterial>('config_basic_materials'),
        ]);
        
        return {
            catalogs: { paletas_cores: [], cores_texturas: { tecido, ziper, forro: [], puxador: [], vies, bordado: [], texturas: [] }, fontes_monogramas },
            materials: { grupos_suprimento: [], materiais_basicos },
            logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
            sistema: [],
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
  
  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) => addDocument(getTableNameForSetting(category, subTab, subSubTab), data),
  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) => updateDocument(getTableNameForSetting(category, subTab, subSubTab), id, data),
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) => deleteDocument(getTableNameForSetting(category, subTab, subSubTab), id),
  // FIX: Added explicit generic type <SystemSetting> to updateDocument call to ensure type safety.
  updateSystemSettings: async (settings: SystemSetting[]) => Promise.all(settings.map(s => updateDocument<SystemSetting>('system_settings', s.id, { value: s.value }))),


  getOrders: async (): Promise<Order[]> => {
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*, customers(*)');
    if (ordersError) handleError(ordersError, 'getOrders');
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
    if (error && error.code !== 'PGRST116') {
      handleError(error, `getOrder(${id})`);
    }
    if (!data) return null;
    
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);
    if (itemsError) handleError(itemsError, `getOrder(${id}) (items)`);

    return { ...data, items: itemsData || [] } as Order;
  },
  
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => updateDocument<Order>('orders', orderId, { status: newStatus, updated_at: new Date().toISOString() }),
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => updateDocument('orders', orderId, { ...data, updated_at: new Date().toISOString() }),

  addOrder: async (orderData: Partial<Order>) => {
      const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const { items, ...orderToInsert } = orderData;
      const fullOrderData = {
          ...orderToInsert,
          number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      };
      const { data: newOrder, error } = await supabase.from('orders').insert(fullOrderData).select().single();
      if (error) handleError(error, 'addOrder');
      if (!newOrder) throw new Error("Failed to create order.");
      
      if (items && items.length > 0) {
        const itemsToInsert = items.map(item => ({ ...item, order_id: newOrder.id }));
        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsError) handleError(itemsError, 'addOrder (items)');
      }
      return newOrder;
  },

  getProductionOrders: (): Promise<ProductionOrder[]> => getCollection('production_orders', '*, products(*)'),
  getTasks: (): Promise<Task[]> => getCollection('tasks'),
  getTaskStatuses: (): Promise<TaskStatus[]> => getCollection('task_statuses'),
  updateTask: (taskId: string, data: Partial<Task>): Promise<Task> => updateDocument('tasks', taskId, data),

  getInventoryBalances: (): Promise<InventoryBalance[]> => getCollection('inventory_balances', '*, material:config_basic_materials(*)'),
  getInventoryMovements: async (materialId: string): Promise<InventoryMovement[]> => {
    const { data, error } = await supabase.from('inventory_movements').select('*').eq('material_id', materialId).order('created_at', { ascending: false });
    if (error) handleError(error, 'getInventoryMovements');
    return data || [];
  },
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => addDocument('inventory_movements', { ...movementData, created_at: new Date().toISOString() }),
  
  getProducts: (): Promise<Product[]> => getCollection('products'),
  getProductCategories: (): Promise<ProductCategory[]> => getCollection('product_categories'),
  addProduct: (productData: AnyProduct) => addDocument('products', productData),
  // FIX: Added explicit generic type <Product> to updateDocument call to ensure type safety.
  updateProduct: (productId: string, productData: Product | AnyProduct) => updateDocument<Product>('products', productId, productData),

  getContacts: (): Promise<Contact[]> => getCollection('customers'),
};