
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

export interface GlobalConfig extends BaseItem {
  value: string;
  unit: string;
}

// Nested data structures
export type CatalogData = Record<string, CatalogItem[]>;
export type MaterialData = Record<string, Material[]>;
export type StatusData = Record<string, Status[]>;

export type SettingsData = {
  integrations: Integration[];
  catalogs: CatalogData;
  materials: MaterialData;
  statuses: StatusData;
  globalConfigs: GlobalConfig[];
};

export type SettingsCategory = keyof SettingsData;

export type AnyItem = Integration | CatalogItem | Material | Status | GlobalConfig;

// FIX: Added FieldConfig type here to be used across the application.
export type FieldConfig = {
    key: string;
    label: string;
    type: 'text' | 'color' | 'checkbox' | 'textarea';
};
