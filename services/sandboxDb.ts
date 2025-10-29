import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    BasicMaterial, InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont, SystemSetting
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
    // FIX: Added missing properties (payments_history, timeline, notes_internal) to align with the Order type.
    { id: 'o1', number: 'OLIE-2024-1001', customer_id: 'c1', customers: contacts[0], status: 'in_production', items: [order_items[0]], payments_history: [], timeline: [], notes_internal: [], subtotal: 299.90, discounts: 0, shipping_fee: 25.00, total: 324.90, created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    // FIX: Added missing properties (payments_history, timeline, notes_internal) to align with the Order type.
    { id: 'o2', number: 'OLIE-2024-1002', customer_id: 'c3', customers: contacts[2], status: 'paid', items: [order_items[1], order_items[2]], payments_history: [], timeline: [], notes_internal: [], subtotal: 709.80, discounts: 10.00, shipping_fee: 0.00, total: 699.80, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    // FIX: Added missing properties (payments_history, timeline, notes_internal) to align with the Order type.
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
// FIX: Added the required `is_active` property to the mock materials data.
const config_basic_materials: BasicMaterial[] = [
    { id: 'bm1', name: 'Tecido Linho Bege', codigo: 'TEC-LIN-BG', supply_group_id: 'sg1', unit: 'm', default_cost: 45.50, is_active: true },
    { id: 'bm2', name: 'Zíper YKK Dourado', codigo: 'ZIP-YKK-DO', supply_group_id: 'sg2', unit: 'un', default_cost: 3.20, is_active: true },
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
    // FIX: Renamed 'name' property to 'key' to match the SystemSetting type.
    { id: 'ss1', key: 'Parâmetros de Frete', value: JSON.stringify({ radius_km: 10, base_fee: 15, fee_per_km: 2.5, free_shipping_threshold: 250 }), category: 'logistica', description: 'Configurações para cálculo de frete via motoboy.' },
];
const product_categories: ProductCategory[] = [
    { id: 'pc1', name: 'Bolsas', description: 'Bolsas de diversos tamanhos e modelos.' },
    { id: 'pc2', name: 'Nécessaires', description: 'Nécessaires para organização e viagem.' },
];
const conversations: Conversation[] = [];
const messages: Message[] = [];

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
};
console.log('🧱 SANDBOX: In-memory database initialized with seed data.');


// --- GENERIC CRUD ---
const getCollection = <T>(path: string): T[] => collections[path] as T[] || [];
const get = <T>(path: string, id: string): T | null => collections[path]?.find(item => item.id === id) as T || null;
const create = <T extends {id?: string}>(path: string, data: Omit<T, 'id'>): T => {
    // FIX: Changed unsafe type assertion 'as T' to 'as unknown as T' to satisfy the compiler.
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
        sistema: system_settings, midia: {}, orders, contacts, products, product_categories, production_orders, task_statuses, tasks, omnichannel: { conversations, messages, quotes: [] }, inventory_balances, inventory_movements
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
};