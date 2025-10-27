
import { SettingsData, User, SettingsCategory, AnyItem, SystemSetting } from '../types';

// --- MOCK DATA ---
const mockUser: User = {
  uid: 'admin123',
  email: 'admin@oliehub.com',
  role: 'AdminGeral',
};

const mockData: SettingsData = {
  integrations: [
    { id: 'vnda1', name: 'VNDA', apiKey: 'vnd_key_xxxxxx', secret: 'vnd_secret_yyyyy', enabled: true },
    { id: 'wpp1', name: 'WhatsApp', apiKey: 'wpp_key_xxxxxx', enabled: false },
    { id: 'pagarme1', name: 'Pagar.me', apiKey: 'pg_key_xxxxxx', secret: 'pg_secret_yyyyy', enabled: true },
    { id: 'insta1', name: 'Instagram', apiKey: 'insta_key_xxxxxx', enabled: false },
    { id: 'correios1', name: 'Correios', apiKey: 'cor_key_xxxxxx', secret: 'cor_secret_yyyyy', enabled: true },
  ],
  catalogs: {
    paletas_cor: [
      { id: 'pc1', name: 'Paleta Olie Base', code: 'OLIE_BASE' },
      { id: 'pc2', name: 'Paleta Black & White', code: 'BW' },
    ],
    categorias_produto: [
        { id: 'cp1', name: 'Bolsas Maternidade', code: 'CAT01' },
        { id: 'cp2', name: 'Acessórios', code: 'CAT02' },
    ],
    cores_tecido: [
      { id: 'ct1', name: 'Rosa Bebê', code: 'T001', hexColor: '#F4C2C2' },
      { id: 'ct2', name: 'Azul Serenity', code: 'T002', hexColor: '#92A8D1' },
    ],
    cores_ziper: [
        { id: 'cz1', name: 'Dourado', code: 'Z001', hexColor: '#FFD700' },
        { id: 'cz2', name: 'Prateado', code: 'Z002', hexColor: '#C0C0C0' },
    ],
    cores_vies: [
        { id: 'cv1', name: 'Viés Bege', code: 'V001', hexColor: '#F5F5DC' },
        { id: 'cv2', name: 'Viés Preto', code: 'V002', hexColor: '#000000' },
    ],
    cores_forro: [
        { id: 'cf1', name: 'Forro Impermeável Branco', code: 'F001', hexColor: '#FFFFFF' },
        { id: 'cf2', name: 'Forro Cetim Rosé', code: 'F002', hexColor: '#E0BFB8' },
    ]
  },
  materials: {
    grupos_insumo: [
      { id: 'gi1', name: 'Têxteis', group: 'TEX' },
      { id: 'gi2', name: 'Ferragens', group: 'FER' },
    ],
    materiais_basicos: [
      { id: 'mat1', name: 'Nylon 600D Preto', group: 'Têxteis', supplier: 'Fornecedor A', texture: '{"gramatura": 600}' },
      { id: 'mat2', name: 'Mosquetão Ouro', group: 'Ferragens', supplier: 'Fornecedor C' },
    ],
  },
  logistica: { // Renamed from 'statuses'
    pedidos: [
      { id: 'stat1', name: 'Pagamento Aprovado', color: '#28a745', description: 'O pedido foi pago e confirmado.' },
      { id: 'stat4', name: 'Cancelado', color: '#dc3545', description: 'O pedido foi cancelado.' },
    ],
    producao: [
      { id: 'stat2', name: 'Em Produção', color: '#ffc107', description: 'O pedido está sendo produzido.' },
    ],
    entregas: [ // Formerly 'logistica' sub-category
      { id: 'stat3', name: 'Enviado', color: '#17a2b8', description: 'O pedido foi despachado para entrega.' },
    ],
  },
  sistema: [
    { id: 'currency', name: 'Moeda', value: JSON.stringify({ code: 'BRL', symbol: 'R$' }), category: 'system', description: 'Moeda padrão para transações e relatórios.' },
    { id: 'timezone', name: 'Fuso Horário', value: JSON.stringify({ iana: 'America/Sao_Paulo' }), category: 'system', description: 'Fuso horário para datas e agendamentos.' },
    { id: 'order_prefix', name: 'Prefixo de Pedido', value: JSON.stringify({ prefix: 'OLI-' }), category: 'orders', description: 'Texto inicial para todos os números de pedido.' },
    { id: 'lead_times', name: 'Lead Times', value: JSON.stringify({ production_days: 7, sla_minutes: 120 }), category: 'system', description: 'Prazos para produção e atendimento.' },
  ],
  aparencia: {},
  seguranca: {},
};
// --- END MOCK DATA ---


const delay = <T,>(data: T, ms = 300): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms));
  
const getCategoryData = (category: SettingsCategory, subCategory?: string | null) => {
    if (subCategory && (category === 'catalogs' || category === 'materials' || category === 'logistica')) {
        const nestedData = mockData[category] as Record<string, AnyItem[]>;
        if (!nestedData[subCategory]) throw new Error(`Subcategory ${subCategory} not found in ${category}`);
        return nestedData[subCategory];
    }
    // Handle non-nested categories that are arrays
    if (Array.isArray(mockData[category])) {
        return mockData[category] as AnyItem[];
    }
    // Handle other cases or throw error
    throw new Error(`Category ${category} could not be retrieved.`);
}

export const firestoreService = {
  getCurrentUser: (): Promise<User> => {
    return delay<User>(mockUser, 100);
  },

  getSettings: (): Promise<SettingsData> => {
    return delay<SettingsData>(mockData);
  },

  updateSetting: async <T extends AnyItem>(category: SettingsCategory, itemId: string, data: Partial<T>, subCategory?: string | null): Promise<T> => {
    const dataList = getCategoryData(category, subCategory) as T[];
    const itemIndex = dataList.findIndex(item => item.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found');
    
    const updatedItem = { ...dataList[itemIndex], ...data };
    dataList[itemIndex] = updatedItem;
    
    return delay<T>(updatedItem);
  },

  addSetting: async <T extends AnyItem>(category: SettingsCategory, data: Omit<T, 'id'>, subCategory?: string | null): Promise<T> => {
    const dataList = getCategoryData(category, subCategory) as T[];
    const newItem = { ...data, id: `new_${Date.now()}` } as T;
    dataList.push(newItem);
    return delay<T>(newItem);
  },

  deleteSetting: async (category: SettingsCategory, itemId: string, subCategory?: string | null): Promise<void> => {
    const dataList = getCategoryData(category, subCategory);
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
  }
};
