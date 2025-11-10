import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    AnyProduct,
    ProductionTask, ProductionQualityCheck, SystemAudit,
    InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont, SystemSetting, LogisticsWave, LogisticsShipment,
    MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem,
    OrderPayment, OrderTimelineEvent, OrderNote, AnalyticsKPI, ExecutiveKPI, AIInsight, OrderStatus, AnySettingsItem, SettingsCategory, FinanceAccount, FinanceCategory, FinancePayable, FinanceReceivable, FinanceTransaction, SystemSettingsLog, Integration, IntegrationLog, MediaAsset,
    MaterialGroup, Material, InitializerLog, InitializerSyncState, InitializerAgent, ColorPalette, LiningColor, PullerColor, EmbroideryColor, FabricTexture,
    WorkflowRule, Notification, Warehouse, ProductionAudit, Collection, AnalyticsSnapshot, BOMComponent, ProductVariant, IntegrationStatus, MoldLibrary, ProductionRoute, ProductionOrderStatus, UserProfile
} from '../types';

// --- SEED DATA ---
const generateId = () => crypto.randomUUID();
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const warehousesSeed: Warehouse[] = [];
export const customersSeed: Contact[] = [];
export const product_categoriesSeed: ProductCategory[] = [];
export const collectionsSeed: Collection[] = [];
export const productsSeed: Product[] = [];
export const product_variantsSeed: ProductVariant[] = [];
export const order_itemsSeed: OrderItem[] = [];
export const ordersSeed: Omit<Order, 'items' | 'customers'>[] = [];
export const production_ordersSeed: ProductionOrder[] = [];
export const fabric_colorsSeed: FabricColor[] = [];
export const zipper_colorsSeed: ZipperColor[] = [];
export const bias_colorsSeed: BiasColor[] = [];
export const embroidery_colorsSeed: EmbroideryColor[] = [];
export const config_fontsSeed: MonogramFont[] = [];
export const config_supply_groupsSeed: MaterialGroup[] = [];
export const suppliersSeed: Supplier[] = [];
export const config_materialsSeed: Material[] = [];
export const task_statusesSeed: TaskStatus[] = [];
export const tasksSeed: Task[] = [];
export const production_auditSeed: ProductionAudit[] = [];
export const inventory_balancesSeed: InventoryBalance[] = [];
export const inventory_movementsSeed: InventoryMovement[] = [];
export const system_settingsSeed: SystemSetting[] = [];
export const conversationsSeed: Conversation[] = [];
export const messagesSeed: Message[] = [];
export const logistics_wavesSeed: LogisticsWave[] = [];
export const logistics_shipmentsSeed: LogisticsShipment[] = [];
export const marketing_campaignsSeed: MarketingCampaign[] = [];
export const marketing_segmentsSeed: MarketingSegment[] = [];
export const marketing_templatesSeed: MarketingTemplate[] = [];
export const purchase_order_itemsSeed: PurchaseOrderItem[] = [];
export const purchase_ordersSeed: PurchaseOrder[] = [];
export const mold_librarySeed: MoldLibrary[] = [];
export const production_routesSeed: ProductionRoute[] = [];

// --- IN-MEMORY DATABASE ---
// This object aggregates all our seed data into a single "database"
const db: AppData = {
    production_audit: [],
    production_quality_checks: [],
    production_tasks: [],
    system_audit: [],
    warehouses: warehousesSeed,
    customers: customersSeed,
    profiles: [],
    product_categories: product_categoriesSeed,
    products: productsSeed,
    product_variants: product_variantsSeed,
    order_items: order_itemsSeed,
    orders: ordersSeed as any,
    production_orders: production_ordersSeed,
    task_statuses: task_statusesSeed,
    tasks: tasksSeed,
    inventory_balances: inventory_balancesSeed,
    inventory_movements: inventory_movementsSeed,
    sistema: system_settingsSeed,
    logistics_waves: logistics_wavesSeed,
    logistics_shipments: logistics_shipmentsSeed,
    marketing_campaigns: marketing_campaignsSeed,
    marketing_segments: marketing_segmentsSeed,
    marketing_templates: marketing_templatesSeed,
    suppliers: suppliersSeed,
    purchase_orders: purchase_ordersSeed,
    purchase_order_items: purchase_order_itemsSeed,
    collections: collectionsSeed,
    mold_library: mold_librarySeed,
    production_routes: production_routesSeed,
    catalogs: {
        paletas_cores: [],
        cores_texturas: {
            tecido: fabric_colorsSeed,
            ziper: zipper_colorsSeed,
            vies: bias_colorsSeed,
            forro: [],
            puxador: [],
            bordado: embroidery_colorsSeed,
            texturas: [],
        },
        fontes_monogramas: config_fontsSeed,
    },
    config_supply_groups: config_supply_groupsSeed,
    config_materials: config_materialsSeed,
    logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
    system_settings_logs: [],
    config_integrations: [],
    integration_logs: [],
    media_assets: [],
    omnichannel: { conversations: conversationsSeed, messages: messagesSeed, quotes: [] },
    analytics_kpis: [],
    analytics_snapshots: [],
    executive_kpis: [],
    executive_ai_insights: [],
    finance_accounts: [],
    finance_categories: [],
    finance_transactions: [],
    finance_payables: [],
    finance_receivables: [],
    initializer_logs: [],
    initializer_sync_state: [],
    initializer_agents: [],
    workflow_rules: [],
    notifications: [],
};

