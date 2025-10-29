import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    BasicMaterial, InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont, SystemSetting, LogisticsWave, LogisticsShipment,
    MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem,
    OrderPayment, OrderTimelineEvent, OrderNote
} from '../types';

// --- FAKE REALTIME EVENT BUS ---
const eventBus = new EventTarget();
const emit = (path: string) => {
    console.log(`🧱 SANDBOX: Emitting update for path -> ${path}`);
    eventBus.dispatchEvent(new CustomEvent(path));
};
const subscribe = (path: string, handler: (items: any[]) => void) => {
    const callback = () => handler(getCollection(path));
    eventBus.addEventListener(path, callback);
    // Initial call to populate data
    callback();
    return { unsubscribe: () => eventBus.removeEventListener(path, callback) };
};

// --- SEED DATA ---
const generateId = () => crypto.randomUUID();

const contacts: Contact[] = [
    { id: 'c1', name: 'Ana Silva', document: '111.222.333-44', email: 'ana.silva@example.com', phone: '(11) 98765-4321', whatsapp: '5511987654321', instagram: '@anasilva', address: { city: 'São Paulo', state: 'SP', street: 'Rua das Flores, 123' }, phones: {} },
    { id: 'c2', name: 'Bruno Costa', document: '222.333.444-55', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', address: { city: 'Rio de Janeiro', state: 'RJ', street: 'Avenida Copacabana, 456' }, phones: {} },
    { id: 'c3', name: 'Carla Dias', document: '333.444.555-66', email: 'carla.dias@example.com', phone: '(31) 95555-8888', address: { city: 'Belo Horizonte', state: 'MG', street: 'Praça da Liberdade, 789' }, phones: {} },
];

const products: Product[] = [
    { id: 'p1', name: 'Bolsa Tote Clássica', base_sku: 'BT-CLA-01', base_price: 299.90, category: 'Bolsas', stock_quantity: 15, hasVariants: true, attributes: { fabricColor: ['fc1', 'fc2'], zipperColor: ['zc1'] }, images:[], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', name: 'Nécessaire de Viagem', base_sku: 'NV-GRD-01', base_price: 129.90, category: 'Nécessaires', stock_quantity: 30, hasVariants: true, attributes: { embroidery: true, fabricColor: ['fc1', 'fc3'], zipperColor: ['zc1', 'zc2'] }, images:[], createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p3', name: 'Mochila Urbana', base_sku: 'MU-PRE-01', base_price: 450.00, category: 'Mochilas', stock_quantity: 8, hasVariants: false, images:[], createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
];

const order_items: OrderItem[] = [
    { id: 'oi1', order_id: 'o1', product_id: 'p1', product_name: 'Bolsa Tote Clássica', quantity: 1, unit_price: 299.90, total: 299.90, config_json: { fabricColor: 'Bege' } },
    { id: 'oi2', order_id: 'o2', product_id: 'p2', product_name: 'Nécessaire de Viagem', quantity: 2, unit_price: 129.90, total: 259.80, config_json: { embroidery: { enabled: true, text: 'CD', font: 'mf1' } } },
    { id: 'oi3', order_id: 'o2', product_id: 'p3', product_name: 'Mochila Urbana', quantity: 1, unit_price: 450.00, total: 450.00 },
];

const orders: Order[] = [
    { id: 'o1', number: 'OLIE-2024-1001', customer_id: 'c1', customers: contacts[0], status: 'in_production', items: [order_items[0]], payments_history: [], timeline: [], notes_internal: [], subtotal: 299.90, discounts: 0, shipping_fee: 25.00, total: 324.90, created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'o2', number: 'OLIE-2024-1002', customer_id: 'c3', customers: contacts[2], status: 'paid', items: [order_items[1], order_items[2]], payments_history: [], timeline: [], notes_internal: [], subtotal: 709.80, discounts: 10.00, shipping_fee: 0.00, total: 699.80, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'o3', number: 'OLIE-2024-1003', customer_id: 'c2', customers: contacts[1], status: 'pending_payment', items: [], payments_history: [], timeline: [], notes_internal: [], subtotal: 129.90, discounts: 0, shipping_fee: 15.00, total: 144.90, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const production_orders: ProductionOrder[] = [
    { id: 'po1', po_number: 'OP-2024-001', product_id: 'p1', product: products[0], quantity: 5, status: 'em_andamento', priority: 'alta', due_date: new Date(Date.now() + 5 * 86400000).toISOString(), steps_completed: 2, steps_total: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'po2', po_number: 'OP-2024-002', product_id: 'p2', product: products[1], quantity: 10, status: 'planejado', priority: 'normal', due_date: new Date(Date.now() + 10 * 86400000).toISOString(), steps_completed: 0, steps_total: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const fabric_colors: FabricColor[] = [
    { id: 'fc1', name: 'Bege Claro', hex: '#F5F5DC', palette_id: 'pal1', is_active: true },
    { id: 'fc2', name: 'Azul Marinho', hex: '#000080', palette_id: 'pal1', is_active: true },
    { id: 'fc3', name: 'Rosa Quartzo', hex: '#F7CAC9', palette_id: 'pal1', is_active: false },
];
const zipper_colors: ZipperColor[] = [
    { id: 'zc1', name: 'Dourado', hex: '#FFD700', palette_id: 'pal1', is_active: true },
    { id: 'zc2', name: 'Prateado', hex: '#C0C0C0', palette_id: 'pal1', is_active: true },
];
const bias_colors: BiasColor[] = [
    { id: 'bc1', name: 'Viés Caramelo', hex: '#D2691E', palette_id: 'pal1', is_active: true },
];
const config_fonts: MonogramFont[] = [
    { id: 'mf1', name: 'Brush Script', style: 'script', category: 'script', preview_url: '', font_file_url: '', is_active: true },
    { id: 'mf2', name: 'Times New Roman', style: 'regular', category: 'serif', preview_url: '', font_file_url: '', is_active: true },
];
const config_basic_materials: BasicMaterial[] = [
    { id: 'bm1', name: 'Tecido Linho Bege', codigo: 'TEC-LIN-BG', supply_group_id: 'sg1', unit: 'm', default_cost: 45.50, is_active: true },
    { id: 'bm2', name: 'Zíper YKK Dourado', codigo: 'ZIP-YKK-DO', supply_group_id: 'sg2', unit: 'un', default_cost: 3.20, is_active: true },
    { id: 'bm3', name: 'Linha de Costura Branca', codigo: 'LIN-COS-BR', supply_group_id: 'sg3', unit: 'm', default_cost: 0.10, is_active: true },
];
const task_statuses: TaskStatus[] = [
    {id: 'ts1', name: 'Corte', color: '#FFF2E5', position: 1},
    {id: 'ts2', name: 'Costura', color: '#E6F7FF', position: 2},
    {id: 'ts3', name: 'Acabamento', color: '#F6FFED', position: 3},
];
const tasks: Task[] = [
    {id: 't1', title: 'OP-2024-001 - Bolsa Tote', status_id: 'ts1', client_name: 'Ana Silva', quantity: 5, position: 1},
    {id: 't2', title: 'OP-2024-002 - Nécessaire', status_id: 'ts2', client_name: 'Carla Dias', quantity: 10, position: 1},
];
const inventory_balances: InventoryBalance[] = config_basic_materials.map((m, i) => ({ material_id: m.id, material: m, quantity_on_hand: 50 + i*10, quantity_reserved: 10, low_stock_threshold: 15, last_updated_at: new Date().toISOString() }));
const inventory_movements: InventoryMovement[] = [
    { id: 'im1', material_id: 'bm1', type: 'in', quantity: 100, reason: 'compra', created_at: new Date().toISOString() },
    { id: 'im2', material_id: 'bm1', type: 'out', quantity: -20, reason: 'consumo_producao', created_at: new Date().toISOString() }
];

const system_settings: SystemSetting[] = [
    { id: 'ss1', key: 'freight_params', value: JSON.stringify({ radius_km: 10, base_fee: 15, fee_per_km: 2.5, free_shipping_threshold: 250 }), category: 'logistica', description: 'Configurações para cálculo de frete via motoboy.' },
];
const product_categories: ProductCategory[] = [
    { id: 'pc1', name: 'Bolsas', description: 'Bolsas de diversos tamanhos e modelos.' },
    { id: 'pc2', name: 'Nécessaires', description: 'Nécessaires para organização e viagem.' },
];
const conversations: Conversation[] = [];
const messages: Message[] = [];

const logistics_waves: LogisticsWave[] = [
    { id: 'w1', wave_number: 'WAVE-2024-001', status: 'completed', order_ids: ['o1'], created_by: 'sandbox-user-01', created_at: new Date(Date.now() - 86400000).toISOString() },
];

const logistics_shipments: LogisticsShipment[] = [
    { id: 's1', order_id: 'o1', order_number: 'OLIE-2024-1001', customer_name: 'Ana Silva', status: 'in_transit', tracking_code: 'QB123456789BR', created_at: new Date().toISOString() },
    { id: 's2', order_id: 'o2', order_number: 'OLIE-2024-1002', customer_name: 'Carla Dias', status: 'pending', created_at: new Date().toISOString() },
];

const marketing_campaigns: MarketingCampaign[] = [
    { id: 'mc1', name: 'Lançamento Inverno 2024', status: 'active', channels: ['email', 'instagram'], budget: 5000, spent: 2345.67, kpis: { sent: 10000, delivered: 9850, read: 4500, clicked: 800, replies: 50, orders: 25, revenue: 7497.50 }, description: 'Lançamento da nova coleção de inverno com foco em bolsas de couro.', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), started_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'mc2', name: 'Promoção Dia das Mães', status: 'completed', channels: ['whatsapp', 'email'], budget: 3000, spent: 2980.00, kpis: { sent: 5000, delivered: 4900, read: 3200, clicked: 1200, replies: 150, orders: 80, revenue: 15000 }, description: 'Campanha promocional para o Dia das Mães com descontos progressivos.', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), started_at: new Date(Date.now() - 30 * 86400000).toISOString(), completed_at: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: 'mc3', name: 'Black Friday 2025', status: 'scheduled', channels: ['email', 'instagram', 'sms'], budget: 10000, spent: 0, kpis: { sent: 0, delivered: 0, read: 0, clicked: 0, replies: 0, orders: 0, revenue: 0 }, description: 'Grande campanha de Black Friday com descontos em todo o site.', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), scheduled_at: new Date('2025-11-28T00:00:00Z').toISOString() },
    { id: 'mc4', name: 'Newsletter de Conteúdo', status: 'draft', channels: ['email'], budget: 500, spent: 0, kpis: { sent: 0, delivered: 0, read: 0, clicked: 0, replies: 0, orders: 0, revenue: 0 }, description: 'Campanha recorrente de conteúdo para engajamento.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const marketing_segments: MarketingSegment[] = [
    { id: 'ms1', name: 'Clientes VIP', description: 'Clientes com mais de 5 compras.', rule_count: 2, audience_size: 42 },
    { id: 'ms2', name: 'Inativos (6 meses)', description: 'Clientes que não compram há 6 meses.', rule_count: 1, audience_size: 215 },
];

const marketing_templates: MarketingTemplate[] = [
    { id: 'mt1', name: 'Template Lançamento', channel: 'email', content_preview: '<h1>Nova Coleção Chegou!</h1><p>Confira as novidades...</p>' },
    { id: 'mt2', name: 'Template Promo WhatsApp', channel: 'whatsapp', content_preview: 'Oi, {nome}! Temos uma oferta especial para você hoje! 🛍️' },
];

const suppliers: Supplier[] = [
    { id: 'sup1', name: 'Fornecedor de Tecidos S.A.', document: '12.345.678/0001-99', email: 'contato@tecidos.com', phone: '(11) 2222-3333', payment_terms: '30D', lead_time_days: 15, rating: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'sup2', name: 'Zíperes & Cia', document: '98.765.432/0001-11', email: 'vendas@ziperes.com.br', phone: '(47) 3333-4444', payment_terms: '45D', lead_time_days: 10, rating: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const purchase_order_items: PurchaseOrderItem[] = [
    { id: 'poi1', po_id: 'pc1', material_id: 'bm1', material_name: 'Tecido Linho Bege', quantity: 50, received_quantity: 50, unit_price: 42.00, total: 2100.00 },
    { id: 'poi2', po_id: 'pc2', material_id: 'bm2', material_name: 'Zíper YKK Dourado', quantity: 200, received_quantity: 100, unit_price: 3.00, total: 600.00 },
    { id: 'poi3', po_id: 'pc2', material_id: 'bm3', material_name: 'Linha de Costura Branca', quantity: 10, received_quantity: 0, unit_price: 15.00, total: 150.00 },
    { id: 'poi4', po_id: 'pc3', material_id: 'bm1', material_name: 'Tecido Linho Bege', quantity: 20, received_quantity: 0, unit_price: 45.50, total: 910.00 },
];

const purchase_orders: PurchaseOrder[] = [
    { id: 'pc1', po_number: 'PC-2024-001', supplier_id: 'sup1', supplier: suppliers[0], status: 'received', items: [purchase_order_items[0]], total: 2100.00, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), issued_at: new Date(Date.now() - 9 * 86400000).toISOString(), received_at: new Date(Date.now() - 5 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 'pc2', po_number: 'PC-2024-002', supplier_id: 'sup2', supplier: suppliers[1], status: 'partial', items: [purchase_order_items[1], purchase_order_items[2]], total: 750.00, created_at: new Date(Date.now() - 5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(), issued_at: new Date(Date.now() - 5 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString() },
    { id: 'pc3', po_number: 'PC-2024-003', supplier_id: 'sup1', supplier: suppliers[0], status: 'issued', items: [purchase_order_items[3]], total: 910.00, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString(), issued_at: new Date(Date.now() - 2 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() + 13 * 86400000).toISOString() },
    { id: 'pc4', po_number: 'PC-2024-004', supplier_id: 'sup2', supplier: suppliers[1], status: 'draft', items: [], total: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];


// --- IN-MEMORY STORE ---
let collections: Record<string, any[]> = {
    customers: contacts,
    products,
    product_categories,
    orders,
    order_items,
    production_orders,
    tasks,
    task_statuses,
    inventory_balances,
    inventory_movements,
    fabric_colors,
    zipper_colors,
    bias_colors,
    config_fonts,
    config_basic_materials,
    system_settings,
    conversations,
    messages,
    logistics_waves,
    logistics_shipments,
    marketing_campaigns,
    marketing_segments,
    marketing_templates,
    suppliers,
    purchase_orders,
    purchase_order_items,
};
console.log('🧱 SANDBOX: In-memory database initialized with seed data.');


// --- GENERIC CRUD ---
const getCollection = <T>(path: string): T[] => collections[path] as T[] || [];
const get = <T>(path: string, id: string): T | null => collections[path]?.find(item => item.id === id) as T || null;
const create = <T extends {id?: string}>(path: string, data: Omit<T, 'id'>): T => {
    const newItem = { ...data, id: generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as unknown as T;
    collections[path] = [...(collections[path] || []), newItem];
    emit(path);
    return newItem;
};
const update = <T extends {id: string}>(path: string, id: string, data: Partial<T>): T => {
    let updatedItem: T | null = null;
    collections[path] = collections[path]?.map(item => {
        if (item.id === id) {
            updatedItem = { ...item, ...data, updated_at: new Date().toISOString() };
            return updatedItem;
        }
        return item;
    });
    emit(path);
    if (!updatedItem) throw new Error(`Item with id ${id} not found in ${path}`);
    return updatedItem;
};
const remove = (path: string, id: string): void => {
    collections[path] = collections[path]?.filter(item => item.id !== id);
    emit(path);
};


// --- SERVICE FACADE ---
// Mirrors the specific functions from supabaseService for compatibility
export const sandboxService = {
    getCollection: <T>(table: string) => Promise.resolve(getCollection<T>(table)),
    getDocument: <T>(table: string, id: string) => Promise.resolve(get<T>(table, id)),
    addDocument: <T extends {id?: string}>(table: string, data: Omit<T, 'id'>) => Promise.resolve(create<T>(table, data)),
    updateDocument: <T extends {id: string}>(table: string, id: string, data: Partial<T>) => Promise.resolve(update<T>(table, id, data)),
    deleteDocument: (table: string, id: string) => { remove(table, id); return Promise.resolve(); },

    listenToCollection: <T>(table: string, callback: (payload: T[]) => void) => subscribe(table, callback as (items: any[]) => void),
    listenToDocument: <T>(table: string, id: string, callback: (payload: T) => void) => {
        const handler = () => { get(table, id) && callback(get(table, id) as T); };
        eventBus.addEventListener(table, handler);
        handler(); // Initial call
        return { unsubscribe: () => eventBus.removeEventListener(table, handler) };
    },
    getSettings: async (): Promise<AppData> => Promise.resolve({
        catalogs: { paletas_cores: [], cores_texturas: { tecido: fabric_colors, ziper: zipper_colors, vies: bias_colors, forro: [], puxador: [], bordado: [], texturas: [] }, fontes_monogramas: config_fonts },
        materials: { grupos_suprimento: [], materiais_basicos: config_basic_materials },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: system_settings, midia: {}, orders, contacts, products, product_categories, production_orders, task_statuses, tasks, omnichannel: { conversations, messages, quotes: [] }, inventory_balances, inventory_movements, marketing_campaigns, marketing_segments, marketing_templates,
        suppliers, purchase_orders, purchase_order_items
    }),
    getOrders: () => Promise.resolve(orders),
    getOrder: (id: string) => Promise.resolve(get<Order>('orders', id)),
    addOrder: (orderData: Partial<Order>) => Promise.resolve(create<Order>('orders', orderData as any)),
    getProductionOrders: () => Promise.resolve(production_orders),
    getTasks: () => Promise.resolve(tasks),
    getTaskStatuses: () => Promise.resolve(task_statuses),
    getInventoryBalances: () => Promise.resolve(inventory_balances),
    getInventoryMovements: (materialId: string) => Promise.resolve(inventory_movements.filter(m => m.material_id === materialId)),
    getProducts: () => Promise.resolve(products),
    getProductCategories: () => Promise.resolve(product_categories),
    getContacts: () => Promise.resolve(contacts),
    getLogisticsData: async (): Promise<{ orders: Order[], waves: LogisticsWave[], shipments: LogisticsShipment[] }> => {
        return Promise.resolve({
            orders: getCollection<Order>('orders'),
            waves: getCollection<LogisticsWave>('logistics_waves'),
            shipments: getCollection<LogisticsShipment>('logistics_shipments'),
        });
    },
    getPurchasingData: async (): Promise<{ suppliers: Supplier[], purchase_orders: PurchaseOrder[], purchase_order_items: PurchaseOrderItem[] }> => {
        return Promise.resolve({
            suppliers: getCollection<Supplier>('suppliers'),
            purchase_orders: getCollection<PurchaseOrder>('purchase_orders'),
            purchase_order_items: getCollection<PurchaseOrderItem>('purchase_order_items'),
        });
    },
};
