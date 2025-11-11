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
    AIInsight,
    // FIX: Import missing types.
    Warehouse,
    MediaAsset,
    ExecutiveKPI,
    // FIX: Import missing PurchaseOrderStatus type.
    PurchaseOrderStatus,
    SystemSettingsHistory,
    ActivityItem,
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

// FIX: Implement the missing getDocument function.
const getDocument = async <T>(table: string, id: string): Promise<T | null> => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) {
        // PGRST116 means no rows found, which is not an error for a single get.
        if (error.code === 'PGRST116') {
            return null;
        }
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
  getCollection: async <T>(table: string, join?: string): Promise<T[]> => {
    try {
        const query = join ? supabase.from(table).select(join) : supabase.from(table).select('*');
        const { data, error } = await query;

        if (error) {
            throw error;
        }
        return (data as T[]) || [];
    } catch (error: any) {
        if (error?.message?.includes('Failed to fetch')) {
            console.error(
                `[dataService] Network error fetching "${table}". This is likely a CORS issue or a paused Supabase project.`,
                error
            );
            return [];
        }
        
        if (error?.code === '42P01' || (error?.message && (error.message.includes('does not exist') || error.message.includes('in the schema cache')))) {
            console.warn(`[dataService] Table "${table}" does not exist. Returning an empty array.`);
            return [];
        }

        console.error(`[dataService] Unhandled Supabase error in getCollection("${table}"):`, error);
        throw new Error(`Failed to fetch data from "${table}": ${error.message}`);
    }
  },
  getDocument,
  addDocument,
  addManyDocuments,
  updateDocument,
  deleteDocument,
  
  listenToCollection: <T>(table: string, join: string | undefined, callback: (payload: T[]) => void) => {
      const initialFetch = async () => {
          const data = await supabaseService.getCollection<T>(table, join);
          callback(data);
      };
      initialFetch();

      const channel = supabase.channel(`public:${table}`);
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: table },
          async (payload: any) => {
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
        const [
            sistema, system_settings_logs, config_supply_groups, config_materials, warehouses, mold_library, production_routes, media_assets, orders, order_items, customers, profiles, products, product_variants, product_categories, collections, production_orders, production_tasks, production_quality_checks, task_statuses, tasks, 
            omni_conversations, omni_messages, omni_quotes,
            logistics_waves, logistics_shipments, inventory_balances, inventory_movements, marketing_campaigns, marketing_segments, marketing_templates, suppliers, purchase_orders, purchase_order_items,
            analytics_kpis, analytics_snapshots, executive_kpis, executive_ai_insights, analytics_login_events,
            finance_accounts, finance_categories, finance_transactions, finance_payables, finance_receivables,
            config_integrations, integration_logs, initializer_agents, initializer_logs, initializer_sync_state, workflow_rules, notifications, system_audit, production_audit,
            paletas_cores, tecido, ziper, vies, forro, puxador, bordado, texturas, fontes_monogramas,
        ] = await Promise.all([
            supabaseService.getCollection<SystemSetting>('system_settings'),
            supabaseService.getCollection<SystemSettingsLog>('system_settings_logs'),
            supabaseService.getCollection<MaterialGroup>('config_supply_groups'),
            supabaseService.getCollection<Material>('config_materials'),
            supabaseService.getCollection<Warehouse>('warehouses'),
            supabaseService.getCollection<MoldLibrary>('mold_library'),
            supabaseService.getCollection<ProductionRoute>('production_routes'),
            supabaseService.getCollection<MediaAsset>('media_assets'),
            supabaseService.getCollection<Order>('orders'),
            supabaseService.getCollection<OrderItem>('order_items'),
            supabaseService.getCollection<Contact>('customers'),
            supabaseService.getCollection<UserProfile>('profiles'),
            supabaseService.getCollection<Product>('products'),
            supabaseService.getCollection<ProductVariant>('product_variants'),
            supabaseService.getCollection<ProductCategory>('product_categories'),
            supabaseService.getCollection<Collection>('collections'),
            supabaseService.getCollection<ProductionOrder>('production_orders'),
            supabaseService.getCollection<ProductionTask>('production_tasks'),
            supabaseService.getCollection<ProductionQualityCheck>('production_quality_checks'),
            supabaseService.getCollection<TaskStatus>('task_statuses'),
            supabaseService.getCollection<Task>('tasks'),
            supabaseService.getCollection<any>('conversations'),
            supabaseService.getCollection<any>('messages'),
            supabaseService.getCollection<any>('quotes'),
            supabaseService.getCollection<LogisticsWave>('logistics_waves'),
            supabaseService.getCollection<LogisticsShipment>('logistics_shipments'),
            supabaseService.getCollection<InventoryBalance>('inventory_balances'),
            supabaseService.getCollection<InventoryMovement>('inventory_movements'),
            supabaseService.getCollection<MarketingCampaign>('marketing_campaigns'),
            supabaseService.getCollection<MarketingSegment>('marketing_segments'),
            supabaseService.getCollection<MarketingTemplate>('marketing_templates'),
            supabaseService.getCollection<Supplier>('suppliers'),
            supabaseService.getCollection<PurchaseOrder>('purchase_orders'),
            supabaseService.getCollection<PurchaseOrderItem>('purchase_order_items'),
            supabaseService.getCollection<AnalyticsKPI>('analytics_kpis'),
            supabaseService.getCollection<AnalyticsSnapshot>('analytics_snapshots'),
            supabaseService.getCollection<ExecutiveKPI>('executive_kpis'),
            supabaseService.getCollection<AIInsight>('executive_ai_insights'),
            supabaseService.getCollection<any>('analytics_login_events'),
            supabaseService.getCollection<FinanceAccount>('finance_accounts'),
            supabaseService.getCollection<FinanceCategory>('finance_categories'),
            supabaseService.getCollection<FinanceTransaction>('finance_transactions'),
            supabaseService.getCollection<FinancePayable>('finance_payables'),
            supabaseService.getCollection<FinanceReceivable>('finance_receivables'),
            supabaseService.getCollection<Integration>('config_integrations'),
            supabaseService.getCollection<IntegrationLog>('integration_logs'),
            supabaseService.getCollection<InitializerAgent>('initializer_agents'),
            supabaseService.getCollection<InitializerLog>('initializer_logs'),
            supabaseService.getCollection<InitializerSyncState>('initializer_sync_state'),
            supabaseService.getCollection<WorkflowRule>('workflow_rules'),
            supabaseService.getCollection<Notification>('notifications'),
            supabaseService.getCollection<SystemAudit>('system_audit'),
            supabaseService.getCollection<ProductionAudit>('production_audit'),
            supabaseService.getCollection<ColorPalette>('config_color_palettes'),
            supabaseService.getCollection<FabricColor>('fabric_colors'),
            supabaseService.getCollection<ZipperColor>('zipper_colors'),
            supabaseService.getCollection<BiasColor>('bias_colors'),
            supabaseService.getCollection<LiningColor>('lining_colors'),
            supabaseService.getCollection<PullerColor>('puller_colors'),
            supabaseService.getCollection<EmbroideryColor>('embroidery_colors'),
            supabaseService.getCollection<FabricTexture>('fabric_textures'),
            supabaseService.getCollection<MonogramFont>('config_fonts'),
        ]);
        
        return {
            catalogs: { paletas_cores, cores_texturas: { tecido, ziper, vies, forro, puxador, bordado, texturas }, fontes_monogramas },
            logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
            sistema, system_settings_logs, config_supply_groups, config_materials, warehouses, mold_library, production_routes, media_assets, orders, order_items, customers, profiles, products, product_variants, product_categories, collections, production_orders, production_tasks, production_quality_checks, task_statuses, tasks,
            omnichannel: { conversations: omni_conversations, messages: omni_messages, quotes: omni_quotes },
            logistics_waves, logistics_shipments, inventory_balances, inventory_movements, marketing_campaigns, marketing_segments, marketing_templates, suppliers, purchase_orders, purchase_order_items,
            analytics_kpis, analytics_snapshots, executive_kpis, executive_ai_insights, analytics_login_events,
            finance_accounts, finance_categories, finance_transactions, finance_payables, finance_receivables,
            config_integrations, integration_logs, initializer_agents, initializer_logs, initializer_sync_state, workflow_rules, notifications, system_audit, production_audit,
        };
  },
  
  getRoles: (): Promise<any[]> => supabaseService.getCollection('system_roles'),
  getPermissions: async (): Promise<any[]> => supabaseService.getCollection('system_permissions'),
  updatePermissions: async (permissions: any[]) => {
    const { error } = await supabase.from('system_permissions').upsert(permissions, { onConflict: 'role,scope' });
    if (error) handleError(error, 'updatePermissions');
  },
  getWebhookLogs: (): Promise<any[]> => supabaseService.getCollection('webhook_logs'),
  updateWorkflowRule: (ruleId: string, isActive: boolean) => updateDocument<WorkflowRule>('workflow_rules', ruleId, { is_active: isActive }),
  getSettingsHistory: async (settingKey: string): Promise<any[]> => {
    const { data, error } = await supabase.from('system_settings_history').select('*').eq('setting_key', settingKey).order('created_at', { ascending: false });
    if (error) handleError(error, 'getSettingsHistory');
    return data || [];
  },
  revertSettingValue: async (historyId: string) => {
    const historyEntry = await getDocument<SystemSettingsHistory>('system_settings_history', historyId);
    if (!historyEntry) throw new Error("History entry not found");

    const { data: currentSetting } = await supabase.from('system_settings').select('id, value').eq('key', historyEntry.setting_key).single();
    if (!currentSetting) throw new Error(`Setting with key ${historyEntry.setting_key} not found`);

    // This will trigger the logging function again, creating a new history entry for the revert action.
    await supabaseService.updateSystemSetting(historyEntry.setting_key, JSON.parse(historyEntry.new_value), 'user', 1.0, `Revertido para a versão de ${new Date(historyEntry.created_at).toLocaleString('pt-BR')}`);
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
  addUser: async (userData: Partial<UserProfile> & { password?: string }): Promise<UserProfile> => {
      const { email, password, role } = userData;
      if (!email || !password || !role) {
        throw new Error("Email, password, and role are required to create a new user.");
      }

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email, password, role },
      });
      
      if (error) {
        if (error instanceof (supabase as any).functions.FunctionsHttpError) {
          const errorMessage = await error.context.json();
          throw new Error(errorMessage.error || `HTTP Error ${error.context.status}: ${error.context.statusText}`);
        }
        if (error instanceof (supabase as any).functions.FunctionsRelayError) {
           throw new Error(`Relay Error: ${error.message}`);
        }
        if (error instanceof (supabase as any).functions.FunctionsFetchError) {
           throw new Error(`Network Error: ${error.message}`);
        }
        throw new Error(error.message);
      }
      
      if (data && data.error) {
        throw new Error(data.error);
      }

      return { id: 'temp-id', ...userData } as UserProfile;
  },
  
  getMaterials: (): Promise<Material[]> => supabaseService.getCollection('config_materials', '*, config_supply_groups(name)'),
  getMaterialGroups: (): Promise<MaterialGroup[]> => supabaseService.getCollection('config_supply_groups'),
  addMaterial: (data: any): Promise<Material> => addDocument<Material>('config_materials', data),
  addMaterialGroup: (data: any): Promise<MaterialGroup> => addDocument<MaterialGroup>('config_supply_groups', data),

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
    const data = await supabaseService.getDocument<Order>('orders', id);
    if (!data) return null;
    
    const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);
    if (itemsError) handleError(itemsError, `getOrder(${id}) (items)`);

    return { ...data, items: itemsData || [] };
  },
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => updateDocument<Order>('orders', orderId, { status: newStatus, updated_at: new Date().toISOString() }),
  addOrder: async (orderData: Partial<Order>) => {
      const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const { items, ...orderFields } = orderData;
      
      const fullOrderData = {
          ...orderFields,
          number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
      };
      
      const savedOrder = await addDocument<Order>('orders', fullOrderData as any);
      
      if (items && items.length > 0) {
          const itemsWithOrderId = items.map(item => ({
              ...item,
              order_id: savedOrder.id,
          }));
          await addManyDocuments<OrderItem>('order_items', itemsWithOrderId as any);
      }
  },
  getProducts: (): Promise<Product[]> => supabaseService.getCollection<Product>('products'),
  getContacts: (): Promise<Contact[]> => supabaseService.getCollection<Contact>('customers'),
  getProductionOrders: (): Promise<ProductionOrder[]> => supabaseService.getCollection<ProductionOrder>('production_orders'),
  updateProductionOrderStatus: (id: string, status: ProductionOrderStatus) => updateDocument<ProductionOrder>('production_orders', id, { status, updated_at: new Date().toISOString() }),
  getTaskStatuses: (): Promise<TaskStatus[]> => supabaseService.getCollection<TaskStatus>('task_statuses'),
  // FIX: Changed return type from Promise<Task> to Promise<Task[]> to match what getCollection returns.
  getTasks: (): Promise<Task[]> => supabaseService.getCollection<Task>('tasks'),
  getProductionRoutes: (): Promise<ProductionRoute[]> => supabaseService.getCollection<ProductionRoute>('production_routes'),
  getMoldLibrary: (): Promise<MoldLibrary[]> => supabaseService.getCollection<MoldLibrary>('mold_library'),
  getLogisticsData: async () => {
    const [orders, waves, shipments] = await Promise.all([
        supabaseService.getCollection<Order>('orders', '*, customers(name)'),
        supabaseService.getCollection<LogisticsWave>('logistics_waves'),
        supabaseService.getCollection<LogisticsShipment>('logistics_shipments'),
    ]);
    return { orders, waves, shipments };
  },
  getPurchasingData: async () => {
    const [suppliers, purchase_orders] = await Promise.all([
        supabaseService.getCollection<Supplier>('suppliers'),
        supabaseService.getCollection<PurchaseOrder>('purchase_orders', '*, supplier:suppliers(name)')
    ]);
    return { suppliers, purchase_orders };
  },
  getPurchaseOrderItems: async (poId: string): Promise<PurchaseOrderItem[]> => {
    const { data, error } = await supabase.from('purchase_order_items').select('*, material:config_materials(name, sku)').eq('po_id', poId);
    if(error) handleError(error, 'getPurchaseOrderItems');
    return data || [];
  },
  createPO: async (poData: { supplier_id: string; items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[] }) => {
    const total = poData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const poNumber = `PC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const newPO = {
        supplier_id: poData.supplier_id,
        status: 'draft' as PurchaseOrderStatus,
        total,
        po_number: poNumber,
    };
    const savedPO = await addDocument<PurchaseOrder>('purchase_orders', newPO as any);
    const itemsToSave = poData.items.map(item => ({...item, po_id: savedPO.id}));
    await addManyDocuments<PurchaseOrderItem>('purchase_order_items', itemsToSave as any);
  },
  receivePOItems: async (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) => {
    const po = await supabaseService.getDocument<PurchaseOrder>('purchase_orders', poId);
    if(!po) throw new Error("Purchase Order not found");

    for (const received of receivedItems) {
        const item = (await supabaseService.getDocument<PurchaseOrderItem>('purchase_order_items', received.itemId));
        if(!item) continue;
        
        // FIX: Add explicit generic type to resolve type error.
        await updateDocument<PurchaseOrderItem>('purchase_order_items', item.id, { received_quantity: item.received_quantity + received.receivedQty });
        
        await supabaseService.addInventoryMovement({
            material_id: item.material_id,
            type: 'in',
            quantity: received.receivedQty,
            reason: 'RECEBIMENTO_PO',
            ref: po.po_number,
        });
    }
    const allItems = await supabaseService.getPurchaseOrderItems(poId);
    const allReceived = allItems.every(i => i.received_quantity >= i.quantity);
    const newStatus = allReceived ? 'received' : 'partial';
    // FIX: Add explicit generic type to resolve type error.
    await updateDocument<PurchaseOrder>('purchase_orders', poId, { status: newStatus });
  },
  getFinanceData: async () => {
    const [accounts, categories, transactions, payables, receivables] = await Promise.all([
        supabaseService.getCollection<FinanceAccount>('finance_accounts'),
        supabaseService.getCollection<FinanceCategory>('finance_categories'),
        supabaseService.getCollection<FinanceTransaction>('finance_transactions', '*, account:finance_accounts(name), category:finance_categories(name)'),
        supabaseService.getCollection<FinancePayable>('finance_payables'),
        supabaseService.getCollection<FinanceReceivable>('finance_receivables'),
    ]);
    return { accounts, categories, transactions, payables, receivables };
  },
  getInventoryMovements: async (itemId: string, itemType: 'material' | 'product'): Promise<InventoryMovement[]> => {
    const filterField = itemType === 'material' ? 'material_id' : 'product_variant_id';
    const { data, error } = await supabase.from('inventory_movements').select('*').eq(filterField, itemId).order('created_at', { ascending: false });
    if (error) handleError(error, 'getInventoryMovements');
    return data || [];
  },
  addInventoryMovement: (movementData: any) => addDocument('inventory_movements', movementData),
  transferStock: async (transferData: any) => {
    await supabaseService.addInventoryMovement({
        material_id: transferData.material_id,
        type: 'out',
        quantity: -transferData.quantity,
        reason: 'TRANSFERENCIA_INTERNA',
        warehouse_id: transferData.from_warehouse_id,
        notes: `Para ${transferData.to_warehouse_id}`
    });
    await supabaseService.addInventoryMovement({
        material_id: transferData.material_id,
        type: 'in',
        quantity: transferData.quantity,
        reason: 'TRANSFERENCIA_INTERNA',
        warehouse_id: transferData.to_warehouse_id,
        notes: `De ${transferData.from_warehouse_id}`
    });
  },
  updateSystemSetting: async (key: string, value: any, source: 'user' | 'AI', confidence: number, explanation: string) => {
    const { data: currentSetting } = await supabase.from('system_settings').select('id, value').eq('key', key).single();
    if (!currentSetting) throw new Error(`Setting with key ${key} not found`);
    const { data: { user } } = await supabase.auth.getUser();

    const newValueString = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    
    await updateDocument<SystemSetting>('system_settings', currentSetting.id, { value: newValueString });
    await addDocument<SystemSettingsHistory>('system_settings_history', {
        setting_id: currentSetting.id,
        setting_key: key,
        old_value: currentSetting.value,
        new_value: newValueString,
        changed_by: source === 'AI' ? 'AI' : user?.email || 'user',
    } as any);
  },
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
        const { error } = await supabase.from('system_settings').select('id').limit(1);
        if (error) throw error;
        return { success: true, message: "Conexão com Supabase e acesso à 'system_settings' bem-sucedidos." };
    } catch (error: any) {
        return { success: false, message: `Falha na conexão: ${error.message}` };
    }
  },
  testIntegrationConnection: async (id: string): Promise<void> => {
      console.warn(`[MOCK] testIntegrationConnection for ${id}`);
      await new Promise(res => setTimeout(res, 1000));
      const shouldFail = Math.random() > 0.8;
      await updateDocument<Integration>('config_integrations', id, {
          status: shouldFail ? 'error' : 'connected',
          last_sync: new Date().toISOString(),
          last_error: shouldFail ? 'Simulated connection timeout' : undefined,
      });
      await addDocument('integration_logs', {
          integration_id: id,
          event: 'Connection Test',
          message: shouldFail ? 'Failed: Simulated timeout' : 'Success',
      });
  }
};
