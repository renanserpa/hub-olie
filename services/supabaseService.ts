// NOTE: This file has been refactored for Supabase.
import { supabase } from '../lib/supabaseClient';
import {
    AnyProduct,
    AppData,
    BiasColor,
    ColorPalette,
    Collection,
    Contact,
    EmbroideryColor,
    FabricColor,
    FabricTexture,
    InventoryBalance,
    InventoryMovement,
    LiningColor,
    MonogramFont,
    Order, OrderItem, OrderStatus,
    Product,
    ProductCategory,
    ProductionOrder,
    ProductionOrderStatus,
    ProductionQualityCheck,
    ProductionAudit,
    ProductionTask,
    PullerColor,
    SettingsCategory,
    SystemSetting,
    Task,
    TaskStatus,
    ZipperColor,
    LogisticsWave,
    LogisticsShipment,
    MarketingCampaign,
    MarketingSegment,
    MarketingTemplate,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    AnalyticsKPI,
    FinanceAccount,
    FinanceCategory,
    FinanceTransaction,
    FinancePayable,
    FinanceReceivable,
    SystemSettingsLog,
    AnalyticsSnapshot,
    Integration,
    IntegrationLog,
    Material,
    MaterialGroup,
    InitializerAgent,
    InitializerLog,
    InitializerSyncState,
    WorkflowRule,
    Notification,
    SystemAudit,
    MoldLibrary,
    ProductionRoute,
    ProductVariant,
    IntegrationStatus,
    UserProfile,
} from "../types";


