
export interface User {
  uid: string;
  email: string;
  role: 'AdminGeral' | 'Administrativo' | 'Produção' | 'Vendas' | 'Financeiro' | 'Conteúdo';
}

export interface BaseItem {
  id: string;
  name: string;
}

export interface Integration extends BaseItem {
  apiKey: string;
  secret?: string;
  enabled: boolean;
}

export interface CatalogItem extends BaseItem {
  code: string;
  hexColor?: string;
}

export interface Material extends BaseItem {
  group: string;
  supplier?: string;
  texture?: string;
}

export interface Status extends BaseItem {
  color: string;
  description: string;
}

// Replaces GlobalConfig, value is a stringified JSON
export interface SystemSetting {
  id: string; // The setting key, e.g., "currency"
  name: string; // The display name, e.g., "Moeda"
  value: string;
  category: string;
  description: string;
}


// Nested data structures
export type CatalogData = Record<string, CatalogItem[]>;
export type MaterialData = Record<string, Material[]>;
export type LogisticaData = Record<string, Status[]>;

export type SettingsData = {
  integrations: Integration[];
  catalogs: CatalogData;
  materials: MaterialData;
  logistica: LogisticaData;
  sistema: SystemSetting[];
  aparencia: {};
  seguranca: {};
};

export type SettingsCategory = keyof SettingsData;

export type AnyItem = Integration | CatalogItem | Material | Status | SystemSetting;

export type FieldConfig = {
    key: string;
    label: string;
    type: 'text' | 'color' | 'checkbox' | 'textarea';
};
