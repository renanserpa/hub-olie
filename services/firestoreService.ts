

import { AppData, User, SettingsCategory, AnySettingsItem, SystemSetting, Order, Contact, Product, OrderStatus, CatalogData, MaterialData, LogisticaData } from '../types';

// --- MOCK DATA ---
const mockUser: User = {
  uid: 'admin123',
  email: 'admin@oliehub.com',
  role: 'AdminGeral',
};

const mockContacts: Contact[] = [
    { id: 'contact1', name: 'Ana Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', address: { street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zip: '01234-567' } },
    { id: 'contact2', name: 'Carlos Pereira', email: 'carlos.p@example.com', phone: '(21) 91234-5678', address: { street: 'Avenida Copacabana, 456', city: 'Rio de Janeiro', state: 'RJ', zip: '22020-001' } },
];

const mockProducts: Product[] = [
    { id: 'prod1', name: 'Bolsa Maternidade Classic', price: 299.90, stock_quantity: 50 },
    { id: 'prod2', name: 'Mochila Aventura Kids', price: 189.90, stock_quantity: 30 },
    { id: 'prod3', name: 'Necessaire Viagem', price: 79.90, stock_quantity: 100 },
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

const mockData: AppData = {
  catalogs: {
    paletas_cores: [
      { id: 'pc1', name: 'Paleta Olie Base', descricao: 'Cores padrão da marca', is_active: true },
      { id: 'pc2', name: 'Paleta Verão 2024', descricao: 'Cores vibrantes para a estação', is_active: true },
      { id: 'pc3', name: 'Paleta Neutros', descricao: 'Tons sóbrios e elegantes', is_active: false },
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
  getContacts: (): Promise<Contact[]> => delay(mockData.contacts),

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
  }
};
