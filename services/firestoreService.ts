

import { AppData, User, SettingsCategory, AnySettingsItem, SystemSetting, Order, Contact, Product, OrderStatus, CatalogData, MaterialData, LogisticaData, ProductionOrder, OmnichannelData, InventoryBalance, InventoryMovement, TaskStatus, Task, AnyContact } from '../types';

// --- MOCK DATA ---
const mockUser: User = {
  uid: 'admin123',
  email: 'carolina.pommot@olie.com.br',
  role: 'AdminGeral',
};

const mockContacts: Contact[] = [
    { 
        id: 'contact1', 
        name: 'Ana Silva', 
        email: 'ana.silva@example.com', 
        phone: '11987654321', 
        whatsapp: '11987654321',
        instagram: '@anasilva',
        cpf_cnpj: '123.456.789-00',
        birth_date: '1990-05-15',
        address: { 
            street: 'Rua das Flores', 
            number: '123',
            complement: 'Apto 4B',
            neighborhood: 'Jardins',
            city: 'São Paulo', 
            state: 'SP', 
            zip: '01234-567' 
        } 
    },
    { 
        id: 'contact2', 
        name: 'Carlos Pereira', 
        email: 'carlos.p@example.com', 
        phone: '21912345678', 
        address: { 
            street: 'Avenida Copacabana',
            number: '456',
            city: 'Rio de Janeiro', 
            state: 'RJ', 
            zip: '22020-001',
            neighborhood: 'Copacabana'
        } 
    },
    { 
        id: 'contact3',
        name: 'Renan Serpa',
        email: 'serparenan@gmail.com',
        phone: '65992834900',
        whatsapp: '65992834900',
        instagram: '@serparenan',
        address: {
            street: '',
            number: '',
            city: 'Cuiabá',
            state: 'MT',
            zip: '',
            neighborhood: ''
        }
    }
];

const mockProducts: Product[] = [
    { id: 'prod1', name: 'Bolsa Maternidade Classic', price: 299.90, stock_quantity: 50 },
    { id: 'prod2', name: 'Mochila Aventura Kids', price: 189.90, stock_quantity: 30 },
    { id: 'prod3', name: 'Necessaire Viagem', price: 79.90, stock_quantity: 100 },
    { id: 'prod4', name: 'Jaqueta Moletom', price: 220.00, stock_quantity: 40 },
];

