
// NOTE: This file has been refactored for Supabase.
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
    Order, OrderItem, OrderStatus, OrderPayment, OrderTimelineEvent, OrderNote,
    Product,
    ProductCategory,
    ProductionOrder,
    SettingsCategory,
    SystemSetting,
    Task,
    TaskStatus,
    ZipperColor,
    ColorPalette,
    LiningColor,
    PullerColor,
    EmbroideryColor,
    FabricTexture,
    SupplyGroup,
    DeliveryMethod,
    FreightParams,
    PackagingType,
    BondType,
} from "../types";


const handleError = (error: any, context: string) => {
    // Gracefully handle non-existent tables by logging a warning instead of throwing an error.
    if (error?.code === '42P01') {
        // This is a special case handled by getSettings to log missing tables.
        // Returning a specific error allows the caller to identify this case.
        return new Error(`Missing Table: ${context}`);
    }
    console.error(`Error in ${context}:`, error);
    throw new Error(`Supabase operation failed in ${context}.`);
};

// --- Generic Helpers ---

const getCollection = async <T>(table: string, join?: string): Promise<T[] | Error> => {
    const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
    const { data, error } = await query;
    if (error) {
        return handleError(error, `getCollection(${table})`) as Error;
    }
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

const settingsTableMap: Record<string, string> = {
    // Catalogs
    'catalogs-paletas_cores': 'config_color_palettes',
    'catalogs-cores_texturas-tecido': 'fabric_colors',
    'catalogs-cores_texturas-ziper': 'zipper_colors',
    'catalogs-cores_texturas-forro': 'lining_colors',
    'catalogs-cores_texturas-puxador': 'puller_colors',
    'catalogs-cores_texturas-vies': 'bias_colors',
    'catalogs-cores_texturas-bordado': 'embroidery_colors',
    'catalogs-cores_texturas-texturas': 'config_fabric_textures',
    'catalogs-fontes_monogramas': 'config_fonts',
    // Materials
    'materials-grupos_suprimento': 'config_supply_groups',
    'materials-materiais_basicos': 'config_basic_materials',
};

const getTableNameForSetting = (category: SettingsCategory, subTab: string | null, subSubTab: string | null): string => {
    let key = category;
    if (subTab) key += `-${subTab}`;
    if (subSubTab) key += `-${subSubTab}`;
    
    const tableName = settingsTableMap[key];
    if (!tableName) {
        console.error(`No table mapping found for key: ${key}`);
        // Fallback or throw error
        return subSubTab || subTab || category;
    }
    return tableName;
};

// --- App-specific Methods ---
export const supabaseService = {
  getCollection: async <T>(table: string, join?: string): Promise<T[]> => {
    const result = await getCollection<T>(table, join);
    if (result instanceof Error) {
        console.warn(`[dataService] Could not fetch ${table}, returning empty array. Reason: ${result.message}`);
        return [];
    }
    return result;
  },
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  
  listenToCollection: <T>(table: string, join: string | undefined, callback: (payload: T[]) => void) => {
      const channel = supabase.channel(`public:${table}`);
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: table },
          async () => {
            console.log(`Change detected in ${table}, refetching...`);
            const data = await supabaseService.getCollection<T>(table, join);
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
    const tableFetchConfig = {
        'config_color_palettes': { key: 'paletas_cores', category: 'catalogs' },
        'fabric_colors': { key: 'tecido', category: 'cores_texturas' },
        'zipper_colors': { key: 'ziper', category: 'cores_texturas' },
        'lining_colors': { key: 'forro', category: 'cores_texturas' },
        'puller_colors': { key: 'puxador', category: 'cores_texturas' },
        'bias_colors': { key: 'vies', category: 'cores_texturas' },
        'embroidery_colors': { key: 'bordado', category: 'cores_texturas' },
        'config_fabric_textures': { key: 'texturas', category: 'cores_texturas' },
        'config_fonts': { key: 'fontes_monogramas', category: 'catalogs' },
        'config_supply_groups': { key: 'grupos_suprimento', category: 'materials' },
        'config_basic_materials': { key: 'materiais_basicos', category: 'materials' },
        'system_settings': { key: 'sistema', category: 'sistema' },
        'logistics_delivery_methods': { key: 'metodos_entrega', category: 'logistica'},
        'logistics_freight_params': { key: 'calculo_frete', category: 'logistica'},
        'config_packaging_types': { key: 'tipos_embalagem', category: 'logistica'},
        'config_bond_types': { key: 'tipos_vinculo', category: 'logistica'},
    };

    const results = await Promise.all(
      Object.keys(tableFetchConfig).map(tableName => getCollection(tableName))
    );
    
    const loadedTables: string[] = [];
    const missingTables: string[] = [];

    const appData: AppData = {
        catalogs: { paletas_cores: [], cores_texturas: { tecido: [], ziper: [], forro: [], puxador: [], vies: [], bordado: [], texturas: [] }, fontes_monogramas: [] },
        materials: { grupos_suprimento: [], materiais_basicos: [] },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: [],
        midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
    };

    results.forEach((result, index) => {
        const tableName = Object.keys(tableFetchConfig)[index];
        const config = tableFetchConfig[tableName as keyof typeof tableFetchConfig];

        if (result instanceof Error) {
            missingTables.push(tableName);
        } else {
            loadedTables.push(tableName);
            if (config.category === 'catalogs') {
                (appData.catalogs as any)[config.key] = result;
            } else if (config.category === 'cores_texturas') {
                (appData.catalogs.cores_texturas as any)[config.key] = result;
            } else if (config.category === 'materials') {
                (appData.materials as any)[config.key] = result;
            } else if (config.category === 'logistica') {
                (appData.logistica as any)[config.key] = result;
            } else if (config.category === 'sistema') {
                appData.sistema = result as SystemSetting[];
            }
        }
    });
    
    console.log(`[SETTINGS] Loaded tables: ${loadedTables.join(', ')}`);
    if(missingTables.length > 0) {
        console.warn(`[SETTINGS] Missing tables: ${missingTables.join(', ')}`);
    }

    return appData;
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
      const updates = settings.map(s => updateDocument<SystemSetting>('system_settings', s.id, { value: s.value }));
      return Promise.all(updates);
  },

  getOrders: async (): Promise<Order[]> => {
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*, customers(*)');
    if (ordersError) { handleError(ordersError, 'getOrders'); return []; }
    if (!ordersData) return [];

    const orderIds = ordersData.map(o => o.id);
    const relatedTables = {
      order_items: supabase.from('order_items').select('*').in('order_id', orderIds),
      order_payments: supabase.from('order_payments').select('*').in('order_id', orderIds),
      order_timeline: supabase.from('order_timeline').select('*').in('order_id', orderIds),
      order_notes: supabase.from('order_notes').select('*').in('order_id', orderIds),
    };
    
    const [
        itemsResult,
        paymentsResult,
        timelineResult,
        notesResult,
    ] = await Promise.all(Object.values(relatedTables));
    
    const loadedTables = ['orders'];
    const missingTables = [];

    if (itemsResult.error) missingTables.push('order_items'); else loadedTables.push('order_items');
    if (paymentsResult.error) missingTables.push('order_payments'); else loadedTables.push('order_payments');
    if (timelineResult.error) missingTables.push('order_timeline'); else loadedTables.push('order_timeline');
    if (notesResult.error) missingTables.push('order_notes'); else loadedTables.push('order_notes');
    
    console.log(`[ORDERS] Loaded: ${loadedTables.join(', ')}`);
    if(missingTables.length > 0) {
        console.warn(`[ORDERS] Missing: ${missingTables.join(', ')}`);
    }

    const groupById = <T extends { order_id: string }>(data: T[] | null) => 
        (data || []).reduce((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push(item);
            return acc;
        }, {} as Record<string, T[]>);

    const itemsByOrderId = groupById(itemsResult.data as OrderItem[]);
    const paymentsByOrderId = groupById(paymentsResult.data as OrderPayment[]);
    const timelineByOrderId = groupById(timelineResult.data as OrderTimelineEvent[]);
    const notesByOrderId = groupById(notesResult.data as OrderNote[]);

    return ordersData.map(order => ({
        ...order,
        items: itemsByOrderId[order.id] || [],
        payments_history: paymentsByOrderId[order.id] || [],
        timeline: timelineByOrderId[order.id] || [],
        notes_internal: notesByOrderId[order.id] || [],
    })) as Order[];
  },
  
  getOrder: async (id: string): Promise<Order | null> => {
    // This could be optimized to fetch related data as well, like in getOrders
    const { data, error } = await supabase.from('orders').select('*, customers(*)').eq('id', id).single();
    if (error && error.code !== 'PGRST116') {
      handleError(error, `getOrder(${id})`);
    }
    if (!data) return null;
    
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);
    if (itemsError) handleError(itemsError, `getOrder(${id}) (items)`);

    // In a full v3 implementation, we would fetch payments, timeline, etc. here too.
    return { 
        ...data, 
        items: itemsData || [],
        payments_history: [],
        timeline: [],
        notes_internal: [],
    } as Order;
  },
  
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
      return updateDocument<Order>('orders', orderId, { status: newStatus, updated_at: new Date().toISOString() });
  },
  addOrder: async (orderData: Partial<Order>) => {
      const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const { items, payments_history, timeline, notes_internal, ...orderToInsert } = orderData;
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
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => {
        return updateDocument('orders', orderId, { ...data, updated_at: new Date().toISOString() });
  },

  getProductionOrders: (): Promise<ProductionOrder[]> => supabaseService.getCollection('production_orders', '*, products(*)'),
  getTasks: (): Promise<Task[]> => supabaseService.getCollection('tasks'),
  getTaskStatuses: (): Promise<TaskStatus[]> => supabaseService.getCollection('task_statuses'),
  updateTask: (taskId: string, data: Partial<Task>): Promise<Task> => updateDocument('tasks', taskId, data),

  getInventoryBalances: (): Promise<InventoryBalance[]> => supabaseService.getCollection('inventory_balances'),
  getAllBasicMaterials: (): Promise<BasicMaterial[]> => supabaseService.getCollection('config_basic_materials'),
  getInventoryMovements: async (materialId: string): Promise<InventoryMovement[]> => {
    const { data, error } = await supabase.from('inventory_movements').select('*').eq('material_id', materialId).order('created_at', { ascending: false });
    if (error) handleError(error, 'getInventoryMovements');
    return data || [];
  },
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => {
      return addDocument('inventory_movements', { ...movementData, created_at: new Date().toISOString() });
  },
  
  getProducts: (): Promise<Product[]> => supabaseService.getCollection('products'),
  getProductCategories: (): Promise<ProductCategory[]> => supabaseService.getCollection('product_categories'),
  addProduct: (productData: AnyProduct) => addDocument('products', productData),
  updateProduct: (productId: string, productData: Product | AnyProduct) => {
      const { id, category, ...updateData } = productData as Product;
      return updateDocument<Product>('products', productId, updateData);
  },
   getContacts: (): Promise<Contact[]> => supabaseService.getCollection('customers'),
};