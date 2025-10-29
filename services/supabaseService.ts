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
    LogisticsWave,
    LogisticsShipment,
    MarketingCampaign,
    MarketingSegment,
    MarketingTemplate,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
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

// This internal helper can return an Error object for specific handling
const getCollectionInternal = async <T>(table: string, join?: string): Promise<T[] | Error> => {
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
        return subSubTab || subTab || category;
    }
    return tableName;
};

// --- App-specific Methods ---
export const supabaseService = {
  // Public-facing getCollection is resilient and returns empty array on failure
  getCollection: async <T>(table: string, join?: string): Promise<T[]> => {
    const result = await getCollectionInternal<T>(table, join);
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
    const tableFetchConfig: Record<string, { key: string; category: string | null; subCategory?: string }> = {
        'config_color_palettes': { key: 'paletas_cores', category: 'catalogs' },
        'fabric_colors': { key: 'tecido', category: 'catalogs', subCategory: 'cores_texturas' },
        'zipper_colors': { key: 'ziper', category: 'catalogs', subCategory: 'cores_texturas' },
        'lining_colors': { key: 'forro', category: 'catalogs', subCategory: 'cores_texturas' },
        'puller_colors': { key: 'puxador', category: 'catalogs', subCategory: 'cores_texturas' },
        'bias_colors': { key: 'vies', category: 'catalogs', subCategory: 'cores_texturas' },
        'embroidery_colors': { key: 'bordado', category: 'catalogs', subCategory: 'cores_texturas' },
        'config_fabric_textures': { key: 'texturas', category: 'catalogs', subCategory: 'cores_texturas' },
        'config_fonts': { key: 'fontes_monogramas', category: 'catalogs' },
        'config_supply_groups': { key: 'grupos_suprimento', category: 'materials' },
        'config_basic_materials': { key: 'materiais_basicos', category: 'materials' },
        'logistics_delivery_methods': { key: 'metodos_entrega', category: 'logistica' },
        'logistics_freight_params': { key: 'calculo_frete', category: 'logistica' },
        'config_packaging_types': { key: 'tipos_embalagem', category: 'logistica' },
        'config_bond_types': { key: 'tipos_vinculo', category: 'logistica' },
        'system_settings': { key: 'sistema', category: null },
    };

    const emptyAppData: AppData = {
        catalogs: { paletas_cores: [], cores_texturas: { tecido: [], ziper: [], forro: [], puxador: [], vies: [], bordado: [], texturas: [] }, fontes_monogramas: [] },
        materials: { grupos_suprimento: [], materiais_basicos: [] },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: [],
        midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: [],
        marketing_campaigns: [], marketing_segments: [], marketing_templates: [],
        suppliers: [], purchase_orders: [], purchase_order_items: [],
    };
    
    try {
        const fetchPromises = Object.keys(tableFetchConfig).map(table => getCollectionInternal(table));
        const results = await Promise.all(fetchPromises);
        
        const data = results.reduce((acc, result, index) => {
            const table = Object.keys(tableFetchConfig)[index];
            const config = tableFetchConfig[table];
            
            if (result instanceof Error) {
                console.warn(`[getSettings] Failed to fetch table '${table}'. Skipping. Reason: ${result.message}`);
            } else if (config.category) {
                if (config.subCategory) {
                    (acc as any)[config.category][config.subCategory][config.key] = result;
                } else {
                    (acc as any)[config.category][config.key] = result;
                }
            } else {
                (acc as any)[config.key] = result;
            }
            return acc;
        }, JSON.parse(JSON.stringify(emptyAppData))); // Deep copy

        return data;
    } catch (error) {
        handleError(error, 'getSettings');
        return emptyAppData;
    }
  },

  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) => addDocument(getTableNameForSetting(category, subTab, subSubTab), data),
  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) => updateDocument(getTableNameForSetting(category, subTab, subSubTab), id, data),
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) => deleteDocument(getTableNameForSetting(category, subTab, subSubTab), id),
  updateSystemSettings: async (settings: SystemSetting[]) => {
      const updates = settings.map(s => updateDocument<SystemSetting>('system_settings', s.id, { value: s.value }));
      return Promise.all(updates);
  },

  getOrders: async (): Promise<Order[]> => {
    const ordersData = await supabaseService.getCollection<Order>('orders', '*, customers(*)');
    if (!ordersData || ordersData.length === 0) return [];

    const orderIds = ordersData.map(o => o.id);
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (itemsError) handleError(itemsError, 'getOrders (items)');

    const itemsByOrderId = itemsData?.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
    }, {} as Record<string, OrderItem[]>) || {};

    return ordersData.map(order => ({ ...order, items: itemsByOrderId[order.id] || [] }));
  },
  getOrder: async (id: string): Promise<Order | null> => {
    const data = await getDocument<Order>('orders', id);
    if (!data) return null;
    
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);
    if (itemsError) handleError(itemsError, `getOrder(${id}) (items)`);

    return { ...data, items: itemsData || [] };
  },
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => updateDocument<Order>('orders', orderId, { status: newStatus, updated_at: new Date().toISOString() }),
  addOrder: async (orderData: Partial<Order>) => {
      const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const { items, ...orderToInsert } = orderData;
      const newOrder = await addDocument<Order>('orders', {
          ...orderToInsert,
          number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      } as any);
      
      if (items && items.length > 0) {
        const itemsToInsert = items.map(item => ({ ...item, order_id: newOrder.id }));
        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsError) handleError(itemsError, 'addOrder (items)');
      }
      return newOrder;
  },
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => updateDocument('orders', orderId, { ...data, updated_at: new Date().toISOString() }),
  getProductionOrders: (): Promise<ProductionOrder[]> => supabaseService.getCollection('production_orders', '*, products(*)'),
  getTasks: (): Promise<Task[]> => supabaseService.getCollection('tasks'),
  getTaskStatuses: (): Promise<TaskStatus[]> => supabaseService.getCollection('task_statuses'),
  updateTask: (taskId: string, data: Partial<Task>): Promise<Task> => updateDocument('tasks', taskId, data),
  getInventoryBalances: (): Promise<InventoryBalance[]> => supabaseService.getCollection('inventory_balances', '*, material:config_basic_materials(*)'),
  getInventoryMovements: async (materialId: string): Promise<InventoryMovement[]> => {
    const { data, error } = await supabase.from('inventory_movements').select('*').eq('material_id', materialId).order('created_at', { ascending: false });
    if (error) { handleError(error, 'getInventoryMovements'); return []; }
    return data || [];
  },
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => addDocument('inventory_movements', { ...movementData, created_at: new Date().toISOString() }),
  getProducts: (): Promise<Product[]> => supabaseService.getCollection('products'),
  getProductCategories: (): Promise<ProductCategory[]> => supabaseService.getCollection('product_categories'),
  addProduct: (productData: AnyProduct) => addDocument('products', productData),
  updateProduct: (productId: string, productData: Product | AnyProduct) => {
      const { id, category, ...updateData } = productData as Product;
      return updateDocument<Product>('products', productId, updateData);
  },
  getContacts: (): Promise<Contact[]> => supabaseService.getCollection('customers'),
  getLogisticsData: async (): Promise<{ orders: Order[], waves: LogisticsWave[], shipments: LogisticsShipment[] }> => {
    const [orders, waves, shipments] = await Promise.all([
        supabaseService.getCollection<Order>('orders', '*, customers(*)'),
        supabaseService.getCollection<LogisticsWave>('logistics_waves'),
        supabaseService.getCollection<LogisticsShipment>('logistics_shipments'),
    ]);
    return { orders, waves, shipments };
  },
  getMarketingCampaigns: (): Promise<MarketingCampaign[]> => supabaseService.getCollection('marketing_campaigns'),
  getMarketingSegments: (): Promise<MarketingSegment[]> => supabaseService.getCollection('marketing_segments'),
  getMarketingTemplates: (): Promise<MarketingTemplate[]> => supabaseService.getCollection('marketing_templates'),
  getPurchasingData: async (): Promise<{ suppliers: Supplier[], purchase_orders: PurchaseOrder[], purchase_order_items: PurchaseOrderItem[] }> => {
    const [suppliers, purchase_orders, purchase_order_items] = await Promise.all([
        supabaseService.getCollection<Supplier>('suppliers'),
        supabaseService.getCollection<PurchaseOrder>('purchase_orders'),
        supabaseService.getCollection<PurchaseOrderItem>('purchase_order_items'),
    ]);
    return { suppliers, purchase_orders, purchase_order_items };
  },
};