const mockOrders: Order[] = [
    { 
        id: 'order1', order_number: 'OLI-00001', contact_id: 'contact1', status: 'paid',
        items: [{ id: 'item1', product_id: 'prod1', product_name: 'Bolsa Maternidade Classic', quantity: 1, unit_price: 299.90, total: 299.90, config_json: { color: '#F4C2C2', text: 'Baby Ana' } }],
        subtotal: 299.90, discount: 0, shipping_cost: 25.00, total: 324.90,
        payments: { status: 'paid', method: 'credit_card', transactionId: 'txn_123' },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString()
    },
    { 
        id: 'order2', order_number: 'OLI-00002', contact_id: 'contact2', status: 'in_production',
        items: [{ id: 'item2', product_id: 'prod2', product_name: 'Mochila Aventura Kids', quantity: 2, unit_price: 189.90, total: 379.80 }],
        subtotal: 379.80, discount: 20, shipping_cost: 30.00, total: 389.80,
        payments: { status: 'paid', method: 'pix', transactionId: 'txn_456' },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString()
    },
    { 
        id: 'order3', order_number: 'OLI-00003', contact_id: 'contact1', status: 'pending_payment',
        items: [{ id: 'item3', product_id: 'prod3', product_name: 'Necessaire Viagem', quantity: 3, unit_price: 79.90, total: 239.70 }],
        subtotal: 239.70, discount: 0, shipping_cost: 15.00, total: 254.70,
        payments: { status: 'pending', method: 'link', checkoutUrl: '#' },
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
];

const mockProductionOrders: ProductionOrder[] = [
    {
        id: 'po1', po_number: 'OP-2024-001', product_id: 'prod1', quantity: 10, status: 'em_andamento', priority: 'alta',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Cliente VIP, priorizar a produção desta ordem. Bordado especial "Baby Ana".',
        steps_completed: 2, steps_total: 5,
    },
    {
        id: 'po2', po_number: 'OP-2024-002', product_id: 'prod2', quantity: 25, status: 'planejado', priority: 'normal',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        notes: '',
        steps_completed: 1, steps_total: 4,
    },
    {
        id: 'po3', po_number: 'OP-2024-003', product_id: 'prod3', quantity: 50, status: 'novo', priority: 'normal',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        notes: 'Aguardando definição de cor do zíper pelo cliente.',
        steps_completed: 0, steps_total: 3,
    },
     {
        id: 'po4', po_number: 'OP-2024-004', product_id: 'prod1', quantity: 5, status: 'finalizado', priority: 'baixa',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: '',
        steps_completed: 5, steps_total: 5,
    },
     {
        id: 'po5', po_number: 'OP-2024-005', product_id: 'prod2', quantity: 15, status: 'em_espera', priority: 'alta',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Aguardando chegada de tecido estampado.',
        steps_completed: 1, steps_total: 4,
    }
];

const mockTaskStatuses: TaskStatus[] = [
  { id: 'status-1', name: 'Fila', color: '#E5E7EB', position: 1 }, // gray-200
  { id: 'status-2', name: 'Corte', color: '#DBEAFE', position: 2 }, // blue-200
  { id: 'status-3', name: 'Bordado', color: '#F3E8FF', position: 3 }, // purple-100
  { id: 'status-4', name: 'Costura', color: '#FEF3C7', position: 4 }, // amber-100
  { id: 'status-5', name: 'QA', color: '#FFEDD5', position: 5 }, // orange-100
];

const mockTasks: Task[] = [
    { id: 'task-1', title: 'Jaqueta Moletom', status_id: 'status-3', client_name: 'Cliente', quantity: 1, position: 1 },
    { id: 'task-2', title: 'Bolsa Maternidade', status_id: 'status-4', client_name: 'Ana Silva', quantity: 1, position: 1 },
    { id: 'task-3', title: 'Mochila Aventura', status_id: 'status-3', client_name: 'Carlos Pereira', quantity: 2, position: 2 },
    { id: 'task-4', title: 'Necessaire Viagem', status_id: 'status-1', client_name: 'Ana Silva', quantity: 3, position: 1 },
];


const mockInventoryBalances: InventoryBalance[] = [
    { material_id: 'mat1', quantity_on_hand: 150.5, quantity_reserved: 25, low_stock_threshold: 50, location: 'Prateleira A-1', last_updated_at: new Date().toISOString() },
    { material_id: 'mat2', quantity_on_hand: 800, quantity_reserved: 350, low_stock_threshold: 200, location: 'Caixa B-3', last_updated_at: new Date().toISOString() },
];

const mockInventoryMovements: InventoryMovement[] = [
    { id: 'move1', material_id: 'mat1', type: 'in', quantity: 200, reason: 'compra', reference_id: 'PO-001', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'move2', material_id: 'mat1', type: 'out', quantity: -50, reason: 'consumo_producao', reference_id: 'OP-2024-001', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'move3', material_id: 'mat1', type: 'adjustment', quantity: 0.5, reason: 'contagem', notes: 'Ajuste de final de mês', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'move4', material_id: 'mat2', type: 'in', quantity: 1000, reason: 'compra', reference_id: 'PO-002', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'move5', material_id: 'mat2', type: 'out', quantity: -200, reason: 'consumo_producao', reference_id: 'OP-2024-002', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const mockData: AppData = {
  catalogs: {
    paletas_cores: [
      { id: 'pc1', name: 'Paleta Olie Base', descricao: 'Cores padrão da marca', is_active: true },
      { id: 'pc2', name: 'Paleta Verão 2024', descricao: 'Cores vibrantes para a estação', is_active: true },
      { id: 'pc3', name: 'Paleta Neutros', descricao: 'Tons sóbios e elegantes', is_active: false },
    ],
    cores_texturas: {
        tecido: [{ id: 'ct1', name: 'Rosa Bebê', hex: '#F4C2C2', palette_id: 'pc1', is_active: true }],
        ziper: [{ id: 'cz1', name: 'Dourado', hex: '#FFD700', palette_id: 'pc1', is_active: true }],
        forro: [{ id: 'cf1', name: 'Forro Impermeável Branco', hex: '#FFFFFF', palette_id: 'pc1', is_active: true }],
        puxador: [{ id: 'cpull1', name: 'Puxador Ouro Velho', hex: '#C8AD7F', palette_id: 'pc1', is_active: true }],
        vies: [{ id: 'cv1', name: 'Viés Bege', hex: '#F5F5DC', palette_id: 'pc1', is_active: true }],
        bordado: [{ id: 'cb1', name: 'Linha Rosé Gold', hex: '#B76E79', palette_id: 'pc2', thread_type: 'metallic', is_active: true }],
        texturas: [{ id: 'tex1', name: 'Poá Clássico', thumbnail_url: '/poa.png', tile_url: '/poa_tile.png', texture_type: 'poa', is_active: true }],
    },
    fontes_monogramas: [
        { id: 'font1', name: 'Brush Script MT', style: 'script', category: 'script', preview_url: '/brush_script.png', font_file_url: '/brush.ttf', is_active: true }
    ],
  },
  materials: {
    grupos_suprimento: [
      { id: 'gi1', name: 'Têxteis', codigo: 'TEX', descricao: 'Tecidos, sintéticos e malhas' },
      { id: 'gi2', name: 'Ferragens', codigo: 'FER', descricao: 'Metais, zíperes e aviamentos' },
    ],
    materiais_basicos: [
      { id: 'mat1', name: 'Nylon 600D Preto', codigo: 'NYL600', supply_group_id: 'gi1', unit: 'm', default_cost: 28.90 },
      { id: 'mat2', name: 'Mosquetão Ouro', codigo: 'MOSQ01', supply_group_id: 'gi2', unit: 'un', default_cost: 3.50 },
    ],
  },
  logistica: { 
    metodos_entrega: [
        { id: 'me1', type: 'correios', enabled: true, notes: 'Integração via Melhor Envio' },
        { id: 'me2', type: 'motoboy', enabled: true, notes: 'Apenas para Grande SP' },
        { id: 'me3', type: 'retirada', enabled: false, notes: 'Retirada no ateliê com hora marcada' },
    ],
    calculo_frete: [
        { id: 'main', radius_km: 50, base_fee: 10, fee_per_km: 1.5, free_shipping_threshold: 299.90 }
    ],
    tipos_embalagem: [
        { id: 'te1', name: 'Caixa P', codigo: 'CX-P', material: 'papelão', weight_limit_g: 1000, dimensions_json: '{"w":20,"h":15,"d":10}'}
    ],
    tipos_vinculo: [
        { id: 'tv1', name: 'CLT', codigo: 'CLT', payroll_effects_json: '{"fgts": true, "inss": true}'}
    ]
  },
  sistema: [
    { id: 'currency', name: 'Moeda', value: JSON.stringify({ code: 'BRL', symbol: 'R$' }), category: 'system', description: 'Moeda padrão para transações e relatórios.' },
    { id: 'timezone', name: 'Fuso Horário', value: JSON.stringify({ iana: 'America/Sao_Paulo' }), category: 'system', description: 'Fuso horário para datas e agendamentos.' },
    { id: 'order_prefix', name: 'Prefixo de Pedido', value: JSON.stringify({ prefix: 'OLI-' }), category: 'orders', description: 'Texto inicial para todos os números de pedido.' },
  ],
  midia: {},
  orders: mockOrders,
  contacts: mockContacts,
  products: mockProducts,
  production_orders: mockProductionOrders,
  task_statuses: mockTaskStatuses,
  tasks: mockTasks,
  omnichannel: { conversations: [], messages: [], quotes: [] },
  inventory_balances: mockInventoryBalances,
  inventory_movements: mockInventoryMovements,
};
// --- END MOCK DATA ---

const delay = <T,>(data: T, ms = 300): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms));
  
const getCategoryData = (category: SettingsCategory, subCategory?: string | null, subSubCategory?: string | null): AnySettingsItem[] => {
    const mainCategoryData = mockData[category];

    if (subCategory && mainCategoryData && typeof mainCategoryData === 'object' && !Array.isArray(mainCategoryData)) {
        const subCategoryData = (mainCategoryData as any)[subCategory];

        if (subSubCategory && subCategoryData && typeof subCategoryData === 'object' && !Array.isArray(subCategoryData)) {
            const subSubCategoryData = (subCategoryData as any)[subSubCategory];
            if (!subSubCategoryData) throw new Error(`Sub-subcategory ${subSubCategory} not found in ${category}.${subCategory}`);
            return subSubCategoryData;
        }

        if (!subCategoryData) throw new Error(`Subcategory ${subCategory} not found in ${category}`);
        return subCategoryData;
    }
    
    if (Array.isArray(mainCategoryData)) {
        return mainCategoryData as AnySettingsItem[];
    }

    throw new Error(`Category ${category} could not be retrieved.`);
}

export const firestoreService = {
  getCurrentUser: (): Promise<User> => {
    return delay<User>(mockUser, 100);
  },

  getSettings: (): Promise<AppData> => {
    return delay<AppData>(mockData);
  },

  updateSetting: async <T extends AnySettingsItem>(category: SettingsCategory, itemId: string, data: Partial<T>, subCategory?: string | null, subSubCategory?: string | null): Promise<T> => {
    const dataList = getCategoryData(category, subCategory, subSubCategory) as T[];
    const itemIndex = dataList.findIndex(item => item.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found');
    
    const updatedItem = { ...dataList[itemIndex], ...data };
    dataList[itemIndex] = updatedItem;
    
    return delay<T>(updatedItem);
  },

  addSetting: async <T extends AnySettingsItem>(category: SettingsCategory, data: Omit<T, 'id'>, subCategory?: string | null, subSubCategory?: string | null): Promise<T> => {
    const dataList = getCategoryData(category, subCategory, subSubCategory) as T[];
    const newItem = { ...data, id: `new_${Date.now()}` } as T;
    dataList.push(newItem);
    return delay<T>(newItem);
  },

  deleteSetting: async (category: SettingsCategory, itemId: string, subCategory?: string | null, subSubCategory?: string | null): Promise<void> => {
    const dataList = getCategoryData(category, subCategory, subSubCategory);
    const itemIndex = dataList.findIndex(item => item.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found');

    dataList.splice(itemIndex, 1);
    return delay<void>(undefined);
  },

  updateSystemSettings: async (settingsToUpdate: SystemSetting[]): Promise<void> => {
    settingsToUpdate.forEach(setting => {
        const index = mockData.sistema.findIndex(s => s.id === setting.id);
        if (index !== -1) {
            mockData.sistema[index] = setting;
        }
    });
    return delay<void>(undefined);
  },

  // --- Orders Service ---
  getOrders: (): Promise<Order[]> => {
    const ordersWithContacts = mockData.orders.map(order => ({
        ...order,
        contact: mockData.contacts.find(c => c.id === order.contact_id)
    }));
    return delay(ordersWithContacts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  },

  getProducts: (): Promise<Product[]> => delay(mockData.products),
  
  // --- Contacts Service ---
  getContacts: (): Promise<Contact[]> => delay(mockData.contacts),
  
  addContact: async (contactData: AnyContact): Promise<Contact> => {
    const newContact: Contact = {
        ...contactData,
        id: `contact_${Date.now()}`,
    };
    mockData.contacts.push(newContact);
    return delay(newContact);
  },

  updateContact: async (contactId: string, data: Partial<AnyContact>): Promise<Contact> => {
    const contactIndex = mockData.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) throw new Error("Contact not found");

    const updatedContact = { ...mockData.contacts[contactIndex], ...data };
    mockData.contacts[contactIndex] = updatedContact;

    return delay(updatedContact);
  },


  addOrder: async (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> => {
    const maxOrderNum = mockData.orders.reduce((max, order) => {
        const num = parseInt(order.order_number.split('-')[1]);
        return num > max ? num : max;
    }, 0);
    const newOrderNumber = `OLI-${(maxOrderNum + 1).toString().padStart(5, '0')}`;

    const newOrder: Order = {
        ...orderData,
        id: `order_${Date.now()}`,
        order_number: newOrderNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    mockData.orders.push(newOrder);

    // Simulate stock decrement
    newOrder.items.forEach(item => {
        const productIndex = mockData.products.findIndex(p => p.id === item.product_id);
        if (productIndex !== -1) {
            mockData.products[productIndex].stock_quantity -= item.quantity;
        }
    });

    return delay(newOrder);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const orderIndex = mockData.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    mockData.orders[orderIndex].status = status;
    mockData.orders[orderIndex].updated_at = new Date().toISOString();
    
    return delay(mockData.orders[orderIndex]);
  },
  
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => {
    const orderIndex = mockData.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    const updatedOrder = { ...mockData.orders[orderIndex], ...data, updated_at: new Date().toISOString() };
    mockData.orders[orderIndex] = updatedOrder;

    return delay(updatedOrder);
  },

  // --- Production Service ---
  getProductionOrders: (): Promise<ProductionOrder[]> => {
    const ordersWithProducts = mockData.production_orders.map(po => ({
        ...po,
        product: mockData.products.find(p => p.id === po.product_id)
    }));
    return delay(ordersWithProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  },
  
  getTaskStatuses: (): Promise<TaskStatus[]> => {
      return delay(mockData.task_statuses.sort((a, b) => a.position - b.position));
  },

  getTasks: (): Promise<Task[]> => {
      return delay(mockData.tasks);
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const taskIndex = mockData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    const updatedTask = { ...mockData.tasks[taskIndex], ...updates };
    mockData.tasks[taskIndex] = updatedTask;

    return delay(updatedTask);
  },

  // --- Inventory Service ---
  getInventoryBalances: (): Promise<InventoryBalance[]> => {
    const balancesWithMaterials = mockData.inventory_balances.map(balance => ({
      ...balance,
      material: mockData.materials.materiais_basicos.find(m => m.id === balance.material_id),
    }));
    return delay(balancesWithMaterials);
  },

  getInventoryMovements: (materialId: string): Promise<InventoryMovement[]> => {
    const movements = mockData.inventory_movements
      .filter(m => m.material_id === materialId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return delay(movements);
  },

  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement> => {
    const newMovement: InventoryMovement = {
        ...movementData,
        id: `move_${Date.now()}`,
        created_at: new Date().toISOString(),
    };
    mockData.inventory_movements.push(newMovement);

    // Update balance
    const balanceIndex = mockData.inventory_balances.findIndex(b => b.material_id === movementData.material_id);
    if (balanceIndex !== -1) {
        mockData.inventory_balances[balanceIndex].quantity_on_hand += movementData.quantity;
        mockData.inventory_balances[balanceIndex].last_updated_at = newMovement.created_at;
    } else {
        // Create new balance if it doesn't exist
        mockData.inventory_balances.push({
            material_id: movementData.material_id,
            quantity_on_hand: movementData.quantity,
            quantity_reserved: 0,
            low_stock_threshold: 10, // Default value
            last_updated_at: newMovement.created_at,
        });
    }

    return delay(newMovement);
  },

  getAllBasicMaterials: () => {
    return delay(mockData.materials.materiais_basicos);
  },
};