const getCollection = <T>(table: string): T[] => {
    return (db as any)[table] || [];
};

// --- FAKE REALTIME EVENT BUS ---
const eventBus = new EventTarget();
const emit = (path: string) => {
    console.log(`🧱 SANDBOX: Emitting update for path -> ${path}`);
    eventBus.dispatchEvent(new CustomEvent(path));
};
const subscribe = (path: string, handler: (items: any[]) => void) => {
    const callback = () => handler(getCollection(path));
    eventBus.addEventListener(path, callback);
    callback();
    return { unsubscribe: () => eventBus.removeEventListener(path, callback) };
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


export const sandboxDb = {
    getCollection: <T>(table: string): Promise<T[]> => {
        console.log(`🧱 SANDBOX: getCollection(${table})`);
        return new Promise(resolve => {
            setTimeout(() => {
                const data = getCollection<T>(table);
                 if (data.length === 0) {
                    console.warn(`[sandboxDb] No data found for table "${table}". Returning empty array.`);
                }
                resolve(JSON.parse(JSON.stringify(data)));
            }, 200);
        });
    },

    getDocument: async <T extends { id: string }>(table: string, id: string): Promise<T | null> => {
        console.log(`🧱 SANDBOX: getDocument(${table}, ${id})`);
        await delay(50);
        const collection = getCollection<T>(table);
        const doc = collection.find(d => d.id === id) || null;
        return JSON.parse(JSON.stringify(doc));
    },

    addDocument: async <T extends { id?: string }>(table: string, docData: Omit<T, 'id'>): Promise<T> => {
        console.log(`🧱 SANDBOX: addDocument(${table})`);
        await delay(100);
        const newDoc = { ...docData, id: generateId(), created_at: new Date().toISOString() } as unknown as T;
        (db as any)[table].push(newDoc);
        
        if (table === 'production_orders') {
            console.log('🧱 SANDBOX: [TRIGGER] production_orders insert detected. Simulating inventory reservation.');
            const po = newDoc as unknown as ProductionOrder;
            const product = db.products.find(p => p.id === po.product_id);
            if (product && product.base_bom) {
                console.log(`🧱 SANDBOX: Reserving inventory for ${product.base_bom.length} BOM items.`);
                for (const bomItem of product.base_bom) {
                    const balance = db.inventory_balances.find(b => b.material_id === bomItem.material_id);
                    if (balance) {
                        const quantityToReserve = bomItem.quantity_per_unit * po.quantity;
                        balance.reserved_stock += quantityToReserve;
                        console.log(`🧱 SANDBOX: Reserved ${quantityToReserve} of material ${bomItem.material_id}. New reserved stock: ${balance.reserved_stock}`);
                    }
                }
                emit('inventory_balances');
            }
        }
        
        emit(table);
        return JSON.parse(JSON.stringify(newDoc));
    },
    
    addManyDocuments: async <T extends { id?: string }>(table: string, docsData: Omit<T, 'id'>[]): Promise<T[]> => {
        console.log(`🧱 SANDBOX: addManyDocuments(${table})`);
        await delay(100);
        const newDocs = docsData.map(docData => ({ ...docData, id: generateId(), created_at: new Date().toISOString() })) as unknown as T[];
        (db as any)[table].push(...newDocs);
        emit(table);
        return JSON.parse(JSON.stringify(newDocs));
    },

    updateDocument: async <T extends { id: string }>(table: string, id: string, docData: Partial<T>): Promise<T> => {
        console.log(`🧱 SANDBOX: updateDocument(${table}, ${id})`);
        await delay(100);
        const collection = getCollection<T>(table);
        const docIndex = collection.findIndex(d => d.id === id);
        if (docIndex === -1) throw new Error(`Document with id ${id} not found in ${table}`);
        const updatedDoc = { ...collection[docIndex], ...docData, updated_at: new Date().toISOString() };
        collection[docIndex] = updatedDoc;
        emit(table);
        return JSON.parse(JSON.stringify(updatedDoc));
    },

    deleteDocument: async (table: string, id: string): Promise<void> => {
        console.log(`🧱 SANDBOX: deleteDocument(${table}, ${id})`);
        await delay(100);
        const collection = getCollection<any>(table);
        const initialLength = collection.length;
        (db as any)[table] = collection.filter((d: any) => d.id !== id);
        if ((db as any)[table].length === initialLength) {
             console.warn(`[sandboxDb] deleteDocument: ID ${id} not found in ${table}`);
        }
        emit(table);
    },

    addUser: async (userData: any): Promise<UserProfile> => {
        console.log(`🧱 SANDBOX: addUser()`);
        await delay(100);
        const newUser: UserProfile = {
            id: generateId(),
            email: userData.email,
            role: userData.role,
            created_at: new Date().toISOString()
        };
        (db as any).profiles.push(newUser);
        emit('profiles');
        return JSON.parse(JSON.stringify(newUser));
    },

    listenToCollection: <T>(table: string, join: string | undefined, handler: (payload: T[]) => void) => {
        console.log(`🧱 SANDBOX: listenToCollection(${table})`);
        return subscribe(table, handler);
    },
    
    listenToDocument: <T extends { id: string }>(table: string, id: string, handler: (payload: T) => void) => {
        console.log(`🧱 SANDBOX: listenToDocument(${table}, ${id})`);
        const sub = subscribe(table, (items: T[]) => {
            const item = items.find(i => i.id === id);
            if (item) handler(item);
        });
        return { unsubscribe: sub.unsubscribe };
    },

    testIntegrationConnection: async (id: string): Promise<void> => {
        console.log(`🧱 SANDBOX: testIntegrationConnection(${id})`);
        await delay(1000);
        const integration = db.config_integrations.find(i => i.id === id);
        if (integration) {
            integration.status = Math.random() > 0.2 ? 'connected' : 'error';
            integration.last_sync = new Date().toISOString();
            if (integration.status === 'error') {
                integration.last_error = 'Simulated connection failure.';
            } else {
                integration.last_error = undefined;
            }
            emit('config_integrations');
        }
    },
    
    getSettings: async (): Promise<AppData> => {
        console.log("🧱 SANDBOX: getSettings()");
        await delay(100);
        return JSON.parse(JSON.stringify(db));
    },
    
    addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null): Promise<any> => {
        const tableName = getTableNameForSetting(category, subTab, subSubTab);
        return sandboxDb.addDocument(tableName, data);
    },
    updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null): Promise<any> => {
        const tableName = getTableNameForSetting(category, subTab, subSubTab);
        return sandboxDb.updateDocument(tableName, id, data);
    },
    deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null): Promise<void> => {
        const tableName = getTableNameForSetting(category, subTab, subSubTab);
        return sandboxDb.deleteDocument(tableName, id);
    },
    updateSystemSettings: async (settings: SystemSetting[]): Promise<void> => {
        console.log("🧱 SANDBOX: updateSystemSettings()");
        await delay(150);
        settings.forEach(settingToUpdate => {
            const index = db.sistema.findIndex(s => s.id === settingToUpdate.id);
            if(index !== -1) {
                db.sistema[index].value = settingToUpdate.value;
            }
        });
        emit('system_settings');
    },

    updateSystemSetting: async (key: string, newValue: any, source: string, confidence: number, explanation: string): Promise<void> => {
        const setting = db.sistema.find(s => s.key === key);
        if (setting) {
            const oldValue = setting.value;
            setting.value = JSON.stringify(newValue);
            
            await sandboxDb.addDocument<SystemSettingsLog>('system_settings_logs', {
                key,
                old_value: oldValue,
                new_value: setting.value,
                source_module: source,
                confidence,
                explanation,
            } as any);
            emit('system_settings');
        }
    },
    
    getMaterials: (): Promise<Material[]> => sandboxDb.getCollection('config_materials'),
    getMaterialGroups: (): Promise<MaterialGroup[]> => sandboxDb.getCollection('config_supply_groups'),
    addMaterial: (data: any): Promise<Material> => sandboxDb.addDocument('config_materials', data),
    addMaterialGroup: (data: any): Promise<MaterialGroup> => sandboxDb.addDocument('config_supply_groups', data),

    getOrders: async (): Promise<Order[]> => {
        console.log("🧱 SANDBOX: getOrders()");
        await delay(200);
        return JSON.parse(JSON.stringify(db.orders.map(o => ({
            ...o,
            items: db.order_items.filter(i => i.order_id === o.id),
            customers: db.customers.find(c => c.id === o.customer_id)
        }))));
    },

    getOrder: async (id: string): Promise<Order | null> => {
        console.log(`🧱 SANDBOX: getOrder(${id})`);
        const order = await sandboxDb.getDocument<Order>('orders', id);
        if (!order) return null;
        const items = db.order_items.filter(i => i.order_id === id);
        const customer = db.customers.find(c => c.id === order.customer_id);
        return JSON.parse(JSON.stringify({ ...order, items, customers: customer }));
    },

    updateOrderStatus: (orderId: string, newStatus: OrderStatus): Promise<Order> => {
        return sandboxDb.updateDocument<Order>('orders', orderId, { status: newStatus });
    },
    
    updateProductionOrderStatus: (orderId: string, newStatus: ProductionOrderStatus): Promise<ProductionOrder> => {
        return sandboxDb.updateDocument<ProductionOrder>('production_orders', orderId, { status: newStatus });
    },

    addOrder: async (orderData: Partial<Order>): Promise<Order> => {
        const { items, ...orderRest } = orderData;
        const newOrder = await sandboxDb.addDocument<Order>('orders', orderRest as any);
        if (items) {
            for (const item of items) {
                await sandboxDb.addDocument<OrderItem>('order_items', { ...item, order_id: newOrder.id } as any);
            }
        }
        emit('orders');
        return newOrder;
    },

    updateOrder: (orderId: string, data: Partial<Order>): Promise<Order> => sandboxDb.updateDocument('orders', orderId, data),
    
    getContacts: (): Promise<Contact[]> => sandboxDb.getCollection('customers'),
    getProducts: (): Promise<Product[]> => sandboxDb.getCollection('products'),
    getProductCategories: (): Promise<ProductCategory[]> => sandboxDb.getCollection('product_categories'),
    addProduct: (productData: AnyProduct) => sandboxDb.addDocument('products', productData),
    updateProduct: (productId: string, productData: Product | AnyProduct) => {
      const { id, category, ...updateData } = productData as Product;
      return sandboxDb.updateDocument<Product>('products', productId, updateData);
    },
    getProductionOrders: (): Promise<ProductionOrder[]> => sandboxDb.getCollection('production_orders'),
    getTasks: (): Promise<Task[]> => sandboxDb.getCollection('tasks'),
    getTaskStatuses: (): Promise<TaskStatus[]> => sandboxDb.getCollection('task_statuses'),
    getInventoryBalances: (): Promise<InventoryBalance[]> => sandboxDb.getCollection('inventory_balances'),
    getMarketingCampaigns: (): Promise<MarketingCampaign[]> => sandboxDb.getCollection('marketing_campaigns'),
    getMarketingSegments: (): Promise<MarketingSegment[]> => sandboxDb.getCollection('marketing_segments'),
    getMarketingTemplates: (): Promise<MarketingTemplate[]> => sandboxDb.getCollection('marketing_templates'),
    getAnalyticsKpis: (): Promise<AnalyticsKPI[]> => sandboxDb.getCollection('analytics_kpis'),
    getNotifications: (): Promise<Notification[]> => sandboxDb.getCollection('notifications'),
    markNotificationAsRead: (id: string): Promise<Notification> => sandboxDb.updateDocument<Notification>('notifications', id, { is_read: true }),
    getProductionRoutes: (): Promise<ProductionRoute[]> => sandboxDb.getCollection('production_routes'),
    getMoldLibrary: (): Promise<MoldLibrary[]> => sandboxDb.getCollection('mold_library'),

    getInventoryMovements: (itemId: string, itemType: 'material' | 'product'): Promise<InventoryMovement[]> => {
        const allMovements = getCollection<InventoryMovement>('inventory_movements');
        const filteredMovements = allMovements.filter(m => {
            if (itemType === 'material') {
                return m.material_id === itemId;
            } else {
                return m.product_variant_id === itemId;
            }
        });
        return Promise.resolve(filteredMovements.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    },

    addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement> => {
        const newMovement = await sandboxDb.addDocument<InventoryMovement>('inventory_movements', movementData as any);
        
        const balance = db.inventory_balances.find(b => b.material_id === newMovement.material_id && b.warehouse_id === newMovement.warehouse_id);
        if (balance) {
            balance.current_stock += newMovement.quantity;
        } else if(newMovement.type !== 'transfer') {
            db.inventory_balances.push({
                id: generateId(),
                material_id: newMovement.material_id,
                warehouse_id: newMovement.warehouse_id!,
                current_stock: newMovement.quantity,
                reserved_stock: 0,
                updated_at: new Date().toISOString(),
            });
        }
        emit('inventory_balances');
        return newMovement;
    },
    
    transferStock: async (transferData: any): Promise<void> => {
        await sandboxDb.addInventoryMovement({
            ...transferData,
            warehouse_id: transferData.from_warehouse_id,
            quantity: -Math.abs(transferData.quantity),
        });
        await sandboxDb.addInventoryMovement({
            ...transferData,
            warehouse_id: transferData.to_warehouse_id,
            quantity: Math.abs(transferData.quantity),
        });
    },

    getLogisticsData: async (): Promise<{ orders: Order[], waves: LogisticsWave[], shipments: LogisticsShipment[] }> => {
        const [orders, waves, shipments] = await Promise.all([
            sandboxDb.getOrders(),
            sandboxDb.getCollection<LogisticsWave>('logistics_waves'),
            sandboxDb.getCollection<LogisticsShipment>('logistics_shipments'),
        ]);
        return { orders, waves, shipments };
    },
    
    getPurchasingData: async (): Promise<{ suppliers: Supplier[], purchase_orders: PurchaseOrder[], purchase_order_items: PurchaseOrderItem[] }> => {
        const [suppliers, purchase_orders, purchase_order_items] = await Promise.all([
            sandboxDb.getCollection<Supplier>('suppliers'),
            sandboxDb.getCollection<PurchaseOrder>('purchase_orders'),
            sandboxDb.getCollection<PurchaseOrderItem>('purchase_order_items'),
        ]);
        return { suppliers, purchase_orders, purchase_order_items };
    },

    createPO: async (poData: { supplier_id: string, items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[] }): Promise<PurchaseOrder> => {
        const po_number = `PC-SANDBOX-${Date.now().toString().slice(-4)}`;
        const total = poData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const newPO = await sandboxDb.addDocument<PurchaseOrder>('purchase_orders', {
            po_number,
            supplier_id: poData.supplier_id,
            status: 'draft',
            total
        } as any);

        for(const item of poData.items) {
            await sandboxDb.addDocument<PurchaseOrderItem>('purchase_order_items', { ...item, po_id: newPO.id, received_quantity: 0 } as any);
        }
        emit('purchase_orders');
        return newPO;
    },

    receivePOItems: async (poId: string, receivedItems: { itemId: string; receivedQty: number }[]): Promise<void> => {
        const po = db.purchase_orders.find(p => p.id === poId);
        if (!po) return;
        
        let allReceived = true;
        for (const received of receivedItems) {
            const item = db.purchase_order_items.find(i => i.id === received.itemId);
            if (item) {
                item.received_quantity += received.receivedQty;
                if (item.received_quantity < item.quantity) allReceived = false;
                
                const material = db.config_materials.find(m => m.id === item.material_id);
                if (material) {
                    await sandboxDb.addInventoryMovement({
                        material_id: material.id,
                        type: 'in',
                        quantity: received.receivedQty,
                        reason: 'RECEBIMENTO_PO',
                        ref: po.po_number,
                        warehouse_id: 'w1',
                    });
                }
            }
        }
        po.status = allReceived ? 'received' : 'partial';
        emit('purchase_orders');
        emit('purchase_order_items');
    },
    
    getFinanceData: async (): Promise<any> => {
         return {
            accounts: await sandboxDb.getCollection('finance_accounts'),
            categories: await sandboxDb.getCollection('finance_categories'),
            transactions: await sandboxDb.getCollection('finance_transactions'),
            payables: await sandboxDb.getCollection('finance_payables'),
            receivables: await sandboxDb.getCollection('finance_receivables'),
        };
    },

    uploadFile: async (file: File, module: string, category: string): Promise<any> => {
        await delay(500);
        const newAsset: MediaAsset = {
            id: generateId(),
            drive_file_id: `sandbox_${file.name}_${Date.now()}`,
            module,
            category,
            name: file.name,
            mime_type: file.type,
            size: file.size,
            url_public: URL.createObjectURL(file),
            created_at: new Date().toISOString(),
        };
        db.media_assets.push(newAsset);
        emit('media_assets');
        return { id: newAsset.drive_file_id, webViewLink: newAsset.url_public };
    },
};
