import {
    AppData, Product, ProductCategory, Contact, Order, OrderItem, ProductionOrder, Task, TaskStatus,
    // FIX: Import missing 'AnyProduct' type to resolve reference errors.
    AnyProduct,
    // FIX: Added missing type imports
    ProductionTask, ProductionQualityCheck, SystemAudit,
    InventoryBalance, InventoryMovement, Conversation, Message, AnyContact,
    FabricColor, ZipperColor, BiasColor, MonogramFont, SystemSetting, LogisticsWave, LogisticsShipment,
    MarketingCampaign, MarketingSegment, MarketingTemplate, Supplier, PurchaseOrder, PurchaseOrderItem,
    OrderPayment, OrderTimelineEvent, OrderNote, AnalyticsKPI, ExecutiveKPI, AIInsight, OrderStatus, AnySettingsItem, SettingsCategory, FinanceAccount, FinanceCategory, FinancePayable, FinanceReceivable, FinanceTransaction, SystemSettingsLog, Integration, IntegrationLog, MediaAsset,
    MaterialGroup, Material, InitializerLog, InitializerSyncState, InitializerAgent, ColorPalette, LiningColor, PullerColor, EmbroideryColor, FabricTexture,
    WorkflowRule, Notification, Warehouse, ProductionAudit, Collection, AnalyticsSnapshot, BOMComponent, ProductVariant, IntegrationStatus, MoldLibrary, ProductionRoute, ProductionOrderStatus
} from '../types';

// --- SEED DATA ---
const generateId = () => crypto.randomUUID();
// FIX: Added 'delay' function definition to resolve 'Cannot find name' error.
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// FIX: Added warehouse seed data.
const warehouses: Warehouse[] = [
    { id: 'w1', name: 'Armazém Principal', location: 'Bloco A' },
    { id: 'w2', name: 'Armazém Secundário', location: 'Bloco C' },
];