const handleError = (error: any, context: string) => {
    // Gracefully handle non-existent tables by logging a warning instead of throwing an error.
    if (error?.code === '42P01') {
        console.warn(`[dataService] Supabase query failed because table for "${context}" does not exist.`);
        return new Error(`Missing Table: ${context}`);
    }
    const errorMessage = error.message || 'An unknown error occurred';
    console.error(`Error in ${context}: ${errorMessage}`, {
        code: error.code,
        details: error.details,
        hint: error.hint,
    });
    throw new Error(`Supabase operation failed in ${context}: ${errorMessage}`);
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

const addManyDocuments = async <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>[]): Promise<T[]> => {
    const { data, error } = await supabase.from(table).insert(docData).select();
    if (error) handleError(error, `addManyDocuments(${table})`);
    return (data as T[]) || [];
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
    'catalogs-paletas_cores': 'config_color_palettes',
    'catalogs-cores_texturas-tecido': 'fabric_colors',
    'catalogs-cores_texturas-ziper': 'zipper_colors',
    'catalogs-cores_texturas-vies': 'bias_colors',
    'catalogs-cores_texturas-forro': 'lining_colors',
    'catalogs-cores_texturas-puxador': 'puller_colors',
    'catalogs-cores_texturas-bordado': 'embroidery_colors',
    'catalogs-cores_texturas-texturas': 'fabric_textures',
    'catalogs-fontes_monogramas': 'config_fonts',
    'materials-grupos_suprimento': 'config_supply_groups',
    'materials-materiais_basicos': 'config_materials',
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
        return [];
    }
    return result;
  },
  getDocument,
  addDocument,
  addManyDocuments,
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
  
  listenToDocument: <T extends { id: string }>(table: string, id: string, callback: (payload: T) => void) => {
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
    const emptyAppData: AppData = {
        catalogs: { paletas_cores: [], cores_texturas: { tecido: [], ziper: [], forro: [], puxador: [], vies: [], bordado: [], texturas: [] }, fontes_monogramas: [] },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: [],
        system_settings_logs: [],
        config_supply_groups: [],
        config_materials: [],
        warehouses: [],
        mold_library: [],
        production_routes: [],
        media_assets: [], orders: [],
        order_items: [],
        customers: [],
        profiles: [],
        products: [], 
        product_variants: [], 
        product_categories: [], collections: [], production_orders: [], production_tasks: [], production_quality_checks: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] },
        logistics_waves: [],
        logistics_shipments: [],
        inventory_balances: [], inventory_movements: [],
        marketing_campaigns: [], marketing_segments: [], marketing_templates: [],
        suppliers: [], purchase_orders: [], purchase_order_items: [],
        analytics_kpis: [],
        analytics_snapshots: [],
        executive_kpis: [],
        executive_ai_insights: [],
        finance_accounts: [],
        finance_categories: [],
        finance_transactions: [],
        finance_payables: [],
        finance_receivables: [],
        config_integrations: [],
        integration_logs: [],
        initializer_agents: [],
        initializer_logs: [],
        initializer_sync_state: [],
        workflow_rules: [],
        notifications: [],
        system_audit: [],
        production_audit: [],
    };

    try {
        const [
            tecido, ziper, vies, fontes_monogramas, system_settings_logs, config_supply_groups, config_materials,
            paletas_cores, forro, puxador, bordado, texturas,
            suppliers,
            initializer_agents, initializer_logs, initializer_sync_state,
            notifications, workflow_rules,
            system_audit,
            production_audit,
            collections,
        ] = await Promise.all([
            supabaseService.getCollection<FabricColor>('fabric_colors'), 
            supabaseService.getCollection<ZipperColor>('zipper_colors'), 
            supabaseService.getCollection<BiasColor>('bias_colors'), 
            supabaseService.getCollection<MonogramFont>('config_fonts'),
            supabaseService.getCollection<SystemSettingsLog>('system_settings_logs'),
            supabaseService.getMaterialGroups(),
            supabaseService.getMaterials(),
            supabaseService.getCollection<ColorPalette>('config_color_palettes'),
            supabaseService.getCollection<LiningColor>('lining_colors'),
            supabaseService.getCollection<PullerColor>('puller_colors'),
            supabaseService.getCollection<EmbroideryColor>('embroidery_colors'),
            supabaseService.getCollection<FabricTexture>('fabric_textures'),
            supabaseService.getCollection<Supplier>('suppliers'),
            supabaseService.getCollection<InitializerAgent>('initializer_agents'),
            supabaseService.getCollection<InitializerLog>('initializer_logs'),
            supabaseService.getCollection<InitializerSyncState>('initializer_sync_state'),
            supabaseService.getCollection<Notification>('notifications'),
            supabaseService.getCollection<WorkflowRule>('workflow_rules'),
            supabaseService.getCollection<SystemAudit>('system_audit'),
            supabaseService.getCollection<ProductionAudit>('production_audit'),
            supabaseService.getCollection<Collection>('collections'),
        ]);
        
        return {
            ...emptyAppData,
            suppliers,
            catalogs: { 
                ...emptyAppData.catalogs,
                paletas_cores,
                cores_texturas: { 
                    ...emptyAppData.catalogs.cores_texturas,
                    tecido, 
                    ziper, 
                    vies,
                    forro,
                    puxador,
                    bordado,
                    texturas,
                }, 
                fontes_monogramas 
            },
            system_settings_logs,
            config_supply_groups,
            config_materials,
            initializer_agents,
            initializer_logs,
            initializer_sync_state,
            notifications,
            workflow_rules,
            system_audit,
            production_audit,
            collections,
        };
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

  getUsers: (): Promise<UserProfile[]> => supabaseService.getCollection('profiles'),
  updateUser: (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => updateDocument('profiles', userId, data),
  addUser: (userData: any): Promise<UserProfile> => {
      const err = new Error('User creation from client is insecure and not implemented. This requires a Supabase Edge Function to call `supabase.auth.admin.createUser()` and then insert into profiles.');
      handleError(err, 'addUser');
      return Promise.reject(err);
  },
  
  getMaterials: (): Promise<Material[]> => supabaseService.getCollection('config_materials', '*, config_supply_groups(name)'),
  getMaterialGroups: (): Promise<MaterialGroup[]> => supabaseService.getCollection('config_supply_groups'),

  getOrders: async (): Promise<Order[]> => {
    const ordersData = await supabaseService.getCollection<Order>('orders', '*, customers(*)');
    if (!ordersData || ordersData.length === 0) return [];

    const orderIds = ordersData.map(o => o.id);
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (itemsError) { handleError(itemsError, 'getOrders (items)'); return ordersData; }

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
  updateProductionOrderStatus: (orderId: string, status: ProductionOrderStatus): Promise<ProductionOrder> => updateDocument<ProductionOrder>('production_orders', orderId, { status }),
  getTasks: (): Promise<Task[]> => supabaseService.getCollection('tasks'),
  getTaskStatuses: (): Promise<TaskStatus[]> => supabaseService.getCollection('task_statuses'),
  updateTask: (taskId: string, data: Partial<Task>): Promise<Task> => updateDocument('tasks', taskId, data),
  getInventoryBalances: (): Promise<InventoryBalance[]> => supabaseService.getCollection('inventory_balances', '*, material:config_materials(*), product_variant:product_variants(*), warehouse:warehouses(*)'),
  getInventoryMovements: async (itemId: string, itemType: 'material' | 'product'): Promise<InventoryMovement[]> => {
    const column = itemType === 'material' ? 'material_id' : 'product_variant_id';
    const { data, error } = await supabase.from('inventory_movements').select('*').eq(column, itemId).order('created_at', { ascending: false });
    if (error) { handleError(error, 'getInventoryMovements'); return []; }
    return data || [];
  },
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => addDocument('inventory_movements', { ...movementData, created_at: new Date().toISOString() }),
  transferStock: (transferData: any): Promise<void> => { console.warn("Supabase transferStock is not implemented and should be an RPC function."); return Promise.resolve(); },
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
        supabaseService.getCollection<PurchaseOrder>('purchase_orders', '*, supplier:suppliers(*)'),
        supabaseService.getCollection<PurchaseOrderItem>('purchase_order_items'),
    ]);
    return { suppliers, purchase_orders, purchase_order_items };
  },
  createPO: async (poData: { supplier_id: string, items: Omit<PurchaseOrderItem, 'id' | 'po_id' | 'material_name' | 'material'>[] }) => {
        const po_number = `PC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
        const total = poData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        
        const { data: newPO, error: poError } = await supabase.from('purchase_orders').insert({
            po_number,
            supplier_id: poData.supplier_id,
            status: 'draft',
            total
        }).select().single();

        if (poError) handleError(poError, 'createPO');
        if (!newPO) throw new Error('Failed to create PO');

        const itemsToInsert = poData.items.map(item => ({
            ...item,
            po_id: newPO.id,
            received_quantity: 0
        }));

        const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsToInsert);
        if (itemsError) handleError(itemsError, 'createPO (items)');

        return newPO as PurchaseOrder;
    },
    receivePOItems: async (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) => {
        console.warn('receivePOItems is not transactional in this Supabase implementation.');
        
        const { data: po, error: poError } = await supabase.from('purchase_orders').select('*, items:purchase_order_items(*)').eq('id', poId).single();
        if(poError || !po) { handleError(poError, 'receivePOItems'); return; }

        let allReceived = true;
        for (const received of receivedItems) {
            const item = po.items.find((i: any) => i.id === received.itemId);
            if (item) {
                const newQty = item.received_quantity + received.receivedQty;
                await updateDocument<PurchaseOrderItem>('purchase_order_items', item.id, { received_quantity: newQty });

                if (newQty < item.quantity) {
                    allReceived = false;
                }
            }
        }
        
        const newStatus = allReceived ? 'received' : 'partial';
        await updateDocument<PurchaseOrder>('purchase_orders', poId, { status: newStatus });
    },
  getAnalyticsKpis: (): Promise<AnalyticsKPI[]> => supabaseService.getCollection('analytics_kpis'),
  getFinanceData: async () => {
    const [accounts, categories, transactions, payables, receivables] = await Promise.all([
        supabaseService.getCollection<FinanceAccount>('finance_accounts'),
        supabaseService.getCollection<FinanceCategory>('finance_categories'),
        supabaseService.getCollection<FinanceTransaction>('finance_transactions', '*, account:finance_accounts(*), category:finance_categories(*)'),
        supabaseService.getCollection<FinancePayable>('finance_payables'),
        supabaseService.getCollection<FinanceReceivable>('finance_receivables'),
    ]);
    return { accounts, categories, transactions, payables, receivables };
  },
  getNotifications: (): Promise<Notification[]> => supabaseService.getCollection('notifications'),
  markNotificationAsRead: (id: string): Promise<Notification> => updateDocument<Notification>('notifications', id, { is_read: true }),
    addMaterial: (data: any): Promise<Material> => addDocument('config_materials', data),
    addMaterialGroup: (data: any): Promise<MaterialGroup> => addDocument('config_supply_groups', data),
    getProductionRoutes: (): Promise<ProductionRoute[]> => supabaseService.getCollection('production_routes'),
    getMoldLibrary: (): Promise<MoldLibrary[]> => supabaseService.getCollection('mold_library'),
    updateSystemSetting: async (key: string, newValue: any, source: 'user' | 'AI', confidence: number, explanation: string) => {
        const { data: setting, error: findError } = await supabase.from('system_settings').select('id, value').eq('key', key).single();
        if (findError || !setting) {
          handleError(findError, `updateSystemSetting (find ${key})`);
          return;
        }
        
        await updateDocument<SystemSetting>('system_settings', setting.id, { value: JSON.stringify(newValue) });
        
        await addDocument<SystemSettingsLog>('system_settings_logs', {
          key,
          old_value: setting.value,
          new_value: JSON.stringify(newValue),
          source_module: source,
          confidence,
          explanation,
        } as any);
      },
    testIntegrationConnection: async (id: string): Promise<void> => {
        const status: IntegrationStatus = Math.random() > 0.2 ? 'connected' : 'error';
        const last_error = status === 'error' ? 'Simulated connection failure.' : undefined;
        await updateDocument<Integration>('config_integrations', id, { status, last_sync: new Date().toISOString(), last_error } as Partial<Integration>);
      },
    testConnection: async (): Promise<{ success: boolean; message: string }> => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) {
                throw new Error("Sessão de usuário não encontrada. Faça o login novamente.");
            }

            const { error: rlsError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

            if (rlsError) {
                throw new Error(`Falha na verificação de RLS (Row Level Security): ${rlsError.message}. Verifique as políticas de acesso da tabela 'profiles'.`);
            }

            return { success: true, message: "Conexão, autenticação e políticas RLS validadas com sucesso." };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    },
};
