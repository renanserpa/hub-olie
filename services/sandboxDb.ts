import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    // FIX: Added missing type imports
    ProductionTask, ProductionQualityCheck, SystemAudit,
    InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont, SystemSetting, LogisticsWave, LogisticsShipment,
    MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem,
    OrderPayment, OrderTimelineEvent, OrderNote, AnalyticsKPI, ExecutiveKPI, AIInsight, OrderStatus, AnySettingsItem, SettingsCategory, FinanceAccount, FinanceCategory, FinancePayable, FinanceReceivable, FinanceTransaction, SystemSettingsLog, Integration, IntegrationLog, MediaAsset,
    MaterialGroup, Material, InitializerLog, InitializerSyncState, InitializerAgent, ColorPalette, LiningColor, PullerColor, EmbroideryColor, FabricTexture,
    WorkflowRule, Notification, Warehouse, ProductionAudit, Collection, AnalyticsSnapshot, BOMComponent
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

// FIX: Renamed 'collections' to 'collectionsSeed' to avoid redeclaration error.
const collectionsSeed: Collection[] = [
    { id: 'col1', name: 'Coleção Essenciais', description: 'Produtos clássicos e atemporais.'},
    { id: 'col2', name: 'Coleção POOL', description: 'Produtos com tema de piscina, impermeáveis e fáceis de limpar.'}
];

const products: Product[] = [
    { 
        id: 'p1', name: 'Bolsa Tote Clássica', description: 'Uma bolsa espaçosa e elegante para o dia a dia, feita com materiais de alta qualidade.', 
        base_sku: 'BT-CLA-01', base_price: 299.90, category: 'Bolsas', status: 'Ativo', images:[], 
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date().toISOString(), collection_ids: ['col1'],
        available_sizes: [ { id: 's1', name: 'M' }, { id: 's2', name: 'G' } ],
        configurable_parts: [
            { id: 'part1', key: 'tecido_externo', name: 'Tecido Externo', options_source: 'fabric_colors' },
            { id: 'part2', key: 'ziper', name: 'Zíper', options_source: 'zipper_colors' },
        ],
        combination_rules: [],
        base_bom: [{ material_id: 'mat1', quantity_per_unit: 1.5 }, { material_id: 'mat2', quantity_per_unit: 1 }]
    },
    { 
        id: 'p2', name: 'Nécessaire de Viagem', description: 'Perfeita para organizar seus itens de higiene e maquiagem em viagens.', 
        base_sku: 'NV-GRD-01', base_price: 129.90, category: 'Nécessaires', status: 'Ativo', images:[], 
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date().toISOString(), collection_ids: ['col1', 'col2'],
        configurable_parts: [
            { id: 'part3', key: 'tecido_externo', name: 'Tecido Externo', options_source: 'fabric_colors' },
            { id: 'part4', key: 'ziper', name: 'Zíper', options_source: 'zipper_colors' },
            { id: 'part5', key: 'forro', name: 'Forro Interno', options_source: 'lining_colors' },
        ],
        base_bom: [{ material_id: 'mat1', quantity_per_unit: 0.5 }, { material_id: 'mat2', quantity_per_unit: 1 }, { material_id: 'mat3', quantity_per_unit: 5 }]
    },
    { 
        id: 'p3', name: 'Mochila Urbana', description: 'Design moderno e funcional, ideal para o trabalho ou passeios.', 
        base_sku: 'MU-PRE-01', base_price: 450.00, category: 'Mochilas', status: 'Rascunho', images:[], 
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString(), 
        base_bom: [] 
    },
    { 
        id: 'p4', name: 'Estojo Lápis (Modelo Antigo)', description: 'Um estojo simples e prático.', 
        base_sku: 'EL-OLD-01', base_price: 79.90, category: 'Nécessaires', status: 'Descontinuado', images:[], 
        createdAt: new Date(Date.now() - 100 * 86400000).toISOString(), updatedAt: new Date().toISOString(), 
        base_bom: [] 
    },
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

// FIX: Updated production_orders to match the new ProductionOrder interface from types.ts.
// FIX: Changed status values from English to Portuguese to match the ProductionOrderStatus type.
const production_orders: ProductionOrder[] = [
    { id: 'po1', po_number: 'OP-2024-001', product_id: 'p1', product_name: 'Bolsa Tote Clássica', status: 'em_andamento', operator: 'Maria', quantity: 5, due_date: '2024-08-10', notes: 'Cliente pediu urgência.', created_at: '2024-08-01', updated_at: '2024-08-01', priority: 'alta', order_code: 'OP-2024-001', assigned_to: 'Maria', start_date: '2024-08-01', end_date: '2024-08-10' },
    { id: 'po2', po_number: 'OP-2024-002', product_id: 'p2', product_name: 'Nécessaire de Viagem', status: 'novo', operator: 'João', quantity: 10, due_date: '2024-08-15', notes: '', created_at: '2024-08-05', updated_at: '2024-08-05', priority: 'normal', order_code: 'OP-2024-002', assigned_to: 'João', start_date: '2024-08-05', end_date: '2024-08-15' },
    { id: 'po3', po_number: 'OP-2024-003', product_id: 'p3', product_name: 'Mochila Urbana', status: 'em_espera', operator: 'Maria', quantity: 2, due_date: '2024-08-05', notes: 'Verificar zíper.', created_at: '2024-07-28', updated_at: '2024-07-28', priority: 'normal', order_code: 'OP-2024-003', assigned_to: 'Maria', start_date: '2024-07-28', end_date: '2024-08-05' },
    { id: 'po4', po_number: 'OP-2024-004', product_id: 'p1', product_name: 'Bolsa Tote Clássica', status: 'finalizado', operator: 'João', quantity: 3, due_date: '2024-08-02', notes: '', created_at: '2024-07-25', updated_at: '2024-07-25', priority: 'normal', order_code: 'OP-2024-004', assigned_to: 'João', start_date: '2024-07-25', end_date: '2024-08-02' },
    { id: 'po5', po_number: 'OP-2024-005', product_id: 'p2', product_name: 'Nécessaire de Viagem', status: 'em_espera', operator: 'Maria', quantity: 8, due_date: '2024-08-12', notes: 'Falta de material.', created_at: '2024-08-02', updated_at: '2024-08-02', priority: 'baixa', order_code: 'OP-2024-005', assigned_to: 'Maria', start_date: '2024-08-02', end_date: '2024-08-12' },
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

const production_audit: ProductionAudit[] = [];

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
    { id: 'pc1', po_number: 'PC-2024-001', supplier_id: 'sup1', supplier: suppliers[0], status: 'received', items: [purchase_order_items[0]], total: 2100.00, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), issued_at: new Date(Date.now() - 9 * 86400000).toISOString(), received_at: new Date(Date.