// FIX: Renamed 'contacts' to 'customers' to align with the database schema ('customers' table).
const customers: Contact[] = [
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
        // FIX: The 'embroidery' object must be nested inside a 'personalization' property to match the ProductAttributes type.
        attributes: {
            personalization: {
                embroidery: {
                    enabled: true,
                    allowed_font_ids: ['mf1'],
                    allowed_color_ids: ['ec1', 'ec3'],
                    max_chars: 15,
                }
            }
        },
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

const product_variants: ProductVariant[] = [
  {
    id: 'pv1',
    product_base_id: 'p1',
    sku: 'BT-CLA-01-M-FC1-ZC1',
    name: 'Bolsa Tote Clássica M - Bege Claro / Zíper Dourado',
    configuration: { size: 's1', tecido_externo: 'fc1', ziper: 'zc1' },
    price_modifier: 0,
    final_price: 299.90,
    bom: [
        { material_id: 'mat1', quantity_per_unit: 1.5 },
        { material_id: 'mat2', quantity_per_unit: 1 },
        { material_id: 'mat3', quantity_per_unit: 10 }
    ],
  },
  {
    id: 'pv2',
    product_base_id: 'p1',
    sku: 'BT-CLA-01-G-FC2-ZC2',
    name: 'Bolsa Tote Clássica G - Azul Marinho / Zíper Prateado',
    configuration: { size: 's2', tecido_externo: 'fc2', ziper: 'zc2' },
    price_modifier: 20.00,
    final_price: 319.90,
    bom: [
        { material_id: 'mat1', quantity_per_unit: 1.8 },
        { material_id: 'mat2', quantity_per_unit: 1.2 },
        { material_id: 'mat3', quantity_per_unit: 12 }
    ],
  },
];

const order_items: OrderItem[] = [
    { id: 'oi1', order_id: 'o1', product_id: 'p1', product_name: 'Bolsa Tote Clássica', quantity: 1, unit_price: 299.90, total: 299.90, config_json: { fabricColor: 'Bege' } },
    { id: 'oi2', order_id: 'o2', product_id: 'p2', product_name: 'Nécessaire de Viagem', quantity: 2, unit_price: 129.90, total: 259.80, config_json: { embroidery: { enabled: true, text: 'CD', font: 'mf1', color: '#E6B800' } } },
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
    { id: 'po1', po_number: 'OP-2024-001', product_id: 'p1', variant_sku: 'BT-CLA-01-M-FC1-ZC1', product_name: 'Bolsa Tote Clássica', status: 'em_andamento', operator: 'Maria', quantity: 5, due_date: '2024-08-10', notes: 'Cliente pediu urgência.', created_at: '2024-08-01', updated_at: '2024-08-01', priority: 'alta', order_code: 'OP-2024-001', assigned_to: 'Maria', start_date: '2024-08-01', end_date: '2024-08-10' },
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
const embroidery_colors: EmbroideryColor[] = [
    { id: 'ec1', name: 'Linha Ouro', hex: '#E6B800', palette_id: 'pal1', is_active: true, thread_type: 'metallic' },
    { id: 'ec2', name: 'Linha Prata', hex: '#C0C0C0', palette_id: 'pal1', is_active: true, thread_type: 'metallic' },
    { id: 'ec3', name: 'Linha Preta', hex: '#222222', palette_id: 'pal1', is_active: true, thread_type: 'polyester' },
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

const suppliers: Supplier[] = [
    { id: 'sup1', name: 'Fornecedor de Tecidos S.A.', document: '12.345.678/0001-99', email: 'contato@tecidos.com', phone: '(11) 2222-3333', payment_terms: '30D', lead_time_days: 15, rating: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'sup2', name: 'Zíperes & Cia', document: '98.765.432/0001-11', email: 'vendas@ziperes.com.br', phone: '(47) 3333-4444', payment_terms: '45D', lead_time_days: 10, rating: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const config_materials: Material[] = [
    { id: 'mat1', name: 'Linho Bege Cru', sku: 'TEC-LNH-BG-01', group_id: 'sg1', unit: 'm', is_active: true, created_at: new Date().toISOString(), url_public: 'https://images.unsplash.com/photo-1624833914853-33e4f7a7587a?q=80&w=2070&auto=format&fit=crop', description: 'Tecido de linho misto, ideal para estrutura e acabamento sofisticado.', supplier_id: 'sup1', care_instructions: 'Lavar a seco.', technical_specs: { composition: '70% Linho, 30% Viscose', weight_gsm: 210 } },
    { id: 'mat2', name: 'Zíper YKK #5 Dourado', sku: 'ZIP-YKK-5-DO', group_id: 'sg2', unit: 'un', is_active: true, created_at: new Date().toISOString(), url_public: 'https://images.unsplash.com/photo-1588185969094-1525a435d1d3?q=80&w=2070&auto=format&fit=crop', description: 'Zíper de nylon com dentes metálicos dourados, bitola 5, ideal para peças maiores.', supplier_id: 'sup2', technical_specs: { thickness_mm: 5, composition: 'Nylon e Metal' } },
    { id: 'mat3', name: 'Linha de Costura Branca', sku: 'LIN-COS-BR-01', group_id: 'sg3', unit: 'm', is_active: true, created_at: new Date().toISOString(), url_public: 'https://images.unsplash.com/photo-1599837563122-6b60012bd2b6?q=80&w=1974&auto=format&fit=crop', description: 'Linha de poliéster de alta resistência para costura de sintéticos.', supplier_id: 'sup2', technical_specs: { composition: '100% Poliéster' } },
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
    { id: 'ms1', name: 'Clientes VIP', description: 'Clientes com mais de 5 compras.', rules: [{ id: 'ms1-r1', field: 'total_spent', operator: 'greater_than', value: 1500 }, { id: 'ms1-r2', field: 'order_count', operator: 'greater_than', value: 5 }], audience_size: 42 },
    { id: 'ms2', name: 'Inativos (6 meses)', description: 'Clientes que não compram há 6 meses.', rules: [{ id: 'ms2-r1', field: 'last_purchase_days', operator: 'greater_than', value: 180 }], audience_size: 215 },
];

const marketing_templates: MarketingTemplate[] = [
    { id: 'mt1', name: 'Template Lançamento', channel: 'email', content_preview: '<h1>Nova Coleção Chegou!</h1><p>Confira as novidades...</p>' },
    { id: 'mt2', name: 'Template Promo WhatsApp', channel: 'whatsapp', content_preview: 'Oi, {nome}! Temos uma oferta especial para você hoje! 🛍️' },
];

const purchase_order_items: PurchaseOrderItem[] = [
    { id: 'poi1', po_id: 'pc1', material_id: 'mat1', material_name: 'Linho Bege Cru', quantity: 50, received_quantity: 50, unit_price: 42.00, total: 2100.00 },
    { id: 'poi2', po_id: 'pc2', material_id: 'mat2', material_name: 'Zíper YKK #5 Dourado', quantity: 200, received_quantity: 100, unit_price: 3.00, total: 600.00 },
    { id: 'poi3', po_id: 'pc2', material_id: 'mat3', material_name: 'Linha de Costura Branca', quantity: 10, received_quantity: 0, unit_price: 15.00, total: 150.00 },
    { id: 'poi4', po_id: 'pc3', material_id: 'mat1', material_name: 'Linho Bege Cru', quantity: 20, received_quantity: 0, unit_price: 45.50, total: 910.00 },
];

const purchase_orders: PurchaseOrder[] = [
    { id: 'pc1', po_number: 'PC-2024-001', supplier_id: 'sup1', supplier: suppliers[0], status: 'received', items: [purchase_order_items[0]], total: 2100.00, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), issued_at: new Date(Date.now() - 9 * 86400000).toISOString(), received_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'pc2', po_number: 'PC-2024-002', supplier_id: 'sup2', supplier: suppliers[1], status: 'partial', items: [], total: 750.00, created_at: new Date(Date.now() - 8 * 86400000).toISOString(), updated_at: new Date(Date.now() - 2 * 86400000).toISOString(), issued_at: new Date(Date.now() - 7 * 86400000).toISOString(), expected_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString() },
    { id: 'pc3', po_number: 'PC-2024-003', supplier_id: 'sup1', supplier: suppliers[0], status: 'draft', items: [], total: 910.00, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mold_library: MoldLibrary[] = [];
const production_routes: ProductionRoute[] = [];

// --- IN-MEMORY DATABASE ---
// This object aggregates all our seed data into a single "database"
const db: AppData = {
    // FIX: Add missing 'production_audit' property to satisfy the AppData type.
    production_audit: [],
    // FIX: Add missing 'production_quality_checks' property to satisfy the AppData type.
    production_quality_checks: [],
    // FIX: Add missing 'production_tasks' property to satisfy the AppData type.
    production_tasks: [],
    // FIX: Add missing 'system_audit' property to satisfy the AppData type.
    system_audit: [],
    warehouses,
    // FIX: Renamed 'contacts' to 'customers' to align with the database schema ('customers' table).
    customers,
    product_categories,
    products,
    product_variants,
    order_items,
    orders: orders as any, // Cast to avoid deep type checking issues with items/customers
    production_orders,
    task_statuses,
    tasks,
    inventory_balances,
    inventory_movements,
    // FIX: Changed property name from `system_settings` to `sistema` to match AppData type.
    sistema: system_settings,
    logistics_waves,
    logistics_shipments,
    marketing_campaigns,
    marketing_segments,
    marketing_templates,
    suppliers,
    purchase_orders,
    purchase_order_items,
    collections: collectionsSeed,
    mold_library,
    production_routes,
    // Catalogs (nested for clarity in settings)
    catalogs: {
        paletas_cores: [],
        cores_texturas: {
            tecido: fabric_colors,
            ziper: zipper_colors,
            vies: bias_colors,
            forro: [],
            puxador: [],
            bordado: embroidery_colors,
            texturas: [],
        },
        fontes_monogramas: config_fonts,
    },
    // Materials
    config_supply_groups,
    config_materials,
    // The rest would be empty arrays to satisfy AppData type
    logistica: { metodos_entrega: [], calculo_frete: [], tipos_embalagem: [], tipos_vinculo: [] },
    system_settings_logs: [],
    config_integrations: [],
    integration_logs: [],
    media_assets: [],
    // FIX: The 'conversations' and 'messages' properties do not exist on AppData. Moved them into the 'omnichannel' property.
    omnichannel: { conversations: conversations, messages: messages, quotes: [] },
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

// FIX: Moved this helper function above the event bus logic to resolve a reference error.
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
    // Initial call to populate data
    callback();
    return { unsubscribe: () => eventBus.removeEventListener(path, callback) };
};
// FIX: Add helper function for settings table mapping, needed for mock implementations.
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
        // Simulate network delay
        return new Promise(resolve => {
            setTimeout(() => {
                const data = getCollection<T>(table);
                 if (data.length === 0) {
                    console.warn(`[sandboxDb] No data found for table "${table}". Returning empty array.`);
                }
                resolve(JSON.parse(JSON.stringify(data))); // Deep copy to prevent mutation issues
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
        
        // SIMULATE TRIGGER for v4.2 pipeline
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
    
    // FIX: Implement addManyDocuments to support bulk creation of variants.
// FIX: Swapped parameter order to match usage and supabaseService.
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
    
    // FIX: Add missing updateProductionOrderStatus function.
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
    
    // FIX: Add missing methods to match supabaseService and resolve errors.
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

    // FIX: Update getInventoryMovements to support filtering by material or product variant.
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
        
        // Simulate trigger to update balance
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
                
                // Simulate trigger to add to inventory
                const material = db.config_materials.find(m => m.id === item.material_id);
                if (material) {
                    await sandboxDb.addInventoryMovement({
                        material_id: material.id,
                        type: 'in',
                        quantity: received.receivedQty,
                        reason: 'RECEBIMENTO_PO',
                        ref: po.po_number,
                        warehouse_id: 'w1', // default to main warehouse
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