import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    BasicMaterial, InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont
} from '../types';

// --- FAKE REALTIME EVENT BUS ---
const eventBus = new EventTarget();
const emit = (path: string) => {
    console.log(`📦 SANDBOX: Emitting update for path -> ${path}`);
    eventBus.dispatchEvent(new CustomEvent(path));
};
const subscribe = (path: string, handler: (items: any[]) => void) => {
    const callback = () => handler(collections[path] || []);
    eventBus.addEventListener(path, callback);
    return { unsubscribe: () => eventBus.removeEventListener(path, callback) };
};

// --- SEED DATA ---
const generateId = () => crypto.randomUUID();

const contacts: Contact[] = [
    // FIX: Added missing 'phones' property to match the Contact type.
    { id: 'c1', name: 'Ana Silva', document: '111.222.333-44', email: 'ana.silva@example.com', phone: '(11) 98765-4321', whatsapp: '5511987654321', instagram: '@anasilva', address: { city: 'São Paulo', state: 'SP', street: 'Rua das Flores, 123' }, phones: {} },
    { id: 'c2', name: 'Bruno Costa', document: '222.333.444-55', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', address: { city: 'Rio de Janeiro', state: 'RJ', street: 'Avenida Copacabana, 456' }, phones: {} },
    { id: 'c3', name: 'Carla Dias', document: '333.444.555-66', email: 'carla.dias@example.com', phone: '(31) 95555-8888', address: { city: 'Belo Horizonte', state: 'MG', street: 'Praça da Liberdade, 789' }, phones: {} },
];

const products: Product[] = [
    { id: 'p1', name: 'Bolsa Tote Clássica', base_sku: 'BT-CLA-01', base_price: 299.90, category: 'Bolsas', stock_quantity: 15, hasVariants: true, attributes: { fabricColor: ['fc1', 'fc2'], zipperColor: ['zc1'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', name: 'Nécessaire de Viagem', base_sku: 'NV-GRD-01', base_price: 129.90, category: 'Nécessaires', stock_quantity: 30, hasVariants: true, attributes: { embroidery: true, fabricColor: ['fc1', 'fc3'], zipperColor: ['zc1', 'zc2'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p3', name: 'Mochila Urbana', base_sku: 'MU-PRE-01', base_price: 450.00, category: 'Mochilas', stock_quantity: 8, hasVariants: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const order_items: OrderItem[] = [
    { id: 'oi1', order_id: 'o1', product_id: 'p1', product_name: 'Bolsa Tote Clássica', quantity: 1, unit_price: 299.90, total: 299.90, config_json: { fabricColor: 'Bege' } },
    { id: 'oi2', order_id: 'o2', product_id: 'p2', product_name: 'Nécessaire de Viagem', quantity: 2, unit_price: 129.90, total: 259.80, config_json: { embroidery: { enabled: true, text: 'CD', font: 'mf1' } } },
    { id: 'oi3', order_id: 'o2', product_id: 'p3', product_name: 'Mochila Urbana', quantity: 1, unit_price: 450.00, total: 450.00 },
];

const orders: Order[] = [
    // FIX: Renamed 'updatedAt' to 'updated_at' to match the Order type.
    { id: 'o1', number: 'OLIE-2024-1001', customer_id: 'c1', customers: contacts[0], status: 'in_production', items: [order_items[0]], subtotal: 299.90, discounts: 0, shipping_fee: 25.00, total: 324.90, created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'o2', number: 'OLIE-2024-1002', customer_id: 'c3', customers: contacts[2], status: 'paid', items: [order_items[1], order_items[2]], subtotal: 709.80, discounts: 10.00, shipping_fee: 0.00, total: 699.80, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString() },
];

const production_orders: ProductionOrder[] = [
    // FIX: Renamed 'updatedAt' to 'updated_at' to match the ProductionOrder type.
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
    { id: 'bm1', name: 'Tecido Linho Bege', codigo: 'TEC-LIN-BG', supply_group_id: 'sg1', unit: 'm', default_cost: 45.50 },
    { id: 'bm2', name: 'Zíper YKK Dourado', codigo: 'ZIP-YKK-DO', supply_group_id: 'sg2', unit: 'un', default_cost: 3.20 },
];

// --- IN-MEMORY STORE ---
let collections: Record<string, any[]> = {
    customers: contacts,
    products,
    orders,
    order_items,
    production_orders,
    fabric_colors,
    zipper_colors,
    bias_colors,
    config_fonts,
    config_basic_materials,
};
console.log('🧱 SANDBOX: In-memory database initialized with seed data.');


// --- GENERIC CRUD ---
// FIX: Renamed 'list' to 'getCollection' to match the expected service interface.
const getCollection = <T>(path: string): Promise<T[]> => Promise.resolve(collections[path] as T[] || []);
const get = <T>(path: string, id: string): Promise<T | null> => Promise.resolve(collections[path]?.find(item => item.id === id) as T || null);
// FIX: Renamed 'updatedAt' to 'updated_at' to match type definitions and resolve cast error.
const create = <T extends {id?: string}>(path: string, data: Omit<T, 'id'>): Promise<T> => {
    const newItem = { ...data, id: generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as T;
    collections[path] = [...(collections[path] || []), newItem];
    emit(path);
    return Promise.resolve(newItem);
};
// FIX: Renamed 'updatedAt' to 'updated_at' to match type definitions.
const update = <T extends {id: string}>(path: string, id: string, data: Partial<T>): Promise<T> => {
    let updatedItem: T | null = null;
    collections[path] = collections[path]?.map(item => {
        if (item.id === id) {
            updatedItem = { ...item, ...data, updated_at: new Date().toISOString() };
            return updatedItem;
        }
        return item;
    });
    emit(path);
    return Promise.resolve(updatedItem as T);
};

// --- SERVICE FACADE ---
// Mirrors the specific functions from supabaseService for compatibility
export const sandboxService = {
    // FIX: Correctly exposing the getCollection function.
    getCollection,
    listenToCollection: <T>(table: string, callback: (payload: T[]) => void) => subscribe(table, callback as (items: any[]) => void),
    listenToDocument: <T>(table: string, id: string, callback: (payload: T) => void) => {
        const handler = () => { get(table, id).then(doc => doc && callback(doc as T)); };
        eventBus.addEventListener(table, handler);
        return { unsubscribe: () => eventBus.removeEventListener(table, handler) };
    },
    getSettings: async (): Promise<AppData> => ({
        catalogs: { paletas_cores: [], cores_texturas: { tecido: fabric_colors, ziper: zipper_colors, vies: bias_colors, forro: [], puxador: [], bordado: [], texturas: [] }, fontes_monogramas: config_fonts },
        materials: { grupos_suprimento: [], materiais_basicos: config_basic_materials },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: [], midia: {}, orders: [], contacts: [], products: [], product_categories: [], production_orders: [], task_statuses: [], tasks: [], omnichannel: { conversations: [], messages: [], quotes: [] }, inventory_balances: [], inventory_movements: []
    }),
    getOrders: () => Promise.resolve(orders),
    getOrder: (id: string) => get<Order>('orders', id),
    addOrder: (orderData: Partial<Order>) => create<Order>('orders', orderData as any),
    getProductionOrders: () => Promise.resolve(production_orders),
    getTasks: () => Promise.resolve([] as Task[]),
    getTaskStatuses: () => Promise.resolve([] as TaskStatus[]),
    getInventoryBalances: () => Promise.resolve(config_basic_materials.map(m => ({ material_id: m.id, material: m, quantity_on_hand: 50, quantity_reserved: 10, low_stock_threshold: 15, last_updated_at: new Date().toISOString() })) as InventoryBalance[]),
    getInventoryMovements: (materialId: string) => Promise.resolve([] as InventoryMovement[]),
    getProducts: () => Promise.resolve(products),
    getProductCategories: () => Promise.resolve([] as ProductCategory[]),
    getContacts: () => Promise.resolve(contacts),
    updateDocument: update,
    addDocument: create,
};