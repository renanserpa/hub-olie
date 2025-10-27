
import { SettingsData, User, SettingsCategory, AnyItem } from '../types';

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
    cores_tecido: [
      { id: 'ct1', name: 'Rosa Bebê', code: 'T001', hexColor: '#F4C2C2' },
      { id: 'ct2', name: 'Azul Serenity', code: 'T002', hexColor: '#92A8D1' },
    ],
    cores_ziper: [
        { id: 'cz1', name: 'Dourado', code: 'Z001', hexColor: '#FFD700' },
        { id: 'cz2', name: 'Prateado', code: 'Z002', hexColor: '#C0C0C0' },
    ],
    bordados: [
        { id: 'cb1', name: 'Fonte Cursiva', code: 'B001' },
    ],
    categorias_produto: [
        { id: 'cp1', name: 'Bolsas Maternidade', code: 'CAT01' },
        { id: 'cp2', name: 'Acessórios', code: 'CAT02' },
    ]
  },
  materials: {
    grupos_insumos: [
      { id: 'gi1', name: 'Tecidos', group: 'Principal' },
      { id: 'gi2', name: 'Metais', group: 'Acabamento' },
    ],
    linhas: [
      { id: 'mat1', name: 'Linha de Poliéster', group: 'Linhas', supplier: 'Fornecedor A' },
      { id: 'mat2', name: 'Linha de Nylon', group: 'Linhas', supplier: 'Fornecedor B' },
    ],
    ferragens: [
        { id: 'fe1', name: 'Mosquetão Ouro', group: 'Metais', supplier: 'Fornecedor C' },
    ]
  },
  statuses: {
    pedidos: [
      { id: 'stat1', name: 'Pagamento Aprovado', color: '#28a745', description: 'O pedido foi pago e confirmado.' },
      { id: 'stat4', name: 'Cancelado', color: '#dc3545', description: 'O pedido foi cancelado.' },
    ],
    producao: [
      { id: 'stat2', name: 'Em Produção', color: '#ffc107', description: 'O pedido está sendo produzido.' },
    ],
    logistica: [
      { id: 'stat3', name: 'Enviado', color: '#17a2b8', description: 'O pedido foi despachado para entrega.' },
    ],
    financeiro: [
        { id: 'stf1', name: 'Reembolsado', color: '#6c757d', description: 'O valor foi devolvido ao cliente.' },
    ]
  },
  globalConfigs: [
    { id: 'glob1', name: 'Unidade de Medida (Tecido)', value: 'Metro', unit: 'm' },
    { id: 'glob2', name: 'Unidade de Medida (Zíper)', value: 'Unidade', unit: 'un' },
    { id: 'glob3', name: 'Unidade de Medida (Linha)', value: 'Cone', unit: 'cone' },
  ],
};
// --- END MOCK DATA ---


const delay = <T,>(data: T, ms = 300): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms));
  
const getCategoryData = (category: SettingsCategory, subCategory?: string | null) => {
    if (subCategory && (category === 'catalogs' || category === 'materials' || category === 'statuses')) {
        const nestedData = mockData[category] as Record<string, AnyItem[]>;
        if (!nestedData[subCategory]) throw new Error(`Subcategory ${subCategory} not found in ${category}`);
        return nestedData[subCategory];
    }
    return mockData[category] as AnyItem[];
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
};
