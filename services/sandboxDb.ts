import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont, SystemSetting, LogisticsWave, LogisticsShipment,
    MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem,
    OrderPayment, OrderTimelineEvent, OrderNote, AnalyticsKPI, ExecutiveKPI, AIInsight, OrderStatus, AnySettingsItem, SettingsCategory, FinanceAccount, FinanceCategory, FinancePayable, FinanceReceivable, FinanceTransaction, SystemSettingsLog, Integration, IntegrationLog, MediaAsset,
    MaterialGroup, Material, InitializerLog, InitializerSyncState, InitializerAgent, ColorPalette, LiningColor, PullerColor, EmbroideryColor, FabricTexture,
    WorkflowRule, Notification, Warehouse, ProductionTask, ProductionQualityCheck, MarketingSegmentRule
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

// FIX: Added warehouse seed data.
const warehouses: Warehouse[] = [
    { id: 'w1', name: 'Armazém Principal', location: 'Bloco A' },
    { id: 'w2', name: 'Armazém Secundário', location: 'Bloco C' },
];

const contacts: Contact[] = [
    { id: 'c1', name: 'Ana Silva', document: '111.222.333-44', email: 'ana.silva@example.com', phone: '(11) 98765-4321', whatsapp: '5511987654321', instagram: '@anasilva', address: { city: 'São Paulo', state: 'SP', street: 'Rua das Flores, 123' }, phones: {}, stage: 'Cliente Ativo', tags: ['VIP', 'Bolsas'], created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'c2', name: 'Bruno Costa', document: '222.333.444-55', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', address: { city: 'Rio de Janeiro', state: 'RJ', street: 'Avenida Copacabana, 456' }, phones: {}, stage: 'Lead', tags: ['Instagram'], created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'c3', name: 'Carla Dias', document: '333.444.555-66', email: 'carla.dias@example.com', phone: '(31) 95555-8888', address: { city: 'Belo Horizonte', state: 'MG', street: 'Praça da Liberdade, 789' }, phones: {}, stage: 'Cliente Ativo', tags: ['Nécessaires'], created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'c4', name: 'Fornecedor Têxtil Ltda', document: '12.345.678/0001-99', email: 'contato@textil.com', phone: '(19) 3322-1144', address: { city: 'Americana', state: 'SP' }, phones: {}, stage: 'Fornecedor', tags: ['Linho'], created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'c5', name: 'Mariana Lima', document: '', email: 'mari.lima@email.com', phone: '(11) 99887-7665', address: { city: 'São Paulo', state: 'SP' }, phones: {}, stage: 'Contato Geral', tags: ['Parceria'], created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'c6', name: 'Jorge Mendes', document: '444.555.666-77', email: 'jorge.m@example.com', phone: '(11) 98888-9999', address: { city: 'São Paulo', state: 'SP' }, phones: {}, stage: 'Inativo', tags: [], created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
];

const product_categories: ProductCategory[] = [
    { id: 'pc1', name: 'Bolsas', description: 'Bolsas de diversos tamanhos e modelos.' },
    { id: 'pc2', name: 'Nécessaires', description: 'Nécessaires para organização e viagem.' },
    { id: 'pc3', name: 'Mochilas', description: 'Mochilas para uso urbano e viagens.' },
];

const products: Product[] = [
    { id: 'p1', name: 'Bolsa Tote Clássica', base_sku: 'BT-CLA-01', base_price: 299.90, category: 'Bolsas', stock_quantity: 15, hasVariants: true, status: 'Ativo', attributes: { fabricColor: ['fc1', 'fc2'], zipperColor: ['zc1'], biasColor: ['bc1'] }, images:[], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date().toISOString(), bom: [{ material_id: 'mat1', quantity_per_unit: 1.5 }, { material_id: 'mat2', quantity_per_unit: 1 }] },
    { id: 'p2', name: 'Nécessaire de Viagem', base_sku: 'NV-GRD-01', base_price: 129.90, category: 'Nécessaires', stock_quantity: 30, hasVariants: true, status: 'Ativo', attributes: { embroidery: true, fabricColor: ['fc1', 'fc3'], zipperColor: ['zc1', 'zc2'] }, images:[], createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date().toISOString(), bom: [{ material_id: 'mat1', quantity_per_unit: 0.5 }, { material_id: 'mat2', quantity_per_unit: 1 }, { material_id: 'mat3', quantity_per_unit: 5 }] },
    { id: 'p3', name: 'Mochila Urbana', base_sku: 'MU-PRE-01', base_price: 450.00, category: 'Mochilas', stock_quantity: 8, hasVariants: false, status: 'Rascunho', attributes: {}, images:[], createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString(), bom: [] },
    { id: 'p4', name: 'Estojo Lápis (Modelo Antigo)', base_sku: 'EL-OLD-01', base_price: 79.90, category: 'Nécessaires', stock_quantity: 0, hasVariants: false, status: 'Arquivado', attributes: {}, images:[], createdAt: new Date(Date.now() - 100 * 86400000).toISOString(), updatedAt: new Date().toISOString(), bom: [] },
];

const order_items: OrderItem[] = [
    { id: 'oi1', order_id: 'o1', product_id: 'p1', product_name: 'Bolsa Tote Clássica', quantity: 1, unit_price: 299.90, total: 299.90, config_json: { fabricColor: 'Bege' } },
    { id: 'oi2', order_id: 'o2', product_id: 'p2', product_name: 'Nécessaire de Viagem', quantity: 2, unit_price: 129.90, total: 259.80, config_json: { embroidery: { enabled: true, text: 'CD', font: 'mf1' } } },
    { id: 'oi3', order_id: 'o2', product_id: 'p3', product_name: 'Mochila Urbana', quantity: 1, unit_price: 450.00, total: 450.00 },
];

const orders: Omit<Order, 'items' | 'customers'>[] = [
    { id: 'o1', number: 'OLIE-2024-1001', customer_id: 'c1', status: 'in_production', payments_history: [], timeline: [], notes_internal: [], subtotal: 299.90, discounts: 0, shipping_fee: 25.00, total: 324.90, created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'o2', number: 'OLIE-2024-1002', customer_id: 'c3', status: 'paid', payments_history: [], timeline: [], notes_internal: [], subtotal: 709.80, discounts: 10.00, shipping_fee: 0.00, total: 699.80, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'o3', number: 'OLIE-2024-1003', customer_id: 'c2', status: 'pending_payment', payments_history: [], timeline: [], notes_internal: [], subtotal: 129.90, discounts: 0, shipping_fee: 15.00, total: 144.90, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];


const production_orders: ProductionOrder[] = [
    { id: 'po1', po_number: 'OP-2024-001', product_id: 'p1', product: products[0], quantity: 5, status: 'em_andamento', priority: 'alta', due_date: new Date(Date.now() + 5 * 86400000).toISOString(), steps_completed: 2, steps_total: 5, created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'po2', po_number: 'OP-2024-002', product_id: 'p2', product: products[1], quantity: 10, status: 'planejado', priority: 'normal', due_date: new Date(Date.now() + 10 * 86400000).toISOString(), steps_completed: 0, steps_total: 4, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date().toISOString() },
    { id: 'po3', po_number: 'OP-2024-003', product_id: 'p3', product: products[2], quantity: 2, status: 'em_andamento', priority: 'urgente', due_date: new Date(Date.now() + 2 * 86400000).toISOString(), steps_completed: 1, steps_total: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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
const config_supply_groups: MaterialGroup[] = [
    { id: 'sg1', name: 'Tecidos', description: 'Tecidos principais para bolsas e nécessaires.', is_active: true, created_at: new Date().toISOString() },
    { id: 'sg2', name: 'Fechamentos', description: 'Zíperes, botões, etc.', is_active: true, created_at: new Date().toISOString() },
    { id: 'sg3', name: 'Aviamentos', description: 'Linhas, agulhas, etc.', is_active: true, created_at: new Date().toISOString() },
];
const config_materials: Material[] = [
    { id: 'mat1', name: 'Linho Bege Cru', sku: 'TEC-LNH-BG-01', group_id: 'sg1', unit: 'm', is_active: true, created_at: new Date().toISOString(), url_public: 'https://images.unsplash.com/photo-1624833914853-33e4f7a7587a?q=80&w=2070&auto=format&fit=crop' },
    { id: 'mat2', name: 'Zíper YKK #5 Dourado', sku: 'ZIP-YKK-5-DO', group_id: 'sg2', unit: 'un', is_active: true, created_at: new Date().toISOString(), url_public: 'https://images.unsplash.com/photo-1588185969094-1525a435d1d3?q=80&w=2070&auto=format&fit=crop' },
    { id: 'mat3', name: 'Linha de Costura Branca', sku: 'LIN-COS-BR-01', group_id: 'sg3', unit: 'm', is_active: true, created_at: new Date().toISOString(), url_public: 'https://images.unsplash.com/photo-1599837563122-6b60012bd2b6?q=80&w=1974&auto=format&fit=crop' },
];

const task_statuses: TaskStatus[] = [
    {id: 'ts1', name: 'Corte', color: 'orange', position: 1},
    {id: 'ts2', name: 'Costura', color: 'sky', position: 2},
    {id: 'ts4', name: 'Em Espera', color: 'purple', position: 3},
    {id: 'ts3', name: 'Acabamento', color: 'green', position: 4},
];
const tasks: Task[] = [
    {id: 't1', title: 'OP-2024-001 - Bolsa Tote', status_id: 'ts1', client_name: 'Ana Silva', quantity: 5, position: 1, priority: 'alta'},
    {id: 't2', title: 'OP-2024-002 - Nécessaire', status_id: 'ts2', client_name: 'Carla Dias', quantity: 10, position: 1, priority: 'normal'},
    {id: 't3', title: 'OP-2024-003 - Mochila Urbana', status_id: 'ts2', client_name: 'Bruno Costa', quantity: 2, position: 2, priority: 'urgente'},
];

const production_tasks: ProductionTask[] = [
    { id: 'pt1', production_order_id: 'po1', name: 'Corte do Tecido', status: 'Concluída', started_at: new Date(Date.now() - 2 * 86400000).toISOString(), finished_at: new Date(Date.now() - 2 * 86400000 + 4 * 3600000).toISOString() },
    { id: 'pt2', production_order_id: 'po1', name: 'Costura da Bolsa', status: 'Em Andamento', started_at: new Date(Date.now() - 1 * 86400000).toISOString(), finished_at: null },
    { id: 'pt3', production_order_id: 'po2', name: 'Corte (Nécessaire)', status: 'Pendente', started_at: null, finished_at: null },
    { id: 'pt6', production_order_id: 'po2', name: 'Costura (Nécessaire)', status: 'Pendente', started_at: null, finished_at: null },
    { id: 'pt7', production_order_id: 'po2', name: 'Acabamento (Nécessaire)', status: 'Pendente', started_at: null, finished_at: null },
    { id: 'pt4', production_order_id: 'po3', name: 'Corte do Tecido', status: 'Concluída', started_at: new Date(Date.now() - 1 * 86400000).toISOString(), finished_at: new Date(Date.now() - 1 * 86400000 + 2 * 3600000).toISOString() },
    { id: 'pt5', production_order_id: 'po3', name: 'Costura da Mochila', status: 'Em Andamento', started_at: new Date().toISOString(), finished_at: null },
];

// FIX: Added warehouse_id and warehouse properties to satisfy the InventoryBalance type.
const inventory_balances: InventoryBalance[] = config_materials.map((m, i) => ({
    id: `inv_bal_${i + 1}`,
    material_id: m.id,
    material: m,
    warehouse_id: 'w1',
    warehouse: warehouses[0],
    current_stock: 50 + i * 10,
    reserved_stock: 10,
    location: `A${i+1}-S${i+1}`,
    updated_at: new Date().toISOString()
}));
const inventory_movements: InventoryMovement[] = [
    { id: 'im1', material_id: 'mat1', type: 'in', quantity: 100, reason: 'RECEBIMENTO_PO', notes: 'PO-2024-001', warehouse_id: 'w1', created_at: new Date().toISOString() },
    { id: 'im2', material_id: 'mat1', type: 'out', quantity: -20, reason: 'CONSUMO_PRODUCAO', notes: 'OP-2024-001', warehouse_id: 'w1', created_at: new Date().toISOString() }
];

const system_settings: SystemSetting[] = [
    { id: 'ss1', key: 'freight_params', value: JSON.stringify({ radius_km: 10, base_fee: 15, fee_per_km: 2.5, free_shipping_threshold: 250 }), category: 'logistica', description: 'Configurações para cálculo de frete via motoboy.' },
];

const conversations: Conversation[] = [
    { id: 'conv1', customerId: 'c1', customerName: 'Ana Silva', customerHandle: '5511987654321', channel: 'whatsapp', status: 'open', assigneeId: 'sandbox-user-01', priority: 'high', tags: ['novo_lead', 'vip'], unreadCount: 1, lastMessageAt: new Date(Date.now() - 60000 * 5).toISOString(), title: 'Preciso de ajuda com um pedido novo', quoteId: undefined },
    { id: 'conv2', customerId: 'c2', customerName: 'Bruno Costa', customerHandle: '@brunocosta', channel: 'instagram', status: 'open', assigneeId: undefined, priority: 'normal', tags: ['suporte'], unreadCount: 0, lastMessageAt: new Date(Date.now() - 86400000).toISOString(), title: 'Onde está meu pedido?', quoteId: undefined },
    { id: 'conv3', customerId: 'c3', customerName: 'Carla Dias', customerHandle: 'carla.dias@example.com', channel: 'site', status: 'closed', assigneeId: 'sandbox-user-01', priority: 'low', tags: [], unreadCount: 0, lastMessageAt: new Date(Date.now() - 2 * 86400000).toISOString(), title: 'Agradecimento', quoteId: undefined },
];
const messages: Message[] = [
    { id: 'msg1', conversationId: 'conv1', direction: 'in', content: 'Olá! Gostaria de fazer uma encomenda personalizada, é possível?', authorName: 'Ana Silva', createdAt: new Date(Date.now() - 60000 * 6).toISOString(), status: 'read' },
    { id: 'msg2', conversationId: 'conv1', direction: 'out', content: 'Olá Ana, claro! O que você tem em mente?', authorName: 'Admin', createdAt: new Date(Date.now() - 60000 * 5).toISOString(), status: 'delivered' },
    { id: 'msg3', conversationId: 'conv2', direction: 'in', content: 'Oi, meu pedido OLIE-2024-1003 ainda não chegou. Podem verificar?', authorName: 'Bruno Costa', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'read' },
    { id: 'msg4', conversationId: 'conv2', direction: 'note', content: 'Verificar com a logística, pedido parece estar em separação.', authorName: 'Admin', createdAt: new Date(Date.now() - 86400000 + 60000).toISOString(), status: 'sent' },
    { id: 'msg5', conversationId: 'conv3', direction: 'in', content: 'Recebi minha bolsa, é linda! Obrigada!', authorName: 'Carla Dias', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'read' },
    { id: 'msg6', conversationId: 'conv3', direction: 'out', content: 'Ficamos felizes que gostou, Carla! Aproveite muito. ❤️', authorName: 'Admin', createdAt: new Date(Date.now() - 2 * 86400000 + 60000).toISOString(), status: 'read' },
];

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

// Fix: Replaced `rule_count` with `rules` array to match the `MarketingSegment` type.
const marketing_segments: MarketingSegment[] = [
    { id: 'ms1', name: 'Clientes VIP', description: 'Clientes com mais de 5 compras.', rules: [{ id: 'ms1-r1', field: 'order_count', operator: 'greater_than', value: 5 }, { id: 'ms1-r2', field: 'total_spent', operator: 'greater_than', value: 1500 }], audience_size: 42 },
    { id: 'ms2', name: 'Inativos (6 meses)', description: 'Clientes que não compram há 6 meses.', rules: [{ id: 'ms2-r1', field: 'last_purchase_days', operator: 'greater_than', value: 180 }], audience_size: 215 },
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
    { id: 'poi1', po_id: 'pc1', material_id: 'mat1', material_name: 'Linho Bege Cru', quantity: 50, received_quantity: 50, unit_price: 42.00, total: 2100.00 },
    { id: 'poi2', po_id: 'pc2', material_id: 'mat2', material_name: 'Zíper YKK #5 Dourado', quantity: 200, received_quantity: 100, unit_price: 3.00, total: 600.00 },
    { id: 'poi3', po_id: 'pc2', material_id: 'mat3', material_name: 'Linha de Costura Branca', quantity: 10, received_quantity: 0, unit_price: 15.00, total: 150.00 },
    { id: 'poi4', po_id: 'pc3', material_id: 'mat1', material_name: 'Linho Bege Cru', quantity: 20, received_quantity: 0, unit_price: 45.50, total: 910.00 },
];

const purchase_orders: PurchaseOrder[] = [
    { id: 'pc1', po_number: 'PC-2024-001', supplier_id: 'sup1', supplier: suppliers[0], status: 'received', items: [purchase_order_items[0]], total: 2100.00, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), issued_at: new Date(Date.now() - 9 * 86400000).toISOString(), received_at: new Date(Date.now() - 5 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 'pc2', po_number: 'PC-2024-002', supplier_id: 'sup2', supplier: suppliers[1], status: 'partial', items: [purchase_order_items[1], purchase_order_items[2]], total: 750.00, created_at: new Date(Date.now() - 5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(), issued_at: new Date(Date.now() - 5 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString() },
    { id: 'pc3', po_number: 'PC-2024-003', supplier_id: 'sup1', supplier: suppliers[0], status: 'issued', items: [purchase_order_items[3]], total: 910.00, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString(), issued_at: new Date(Date.now() - 2 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() + 13 * 86400000).toISOString() },
    { id: 'pc4', po_number: 'PC-2024-004', supplier_id: 'sup2', supplier: suppliers[1], status: 'draft', items: [], total: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const analytics_kpis: AnalyticsKPI[] = [
    { id: 'kpi1', module: 'orders', name: 'Total de Pedidos', value: orders.length, trend: 0.1, unit: '', description: 'Número total de pedidos no período.' },
    { id: 'kpi2', module: 'orders', name: 'Faturamento Total', value: orders.reduce((s, o) => s + o.total, 0), trend: 0.15, unit: 'R$', description: 'Receita total gerada pelos pedidos.' },
    { id: 'kpi3', module: 'orders', name: 'Ticket Médio', value: orders.length > 0 ? (orders.reduce((s, o) => s + o.total, 0) / orders.length) : 0, trend: -0.05, unit: 'R$', description: 'Valor médio por pedido.' },
    { id: 'kpi4', module: 'production', name: 'Eficiência da Produção', value: 87, trend: 0.02, unit: '%', description: 'Percentual de eficiência das ordens de produção.' },
    { id: 'kpi5', module: 'inventory', name: 'Giro de Estoque', value: 4.2, trend: 0.1, unit: 'x', description: 'Quantas vezes o estoque foi renovado no período.' },
    { id: 'kpi6', module: 'logistics', name: 'Entregas no Prazo (OTIF)', value: 96, trend: -0.01, unit: '%', description: 'Percentual de pedidos entregues dentro do prazo prometido.' },
    { id: 'kpi7', module: 'marketing', name: 'ROI de Campanhas', value: 250, trend: 0.2, unit: '%', description: 'Retorno sobre o investimento das campanhas de marketing ativas.' },
    { id: 'kpi8', module: 'financial', name: 'Lucro Líquido (Simulado)', value: 12540.50, trend: 0.08, unit: 'R$', description: 'Lucro líquido estimado para o período.' },
];

const executive_kpis: ExecutiveKPI[] = [
    { id: 'ekpi1', module: 'sales', name: 'Faturamento Total', value: 1250000, trend: 0.12, unit: 'R$', period: 'Q4 2024', description: 'Soma de vendas do período.' },
    { id: 'ekpi2', module: 'financial', name: 'Lucro Líquido', value: 375000, trend: 0.08, unit: 'R$', period: 'Q4 2024', description: 'Receita - Despesas.' },
    { id: 'ekpi3', module: 'production', name: 'Eficiência Produtiva', value: 92, trend: -0.03, unit: '%', period: 'Q4 2024', description: '% de tarefas concluídas no prazo.' },
    { id: 'ekpi4', module: 'logistics', name: 'OTIF (On Time In Full)', value: 96, trend: 0.01, unit: '%', period: 'Q4 2024', description: '% de entregas dentro do SLA.' },
    { id: 'ekpi5', module: 'purchasing', name: 'Custo Matéria-Prima', value: 450000, trend: 0.05, unit: 'R$', period: 'Q4 2024', description: 'Total de POs recebidas.' }
];

const executive_ai_insights: AIInsight[] = [
    { id: 'ai1', module: 'production', type: 'risk', insight: 'A eficiência produtiva caiu 3% neste trimestre. Investigar possíveis gargalos na etapa de costura, que apresentou maior número de atrasos.', period: 'Q4 2024', generated_at: new Date().toISOString() },
    { id: 'ai2', module: 'sales', type: 'positive', insight: 'O faturamento cresceu 12%, superando a meta. A campanha de "Inverno 2024" foi a principal impulsionadora, representando 40% das vendas.', period: 'Q4 2024', generated_at: new Date().toISOString() },
    { id: 'ai3', module: 'logistics', type: 'opportunity', insight: 'O custo médio de frete se manteve estável. Avaliar a renegociação com transportadoras para otimizar custos em rotas de maior volume pode gerar economia de até 5%.', period: 'Q4 2024', generated_at: new Date().toISOString() }
];

const finance_accounts: FinanceAccount[] = [
    { id: 'fa1', name: 'Conta Corrente Bradesco', type: 'checking', institution: 'Bradesco', balance: 15000.75, currency: 'BRL', is_active: true },
    { id: 'fa2', name: 'Cartão de Crédito NuBank', type: 'credit_card', institution: 'NuBank', balance: -2500.00, currency: 'BRL', is_active: true },
    { id: 'fa3', name: 'Caixa da Loja', type: 'cash', institution: 'Olie', balance: 575.50, currency: 'BRL', is_active: true },
];
const finance_categories: FinanceCategory[] = [
    { id: 'fc1', name: 'Receita de Vendas', type: 'income' },
    { id: 'fc2', name: 'Custo de Material', type: 'expense' },
    { id: 'fc3', name: 'Marketing', type: 'expense' },
    { id: 'fc4', name: 'Salários', type: 'expense' },
    { id: 'fc5', name: 'Outras Receitas', type: 'income'},
    { id: 'fc6', name: 'Despesas Gerais', type: 'expense' },
];
const finance_transactions: FinanceTransaction[] = [
    { id: 'ft1', account_id: 'fa1', category_id: 'fc1', description: 'Recebimento Pedido OLIE-2024-1002', amount: 699.80, type: 'income', transaction_date: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'cleared', created_at: new Date().toISOString() },
    { id: 'ft2', account_id: 'fa2', category_id: 'fc2', description: 'Compra de Tecidos - Fornecedor S.A.', amount: -2100.00, type: 'expense', transaction_date: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'cleared', created_at: new Date().toISOString() },
    { id: 'ft3', account_id: 'fa1', category_id: 'fc3', description: 'Impulsionamento Instagram - Campanha Inverno', amount: -500.00, type: 'expense', transaction_date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'cleared', created_at: new Date().toISOString() },
    { id: 'ft4', account_id: 'fa3', category_id: 'fc6', description: 'Pagamento de conta de luz', amount: -150.00, type: 'expense', transaction_date: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'cleared', created_at: new Date().toISOString() },
];
const finance_payables: FinancePayable[] = [
    { id: 'fp1', due_date: new Date(Date.now() + 15 * 86400000).toISOString(), amount: 750.00, supplier_id: 'sup2', purchase_order_id: 'pc2', status: 'pending' }
];
const finance_receivables: FinanceReceivable[] = [
    { id: 'fr1', due_date: new Date(Date.now() - 1 * 86400000).toISOString(), amount: 144.90, customer_id: 'c2', order_id: 'o3', status: 'pending' },
    { id: 'fr2', due_date: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 699.80, customer_id: 'c3', order_id: 'o2', status: 'paid' },
];


const config_integrations: Integration[] = [
    { id: 'int1', name: 'Bling ERP', type: 'ERP', endpoint_url: 'https://api.bling.com.br/v3', status: 'disconnected', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'int2', name: 'Nuvemshop', type: 'Ecommerce', endpoint_url: 'https://api.nuvemshop.com.br', status: 'connected', last_sync: new Date(Date.now() - 3600 * 1000).toISOString(), is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'int3', name: 'Melhor Envio', type: 'Transport', endpoint_url: 'https://api.melhorenvio.com.br', status: 'error', last_error: 'Authentication failed (401)', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'int4', name: 'Twilio (WhatsApp)', type: 'Messaging', endpoint_url: 'https://api.twilio.com', status: 'disconnected', is_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const integration_logs: IntegrationLog[] = [
    { id: 'log1', integration_id: 'int2', event: 'Connected', message: 'Sync successful', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
    { id: 'log2', integration_id: 'int3', event: 'Error', message: 'Authentication failed (401)', created_at: new Date(Date.now() - 1800 * 1000).toISOString() },
];

const media_assets: MediaAsset[] = [];

const initializer_agents: InitializerAgent[] = [
    { id: 'agent1', name: 'ArquitetoSupremo', role: 'Coordenação Global', status: 'idle', last_heartbeat: new Date().toISOString(), health_score: 1.0, logs: ['[21:12:01] Auditoria concluída. Causa raiz: falha de comunicação GCD ↔ PromptArchitectAI.'] },
    { id: 'agent2', name: 'AtlasAI', role: 'Roteamento de Tarefas', status: 'idle', last_heartbeat: new Date().toISOString(), health_score: 1.0, logs: ['[21:11:58] Rota identificada: SYSTEM_AUDIT_START → ...'] },
    { id: 'agent3', name: 'CatalisadorAI', role: 'Estruturação de Projetos', status: 'idle', last_heartbeat: new Date().toISOString(), health_score: 1.0, logs: ['[21:10:30] Blueprint para módulo "Marketing" gerado.'] },
    { id: 'agent4', name: 'WebAppDevAI', role: 'Desenvolvimento Frontend', status: 'working', last_heartbeat: new Date().toISOString(), health_score: 1.0, logs: ['[21:13:05] Criando componente RenderCanvas.tsx...'] },
    { id: 'agent5', name: 'EngenheiroDeDados', role: 'Gestão de Schema e Dados', status: 'idle', last_heartbeat: new Date().toISOString(), health_score: 1.0, logs: ['[21:12:00] Validação RLS e roles Supabase OK.'] },
    { id: 'agent6', name: 'AuditorDeSistema', role: 'Auditoria e Validação', status: 'error', last_heartbeat: new Date().toISOString(), health_score: 0.85, logs: ['[21:11:59] ERRO: Timeout ao validar endpoint /api/health.'] },
];

const initializer_logs: InitializerLog[] = [];
const initializer_sync_state: InitializerSyncState[] = [];

// New seed data for Catalogs
const config_color_palettes: ColorPalette[] = [
    { id: 'pal1', name: 'Cores de Verão 2024', descricao: 'Paleta vibrante para a coleção de verão.', is_active: true },
    { id: 'pal2', name: 'Tons Neutros', descricao: 'Cores clássicas e atemporais.', is_active: true },
];
const lining_colors: LiningColor[] = [
    { id: 'lc1', name: 'Forro Bege', hex: '#EAE0D5', palette_id: 'pal2', is_active: true },
    { id: 'lc2', name: 'Forro Preto', hex: '#2C2C2C', palette_id: 'pal2', is_active: true },
];
const puller_colors: PullerColor[] = [
    { id: 'pc1', name: 'Puxador Dourado', hex: '#FFD700', palette_id: 'pal1', is_active: true },
    { id: 'pc2', name: 'Puxador Níquel', hex: '#C0C0C0', palette_id: 'pal2', is_active: true },
];
const embroidery_colors: EmbroideryColor[] = [
    { id: 'ec1', name: 'Linha Ouro', hex: '#CFB53B', palette_id: 'pal1', thread_type: 'metallic', is_active: true },
    { id: 'ec2', name: 'Linha Branca', hex: '#FFFFFF', palette_id: 'pal2', thread_type: 'cotton', is_active: true },
];
const fabric_textures: FabricTexture[] = [
    { id: 'ft1', name: 'Linho Rústico', description: 'Textura natural do linho.', image_url: 'https://images.unsplash.com/photo-1562094254-105a5c68911a?q=80&w=2080&auto=format&fit=crop', is_active: true, hex_code: '#D2B48C', fabric_color_id: 'fc1', supplier_sku: 'FORN-LNH-01', manufacturer_sku: 'MAN-LNH-BG-RUST', manufacturer_id: 'sup1', distributor_id: 'sup1' },
    { id: 'ft2', name: 'Couro Sintético Preto', description: 'Textura que imita couro.', image_url: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=1974&auto=format&fit=crop', is_active: true, hex_code: '#333333', supplier_sku: 'FORN-COU-02', manufacturer_sku: 'MAN-SYN-LTHR-BRW', manufacturer_id: 'sup2', distributor_id: 'sup1' },
];

const workflow_rules: WorkflowRule[] = [
    { id: 'wf1', name: 'Gerar OP em Pedido Pago', trigger: 'orders.status -> paid', action: 'create_production_order()', is_active: true, description: 'Cria uma ordem de produção automaticamente quando um pedido é confirmado como pago.' },
    { id: 'wf2', name: 'Notificar Expedição', trigger: 'production_orders.status -> finalizado', action: 'create_logistics_shipment()', is_active: true, description: 'Cria um registro de expedição quando a produção de um item é finalizada.' },
    { id: 'wf3', name: 'Alerta de Estoque Baixo', trigger: 'inventory_balances.available < 10', action: 'create_notification()', is_active: false, description: 'Envia uma notificação quando o estoque disponível de um material fica abaixo de 10 unidades.' },
];

const notifications: Notification[] = [
    { id: 'n1', user_id: 'sandbox-user-01', type: 'order_created', title: 'Novo Pedido Recebido', message: 'Pedido #OLIE-2024-1003 foi criado.', link: '/orders', is_read: false, created_at: new Date().toISOString() },
    { id: 'n2', user_id: 'sandbox-user-01', type: 'system_alert', title: 'Integração com Erro', message: 'A integração com Melhor Envio está apresentando erros.', link: '/settings', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n3', user_id: 'sandbox-user-01', type: 'stock_low', title: 'Estoque Baixo', message: 'O material "Linho Bege Cru" está com apenas 5m disponíveis.', link: '/inventory', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
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
    config_supply_groups,
    config_materials,
    system_settings,
    system_settings_logs: [],
    config_integrations,
    integration_logs,
    media_assets,
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
    analytics_kpis,
    executive_kpis,
    executive_ai_insights,
    finance_accounts,
    finance_categories,
    finance_transactions,
    finance_payables,
    finance_receivables,
    initializer_logs,
    initializer_sync_state,
    initializer_agents,
    // New Catalog Collections
    config_color_palettes,
    lining_colors,
    puller_colors,
    embroidery_colors,
    fabric_textures,
    // New Modules
    workflow_rules,
    notifications,
    warehouses,
    production_tasks,
    production_quality_checks: [],
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
    const originalItem = get(path, id);

    collections[path] = collections[path]?.map(item => {
        if (item.id === id) {
            updatedItem = { ...item, ...data, updated_at: new Date().toISOString() };
            return updatedItem;
        }
        return item;
    });

    // --- TRIGGER SIMULATIONS ---
    if (path === 'orders' && (data as Partial<Order>).status === 'paid' && (originalItem as Order)?.status !== 'paid') {
        const fullOrder = get('orders', id) as Order;
        const fullItems = getCollection<OrderItem>('order_items').filter(i => i.order_id === id);
        fullOrder.items = fullItems;
        createProductionOrderFromOrder(fullOrder);
    }

    emit(path);
    if (!updatedItem) throw new Error(`Item with id ${id} not found in ${path}`);
    return updatedItem;
};
const del = (path: string, id: string): void => {
    const initialLength = collections[path]?.length || 0;
    collections[path] = collections[path]?.filter(item => item.id !== id);
    if ((collections[path]?.length || 0) < initialLength) {
        emit(path);
    }
};

const createProductionOrderFromOrder = (order: Order) => {
    console.log(`🧱 SANDBOX TRIGGER: Creating POs for paid order ${order.number}`);
    order.items.forEach((item, index) => {
        const poNumber = `OP-${order.number.split('-')[2]}-${index + 1}`;
        const product = get<Product>('products', item.product_id);
        const customer = get<Contact>('customers', order.customer_id);

        const newPO = create<ProductionOrder>('production_orders', {
            po_number: poNumber,
            product_id: item.product_id,
            product: product || undefined,
            quantity: item.quantity,
            status: 'novo',
            priority: 'normal',
            due_date: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
            steps_completed: 0,
            steps_total: 3, // Default steps
        } as any);

        // Create initial task for the kanban
        const firstStatus = getCollection<TaskStatus>('task_statuses').sort((a,b) => a.position - b.position)[0];
        if (firstStatus) {
            create<Task>('tasks', {
                title: `${poNumber} - ${product?.name}`,
                status_id: firstStatus.id,
                client_name: customer?.name || 'N/A',
                quantity: item.quantity,
                position: getCollection<Task>('tasks').filter(t => t.status_id === firstStatus.id).length,
                priority: 'normal',
            } as any);
        }
    });
};


const testConnection = async (integrationId: string): Promise<void> => {
    const integration = get<Integration>('config_integrations', integrationId);
    if (!integration) {
        console.error(`[sandboxDb] testConnection: Integration ${integrationId} not found.`);
        return;
    }
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500 + Math.random() * 800));
    
    const success = Math.random() > 0.3; // 70% chance of success
    const latency = (50 + Math.random() * 200).toFixed(0);

    const updatedFields: Partial<Integration> = {
        last_sync: new Date().toISOString(),
        status: success ? 'connected' : 'error',
        last_error: success ? '' : 'Simulated Error: Authentication failed (503)',
    };
    
    update<Integration>('config_integrations', integrationId, updatedFields);
    
    create<IntegrationLog>('integration_logs', {
        integration_id: integrationId,
        event: success ? 'Test Succeeded' : 'Test Failed',
        message: success ? `Connection successful. Latency: ${latency}ms` : 'Simulated Error: Authentication failed (503)',
    } as any);

    console.log(`[sandboxDb] testConnection: Test for ${integration.name} completed. Success: ${success}`);
};

const uploadFile = async (file: File, module: string, category: string): Promise<{ id: string, webViewLink: string }> => {
    console.log(`🧱 SANDBOX: Simulating upload for file: ${file.name}`);
    await new Promise(res => setTimeout(res, 500 + Math.random() * 800));

    const newAsset: Omit<MediaAsset, 'id'> = {
        drive_file_id: `sandbox_${generateId()}`,
        module,
        category,
        name: file.name,
        mime_type: file.type,
        size: file.size,
        url_public: URL.createObjectURL(file), // Key for sandbox mode
        uploaded_by: 'sandbox-user-01',
        created_at: new Date().toISOString()
    };
    
    const createdAsset = create<MediaAsset>('media_assets', newAsset);

    return Promise.resolve({ id: createdAsset.drive_file_id, webViewLink: createdAsset.url_public! });
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
    if (!tableName) throw new Error(`No table mapping found for key: ${key}`);
    return tableName;
};


// --- EXPORTED SERVICE OBJECT ---
// FIX: Converted sync methods to async to provide a consistent interface with supabaseService.
export const sandboxDb = {
    async getCollection<T>(path: string): Promise<T[]> { return Promise.resolve(getCollection(path)); },
    async getDocument<T>(path: string, id: string): Promise<T | null> { return Promise.resolve(get(path, id)); },
    async addDocument<T extends {id?: string}>(path: string, data: Omit<T, 'id'>): Promise<T> { return Promise.resolve(create(path, data)); },
    async updateDocument<T extends {id: string}>(path: string, id: string, data: Partial<T>): Promise<T> { return Promise.resolve(update(path, id, data)); },
    async deleteDocument(path: string, id: string): Promise<void> { return Promise.resolve(del(path, id)); },
    listenToCollection: subscribe,
    listenToDocument: <T extends { id: string }>(path: string, id: string, callback: (payload: T) => void) => {
        const handler = () => {
            const doc = get<T>(path, id);
            if (doc) callback(doc);
        };
        eventBus.addEventListener(path, handler);
        return { unsubscribe: () => eventBus.removeEventListener(path, handler) };
    },
    testIntegrationConnection: testConnection,
    uploadFile,
    getSettings: async (): Promise<AppData> => ({
        ...collections,
        catalogs: {
            paletas_cores: collections.config_color_palettes,
            cores_texturas: {
                tecido: collections.fabric_colors,
                ziper: collections.zipper_colors,
                forro: collections.lining_colors,
                puxador: collections.puller_colors,
                vies: collections.bias_colors,
                bordado: collections.embroidery_colors,
                texturas: collections.fabric_textures,
            },
            fontes_monogramas: collections.config_fonts,
        },
        logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
        sistema: collections.system_settings,
        config_supply_groups: collections.config_supply_groups,
        config_materials: collections.config_materials,
        contacts: collections.customers,
    } as AppData),
    addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) => 
        Promise.resolve(create(getTableNameForSetting(category, subTab, subSubTab), data)),
    updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) =>
        Promise.resolve(update(getTableNameForSetting(category, subTab, subSubTab), id, data)),
    deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) =>
        Promise.resolve(del(getTableNameForSetting(category, subTab, subSubTab), id)),
    updateSystemSettings: (settings: SystemSetting[]) => {
        settings.forEach(s => {
            const oldSetting = get<SystemSetting>('system_settings', s.id);
            if (oldSetting && oldSetting.value !== s.value) {
                create<SystemSettingsLog>('system_settings_logs', {
                    key: oldSetting.key,
                    old_value: oldSetting.value,
                    new_value: s.value,
                    source_module: 'SettingsEngine',
                    confidence: 1.0,
                    explanation: 'Alteração manual registrada pelo admin.',
                } as any);
            }
            update<SystemSetting>('system_settings', s.id, { value: s.value });
        });
        return Promise.resolve();
    },
    updateSystemSetting: async (key: string, newValue: any, source: string, confidence: number, explanation: string) => {
         const setting = getCollection<SystemSetting>('system_settings').find(s => s.key === key);
         if (!setting) throw new Error(`Setting not found: ${key}`);
         
         const oldValue = setting.value;
         const stringifiedValue = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
         
         // Log first
         create<SystemSettingsLog>('system_settings_logs', {
             key,
             old_value: oldValue,
             new_value: stringifiedValue,
             source_module: source,
             confidence,
             explanation,
         } as any);
         
         // Then update setting (this will not trigger a manual log)
         update<SystemSetting>('system_settings', setting.id, { value: stringifiedValue });
         
         return Promise.resolve();
    },
    getMaterials: async (): Promise<Material[]> => {
        const materials = getCollection<Material>('config_materials');
        const groups = getCollection<MaterialGroup>('config_supply_groups');
        return materials.map(m => ({
            ...m,
            config_supply_groups: groups.find(g => g.id === m.group_id)
        }));
    },
    getMaterialGroups: async (): Promise<MaterialGroup[]> => Promise.resolve(getCollection<MaterialGroup>('config_supply_groups')),
    addMaterial: async (material: any) => Promise.resolve(create<Material>('config_materials', material)),
    addMaterialGroup: async (group: any) => Promise.resolve(create<MaterialGroup>('config_supply_groups', group)),
    getOrders: async (): Promise<Order[]> => {
        const allOrders = getCollection<Order>('orders');
        const allItems = getCollection<OrderItem>('order_items');
        const allContacts = getCollection<Contact>('customers');
        return allOrders.map(o => ({
            ...o,
            items: allItems.filter(item => item.order_id === o.id),
            customers: allContacts.find(c => c.id === o.customer_id),
        }));
    },
    getOrder: async (id: string): Promise<Order | null> => {
        const order = get<Order>('orders', id);
        if (!order) return null;
        return {
            ...order,
            items: getCollection<OrderItem>('order_items').filter(i => i.order_id === id),
            customers: get<Contact>('customers', order.customer_id),
        }
    },
    updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => 
        Promise.resolve(update<Order>('orders', orderId, { status: newStatus })),
    addOrder: async (orderData: Partial<Order>) => {
        const orderNumber = `OLIE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
        const { items, ...orderToInsert } = orderData;
        const newOrder = create<Order>('orders', {
            ...orderToInsert,
            number: orderNumber,
        } as any);
        if (items && items.length > 0) {
            items.forEach(item => create<OrderItem>('order_items', { ...item, order_id: newOrder.id }));
        }
        // SIMULATE TRIGGER: Create notification
        create<Notification>('notifications', {
            user_id: 'sandbox-user-01',
            type: 'order_created',
            title: `Novo Pedido: ${newOrder.number}`,
            message: `Criado para ${get<Contact>('customers', newOrder.customer_id)?.name}`,
            link: `/orders`,
            is_read: false,
        } as any);
        return Promise.resolve(newOrder);
    },
    updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> =>
        Promise.resolve(update<Order>('orders', orderId, data)),
    getInventoryMovements: async (materialId: string) => 
        Promise.resolve(getCollection<InventoryMovement>('inventory_movements').filter(m => m.material_id === materialId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())),
    addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => {
        const movement = create<InventoryMovement>('inventory_movements', movementData as any);
        const balance = getCollection<InventoryBalance>('inventory_balances').find(b => b.material_id === movement.material_id && b.warehouse_id === movement.warehouse_id);
        if (balance) {
            const newStock = balance.current_stock + movement.quantity;
            update<InventoryBalance>('inventory_balances', balance.id, { current_stock: newStock });
        } else if (movement.warehouse_id) {
             create<InventoryBalance>('inventory_balances', {
                material_id: movement.material_id,
                warehouse_id: movement.warehouse_id,
                current_stock: movement.quantity,
                reserved_stock: 0,
             } as any);
        }
        return Promise.resolve(movement);
    },
    // FIX: Added transferStock implementation for sandbox mode.
    transferStock: async (transferData: any) => {
        const { material_id, from_warehouse_id, to_warehouse_id, quantity } = transferData;
        const allBalances = getCollection<InventoryBalance>('inventory_balances');
        const fromBalance = allBalances.find(b => b.material_id === material_id && b.warehouse_id === from_warehouse_id);
        const toBalance = allBalances.find(b => b.material_id === material_id && b.warehouse_id === to_warehouse_id);

        if (!fromBalance || fromBalance.current_stock < quantity) {
            throw new Error('Estoque insuficiente no armazém de origem.');
        }

        // Update from balance
        update<InventoryBalance>('inventory_balances', fromBalance.id, { current_stock: fromBalance.current_stock - quantity });
        
        // Update or create to balance
        if (toBalance) {
            update<InventoryBalance>('inventory_balances', toBalance.id, { current_stock: toBalance.current_stock + quantity });
        } else {
            create<InventoryBalance>('inventory_balances', {
                material_id,
                warehouse_id: to_warehouse_id,
                current_stock: quantity,
                reserved_stock: 0,
            } as any);
        }
        
        // Create movement log
        create<InventoryMovement>('inventory_movements', { ...transferData, created_at: new Date().toISOString() });
        
        return Promise.resolve();
    },
    createPO: async (poData: { supplier_id: string, items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[] }) => {
        const po_number = `PC-SB-${Date.now().toString().slice(-5)}`;
        const newPO = create<PurchaseOrder>('purchase_orders', {
            po_number,
            supplier_id: poData.supplier_id,
            status: 'draft',
            total: poData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
        } as any);

        const newItems = poData.items.map(item => {
            const material = get<Material>('config_materials', item.material_id!);
            return create<PurchaseOrderItem>('purchase_order_items', {
                ...item,
                po_id: newPO.id,
                received_quantity: 0,
                material_name: material?.name,
            } as any);
        });
        
        return Promise.resolve(newPO);
    },
    receivePOItems: async (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) => {
        const po = get<PurchaseOrder>('purchase_orders', poId);
        if (!po) throw new Error("Purchase Order not found");

        const poItems = getCollection<PurchaseOrderItem>('purchase_order_items').filter(i => i.po_id === poId);

        for (const received of receivedItems) {
            const item = poItems.find(i => i.id === received.itemId);
            if (item) {
                const newReceivedQty = item.received_quantity + received.receivedQty;
                update<PurchaseOrderItem>('purchase_order_items', item.id, { received_quantity: newReceivedQty });
                
                // Create inventory movement
                create<InventoryMovement>('inventory_movements', {
                    material_id: item.material_id,
                    type: 'in',
                    quantity: received.receivedQty,
                    reason: 'RECEBIMENTO_PO',
                    ref: po.po_number,
                } as any);
                
                // Update inventory balance
                const balance = getCollection<InventoryBalance>('inventory_balances').find(b => b.material_id === item.material_id);
                if (balance) {
                    update<InventoryBalance>('inventory_balances', balance.id, { current_stock: balance.current_stock + received.receivedQty });
                } else {
                     create<InventoryBalance>('inventory_balances', {
                         material_id: item.material_id,
                         current_stock: received.receivedQty,
                         reserved_stock: 0,
                     } as any);
                }
            }
        }

        // Check all items again to determine final status
        const updatedPoItems = getCollection<PurchaseOrderItem>('purchase_order_items').filter(i => i.po_id === poId);
        const allItemsReceived = updatedPoItems.every(i => i.received_quantity >= i.quantity);

        const newStatus = allItemsReceived ? 'received' : 'partial';
        update<PurchaseOrder>('purchase_orders', poId, { status: newStatus });
        
        return Promise.resolve();
    },
    getLogisticsData: async () => {
        // This now mirrors the logic from getOrders to ensure `items` are always included.
        const allOrders = getCollection<Order>('orders');
        const allItems = getCollection<OrderItem>('order_items');
        const allContacts = getCollection<Contact>('customers');
        const ordersWithDetails = allOrders.map(o => ({
            ...o,
            items: allItems.filter(item => item.order_id === o.id),
            customers: allContacts.find(c => c.id === o.customer_id),
        }));

        return {
            orders: ordersWithDetails,
            waves: getCollection<LogisticsWave>('logistics_waves'),
            shipments: getCollection<LogisticsShipment>('logistics_shipments'),
        };
    },
    getPurchasingData: async () => Promise.resolve({
        suppliers: getCollection<Supplier>('suppliers'),
        purchase_orders: getCollection<PurchaseOrder>('purchase_orders'),
        purchase_order_items: getCollection<PurchaseOrderItem>('purchase_order_items'),
    }),
    getFinanceData: async () => {
        const transactions = getCollection<FinanceTransaction>('finance_transactions');
        const accounts = getCollection<FinanceAccount>('finance_accounts');
        const categories = getCollection<FinanceCategory>('finance_categories');
        
        const transactionsWithDetails = transactions.map(t => ({
            ...t,
            account: accounts.find(a => a.id === t.account_id),
            category: categories.find(c => c.id === t.category_id)
        }));

        return Promise.resolve({
            accounts,
            categories,
            transactions: transactionsWithDetails,
            payables: getCollection<FinancePayable>('finance_payables'),
            receivables: getCollection<FinanceReceivable>('finance_receivables'),
        });
    },
};